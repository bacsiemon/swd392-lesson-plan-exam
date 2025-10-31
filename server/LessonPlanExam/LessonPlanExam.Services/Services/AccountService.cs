using App.Infrastructure.BaseClasses;
using App.Infrastructure.Exceptions;
using App.Infrastructure.Helpers;
using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Services
{
    public class AccountService : IAccountService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly JwtSettings _jwtSettings;

        public AccountService(
            IUnitOfWork unitOfWork, 
            IHttpContextAccessor httpContextAccessor,
            IJwtService jwtService,
            IEmailService emailService,
            IOptions<JwtSettings> jwtSettings)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _jwtService = jwtService;
            _emailService = emailService;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<BaseResponse> GetAccountsAsync(int page, int size)
        {
            // Explicitly use string-based includes to avoid ambiguity
            var response = await _unitOfWork.AccountRepository.GetPaginatedAsync(
                page, 
                size, 
                firstPage: 1, 
                orderBy: q => q.OrderByDescending(x => x.Id),
                includeProperties: new string[0]); // Empty string array
            
            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = response.Items.Select(e => e.ToResponse()),
                AdditionalData = response.AdditionalData
            };
        }

        /// <summary>
        /// Example method demonstrating predicate usage - gets only active accounts with strongly typed includes
        /// </summary>
        public async Task<BaseResponse> GetActiveAccountsAsync(int page, int size)
        {
            // Use strongly typed includes explicitly
            var response = await _unitOfWork.AccountRepository.GetPaginatedAsync(
                page, 
                size, 
                firstPage: 1,
                predicate: acc => acc.IsActive == true && acc.DeletedAt == null, 
                orderBy: q => q.OrderByDescending(x => x.CreatedAt),
                includeProperties: new Expression<Func<LessonPlanExam.Repositories.Models.Account, object>>[0]); // Empty expression array
            
            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = response.Items.Select(e => e.ToResponse()),
                AdditionalData = response.AdditionalData
            };
        }

        /// <summary>
        /// Extracts the user ID from the current JWT token in the HTTP context
        /// </summary>
        /// <returns>The user ID if the token is valid and present</returns>
        /// <exception cref="UnauthorizedException">Thrown when no token is found or token is invalid</exception>
        public int GetCurrentUserId()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
            {
                throw new UnauthorizedException("HTTP_CONTEXT_NOT_AVAILABLE");
            }

            // Try to get user ID from claims first (if JWT authentication is configured)
            var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier) 
                             ?? context.User?.FindFirst("sub") 
                             ?? context.User?.FindFirst("userId")
                             ?? context.User?.FindFirst("id");

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userIdFromClaims))
            {
                return userIdFromClaims;
            }

            // Fallback: Try to extract from Authorization header directly
            var authorizationHeader = context.Request.Headers.Authorization.FirstOrDefault();
            if (string.IsNullOrEmpty(authorizationHeader))
            {
                throw new UnauthorizedException("AUTHORIZATION_HEADER_MISSING");
            }

            if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedException("INVALID_AUTHORIZATION_HEADER_FORMAT");
            }

            var token = authorizationHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(token))
            {
                throw new UnauthorizedException("JWT_TOKEN_MISSING");
            }

            try
            {
                var jwtHandler = new JwtSecurityTokenHandler();
                var jsonToken = jwtHandler.ReadJwtToken(token);

                // Try different claim names that might contain the user ID
                var userIdFromToken = jsonToken.Claims.FirstOrDefault(x => 
                    x.Type == ClaimTypes.NameIdentifier || 
                    x.Type == "sub" || 
                    x.Type == "userId" || 
                    x.Type == "id")?.Value;

                if (string.IsNullOrEmpty(userIdFromToken))
                {
                    throw new UnauthorizedException("USER_ID_NOT_FOUND_IN_TOKEN");
                }

                if (!int.TryParse(userIdFromToken, out var userId))
                {
                    throw new UnauthorizedException("INVALID_USER_ID_FORMAT_IN_TOKEN");
                }

                return userId;
            }
            catch (Exception ex) when (!(ex is UnauthorizedException))
            {
                throw new UnauthorizedException("INVALID_JWT_TOKEN");
            }
        }

        #region Authentication Methods

        public async Task<BaseResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                // Find user by email
                var accounts = await _unitOfWork.AccountRepository.GetAllAsync();
                var account = accounts.FirstOrDefault(x => x.NormalizedEmail == request.Email.ToUpperInvariant());

                if (account == null)
                {
                    return new BaseResponse
                    {
                        StatusCode = 401,
                        Message = "INVALID_EMAIL_OR_PASSWORD"
                    };
                }

                // Verify password
                if (!PasswordHelper.VerifyPassword(request.Password, account.PasswordHash))
                {
                    return new BaseResponse
                    {
                        StatusCode = 401,
                        Message = "INVALID_EMAIL_OR_PASSWORD"
                    };
                }

                // Check if account is active
                if (account.IsActive != true || account.DeletedAt.HasValue)
                {
                    return new BaseResponse
                    {
                        StatusCode = 401,
                        Message = "ACCOUNT_DISABLED"
                    };
                }

                // Generate tokens
                var accessToken = _jwtService.GenerateAccessToken(account);
                var refreshToken = _jwtService.GenerateRefreshToken();
                var tokenExpiry = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpireMinutes);
                var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpireDays);

                // Save refresh token
                await _jwtService.SaveRefreshTokenAsync(account.Id, refreshToken, refreshTokenExpiry);

                // Update last login
                account.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.SaveChangesAsync();

                var loginResponse = account.ToLoginResponse(accessToken, refreshToken, tokenExpiry, refreshTokenExpiry);

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "LOGIN_SUCCESS",
                    Data = loginResponse
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"LOGIN_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Check if email already exists
                var accounts = await _unitOfWork.AccountRepository.GetAllAsync();
                var existingAccount = accounts.FirstOrDefault(x => x.NormalizedEmail == request.Email.ToUpperInvariant());

                if (existingAccount != null)
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "EMAIL_ALREADY_EXISTS"
                    };
                }

                // Validate password strength
                if (!PasswordHelper.IsStrongPassword(request.Password))
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "PASSWORD_NOT_STRONG_ENOUGH"
                    };
                }

                // Create new account
                var account = request.ToEntity();
                account.PasswordHash = PasswordHelper.HashPassword(request.Password);

                _unitOfWork.AccountRepository.Create(account);
                await _unitOfWork.SaveChangesAsync();

                // Send welcome email
                try
                {
                    await _emailService.SendWelcomeEmailAsync(account.Email, account.FullName ?? account.Email);
                }
                catch (Exception emailEx)
                {
                    // Log email error but don't fail registration
                    Console.WriteLine($"Failed to send welcome email: {emailEx.Message}");
                }

                var registerResponse = account.ToRegisterResponse();

                return new BaseResponse
                {
                    StatusCode = 201,
                    Message = "REGISTRATION_SUCCESS",
                    Data = registerResponse
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"REGISTRATION_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            try
            {
                // Find user by email
                var accounts = await _unitOfWork.AccountRepository.GetAllAsync();
                var account = accounts.FirstOrDefault(x => x.NormalizedEmail == request.Email.ToUpperInvariant());

                if (account == null)
                {
                    // Return success even if email doesn't exist (security best practice)
                    return new BaseResponse
                    {
                        StatusCode = 200,
                        Message = "PASSWORD_RESET_EMAIL_SENT"
                    };
                }

                // Check if account is active
                if (account.IsActive != true || account.DeletedAt.HasValue)
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "ACCOUNT_DISABLED"
                    };
                }

                // Generate reset token
                var resetToken = PasswordHelper.GenerateRandomToken(6);
                
                // Store reset token and expiry (you need to add these fields to Account model)
                // account.PasswordResetToken = PasswordHelper.HashPassword(resetToken);
                // account.PasswordResetExpiry = DateTime.UtcNow.AddMinutes(15); // 15 minutes expiry
                account.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                // Send reset email
                try
                {
                    await _emailService.SendPasswordResetEmailAsync(account.Email, resetToken, account.FullName ?? account.Email);
                }
                catch (Exception emailEx)
                {
                    return new BaseResponse
                    {
                        StatusCode = 500,
                        Message = $"FAILED_TO_SEND_EMAIL: {emailEx.Message}"
                    };
                }

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "PASSWORD_RESET_EMAIL_SENT"
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"FORGOT_PASSWORD_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            // Note: This feature requires PasswordResetToken and PasswordResetExpiry fields in Account model
            return new BaseResponse
            {
                StatusCode = 501,
                Message = "RESET_PASSWORD_FEATURE_NOT_IMPLEMENTED_YET - Need to add PasswordResetToken and PasswordResetExpiry fields to Account model"
            };
        }

        public async Task<BaseResponse> ChangePasswordAsync(ChangePasswordRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                var accounts = await _unitOfWork.AccountRepository.GetAllAsync();
                var account = accounts.FirstOrDefault(x => x.Id == currentUserId);

                if (account == null)
                {
                    return new BaseResponse
                    {
                        StatusCode = 404,
                        Message = "ACCOUNT_NOT_FOUND"
                    };
                }

                // Verify current password
                if (!PasswordHelper.VerifyPassword(request.CurrentPassword, account.PasswordHash))
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "INVALID_CURRENT_PASSWORD"
                    };
                }

                // Validate new password strength
                if (!PasswordHelper.IsStrongPassword(request.NewPassword))
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "PASSWORD_NOT_STRONG_ENOUGH"
                    };
                }

                // Update password
                account.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
                account.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                // Revoke all refresh tokens for security
                await _jwtService.RevokeAllRefreshTokensAsync(account.Id);

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "PASSWORD_CHANGED_SUCCESS"
                };
            }
            catch (UnauthorizedException)
            {
                throw; // Re-throw unauthorized exceptions
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"CHANGE_PASSWORD_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            try
            {
                // Validate refresh token (implement proper validation in JwtService)
                if (!_jwtService.ValidateRefreshToken(request.RefreshToken, 0)) // You'll need to modify this
                {
                    return new BaseResponse
                    {
                        StatusCode = 401,
                        Message = "INVALID_REFRESH_TOKEN"
                    };
                }

                // For now, return error since refresh token validation needs proper implementation
                return new BaseResponse
                {
                    StatusCode = 501,
                    Message = "REFRESH_TOKEN_FEATURE_NOT_IMPLEMENTED"
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"REFRESH_TOKEN_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> LogoutAsync()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Revoke all refresh tokens for the user
                await _jwtService.RevokeAllRefreshTokensAsync(currentUserId);

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "LOGOUT_SUCCESS"
                };
            }
            catch (UnauthorizedException)
            {
                throw; // Re-throw unauthorized exceptions
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"LOGOUT_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> GetCurrentUserProfileAsync()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                var accounts = await _unitOfWork.AccountRepository.GetAllAsync();
                var account = accounts.FirstOrDefault(x => x.Id == currentUserId);

                if (account == null)
                {
                    return new BaseResponse
                    {
                        StatusCode = 404,
                        Message = "ACCOUNT_NOT_FOUND"
                    };
                }

                var profileResponse = account.ToProfileResponse();

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "SUCCESS",
                    Data = profileResponse
                };
            }
            catch (UnauthorizedException)
            {
                throw; // Re-throw unauthorized exceptions
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"GET_PROFILE_ERROR: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Xóa tài khoản theo ID (Chỉ dành cho Admin)
        /// Soft delete - đánh dấu tài khoản là đã xóa thay vì xóa hẳn khỏi database
        /// </summary>
        /// <param name="accountId">ID của tài khoản cần xóa</param>
        /// <returns>Kết quả xóa tài khoản</returns>
        public async Task<BaseResponse> DeleteAccountAsync(int accountId)
        {
            try
            {
                // Kiểm tra tài khoản có tồn tại không
                var existingAccount = await _unitOfWork.AccountRepository.GetByIdAsync(accountId);
                if (existingAccount == null)
                {
                    return new BaseResponse
                    {
                        StatusCode = 404,
                        Message = "ACCOUNT_NOT_FOUND"
                    };
                }

                // Kiểm tra tài khoản đã bị xóa trước đó chưa
                if (existingAccount.DeletedAt.HasValue)
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "ACCOUNT_ALREADY_DELETED"
                    };
                }

                // Không cho phép xóa chính tài khoản Admin đang thực hiện thao tác
                var currentUserId = GetCurrentUserId();
                if (existingAccount.Id == currentUserId)
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "CANNOT_DELETE_YOUR_OWN_ACCOUNT"
                    };
                }

                // Thực hiện soft delete - đánh dấu là đã xóa
                existingAccount.DeletedAt = DateTime.UtcNow;
                existingAccount.IsActive = false;
                existingAccount.UpdatedAt = DateTime.UtcNow;

                // Cập nhật vào database
                _unitOfWork.AccountRepository.Update(existingAccount);
                await _unitOfWork.SaveChangesAsync();

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "ACCOUNT_DELETED_SUCCESSFULLY",
                    Data = new
                    {
                        Id = existingAccount.Id,
                        Email = existingAccount.Email,
                        FullName = existingAccount.FullName,
                        DeletedAt = existingAccount.DeletedAt
                    }
                };
            }
            catch (UnauthorizedException)
            {
                throw; // Re-throw unauthorized exceptions
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"DELETE_ACCOUNT_ERROR: {ex.Message}"
                };
            }
        }

        #endregion
    }
}

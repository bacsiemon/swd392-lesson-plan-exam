using App.Infrastructure.BaseClasses;
using App.Infrastructure.Exceptions;
using App.Infrastructure.Helpers;
using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using LessonPlanExam.Repositories.Enums;
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

        /// <summary>
        /// Extracts the user role from the current JWT token in the HTTP context
        /// </summary>
        /// <returns>The user role if the token is valid and present</returns>
        /// <exception cref="UnauthorizedException">Thrown when no token is found or token is invalid</exception>
        public EUserRole GetCurrentUserRole()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
            {
                throw new UnauthorizedException("HTTP_CONTEXT_NOT_AVAILABLE");
            }

            // Try to get user role from claims first (if JWT authentication is configured)
            var roleClaim = context.User?.FindFirst(ClaimTypes.Role) 
                           ?? context.User?.FindFirst("role") 
                           ?? context.User?.FindFirst("userRole")
                           ?? context.User?.FindFirst("roleEnum");

            if (roleClaim != null)
            {
                // Try to parse as enum value first (0, 1, 2)
                if (int.TryParse(roleClaim.Value, out var roleInt) && Enum.IsDefined(typeof(EUserRole), roleInt))
                {
                    return (EUserRole)roleInt;
                }

                // Try to parse as enum name (Admin, Teacher, Student)
                if (Enum.TryParse<EUserRole>(roleClaim.Value, true, out var roleEnum))
                {
                    return roleEnum;
                }
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

                // Try different claim names that might contain the user role
                var roleFromToken = jsonToken.Claims.FirstOrDefault(x => 
                    x.Type == ClaimTypes.Role || 
                    x.Type == "role" || 
                    x.Type == "userRole" || 
                    x.Type == "roleEnum")?.Value;

                if (string.IsNullOrEmpty(roleFromToken))
                {
                    throw new UnauthorizedException("USER_ROLE_NOT_FOUND_IN_TOKEN");
                }

                // Try to parse as enum value first (0, 1, 2)
                if (int.TryParse(roleFromToken, out var roleIntFromToken) && Enum.IsDefined(typeof(EUserRole), roleIntFromToken))
                {
                    return (EUserRole)roleIntFromToken;
                }

                // Try to parse as enum name (Admin, Teacher, Student)
                if (Enum.TryParse<EUserRole>(roleFromToken, true, out var roleEnumFromToken))
                {
                    return roleEnumFromToken;
                }

                throw new UnauthorizedException("INVALID_USER_ROLE_FORMAT_IN_TOKEN");
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

        public async Task<BaseResponse> RegisterStudentAsync(StudentRegisterRequest request)
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

                // Create student entity
                var student = request.ToStudentEntity(account.Id);
                _unitOfWork.StudentRepository.Create(student);
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

                var studentRegisterResponse = account.ToStudentRegisterResponse(student);

                return new BaseResponse
                {
                    StatusCode = 201,
                    Message = "STUDENT_REGISTRATION_SUCCESS",
                    Data = studentRegisterResponse
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"STUDENT_REGISTRATION_ERROR: {ex.Message}"
                };
            }
        }

        public async Task<BaseResponse> RegisterTeacherAsync(TeacherRegisterRequest request)
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

                // Create teacher entity
                var teacher = request.ToTeacherEntity(account.Id);
                _unitOfWork.TeacherRepository.Create(teacher);
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

                var teacherRegisterResponse = account.ToTeacherRegisterResponse(teacher);

                return new BaseResponse
                {
                    StatusCode = 201,
                    Message = "TEACHER_REGISTRATION_SUCCESS",
                    Data = teacherRegisterResponse
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"TEACHER_REGISTRATION_ERROR: {ex.Message}"
                };
            }
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

        /// <summary>
        /// Lấy danh sách tất cả accounts phân loại theo role - chỉ dành cho Admin
        /// Trả về danh sách Teachers và Students (không bao gồm Admin)
        /// </summary>
        /// <returns>BaseResponse chứa AllAccountsResponse với danh sách phân loại theo role</returns>
        public async Task<BaseResponse> GetAllAccountsAsync()
        {
            try
            {
                // Lấy tất cả accounts
                var allAccounts = await _unitOfWork.AccountRepository.GetAllAsync();

                // Filter accounts: chưa bị xóa và không phải Admin (role != 0)
                var activeAccounts = allAccounts
                    .Where(account => account.DeletedAt == null && (int)account.RoleEnum != 0)
                    .OrderBy(x => x.RoleEnum)
                    .ThenBy(x => x.FullName)
                    .ToList();

                // Phân loại accounts theo role
                var teachers = activeAccounts
                    .Where(account => (int)account.RoleEnum == 1) // Teachers
                    .Select(account => new AccountSummary
                    {
                        Id = account.Id,
                        Email = account.Email,
                        FullName = account.FullName,
                        Phone = account.Phone,
                        Role = account.RoleEnum,
                        IsActive = account.IsActive,
                        EmailVerified = account.EmailVerified,
                        CreatedAt = account.CreatedAt,
                        UpdatedAt = account.UpdatedAt
                    })
                    .ToList();

                var students = activeAccounts
                    .Where(account => (int)account.RoleEnum == 2) // Students
                    .Select(account => new AccountSummary
                    {
                        Id = account.Id,
                        Email = account.Email,
                        FullName = account.FullName,
                        Phone = account.Phone,
                        Role = account.RoleEnum,
                        IsActive = account.IsActive,
                        EmailVerified = account.EmailVerified,
                        CreatedAt = account.CreatedAt,
                        UpdatedAt = account.UpdatedAt
                    })
                    .ToList();

                // Tạo response object
                var response = new AllAccountsResponse
                {
                    Teachers = teachers,
                    Students = students,
                    TotalTeachers = teachers.Count,
                    TotalStudents = students.Count
                };

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = $"Lấy danh sách thành công. Có {response.TotalTeachers} giáo viên và {response.TotalStudents} học sinh.",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"GET_ALL_ACCOUNTS_ERROR: {ex.Message}"
                };
            }
        }

        #endregion

        #region OTP Password Reset Methods

        /// <summary>
        /// Gửi OTP qua email để reset password
        /// </summary>
        public async Task<BaseResponse> ForgotPasswordWithOtpAsync(ForgotPasswordWithOtpRequest request)
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
                        Message = "OTP_SENT_SUCCESS"
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

                // Generate OTP using OtpHelper (6 digits, expires in 5 minutes)
                var otp = OtpHelper.GenerateOtp(account.Email, length: 6, expirationMinutes: 5);

                // Send OTP email
                try
                {
                    await _emailService.SendOtpResetPasswordEmailAsync(
                        account.Email, 
                        otp, 
                        account.FullName ?? account.Email
                    );
                }
                catch (Exception emailEx)
                {
                    // Remove OTP if email sending fails
                    OtpHelper.RemoveOtp(account.Email);
                    
                    return new BaseResponse
                    {
                        StatusCode = 500,
                        Message = $"FAILED_TO_SEND_EMAIL: {emailEx.Message}"
                    };
                }

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "OTP_SENT_SUCCESS",
                    Data = new
                    {
                        Message = "OTP đã được gửi đến email của bạn. Mã có hiệu lực trong 5 phút.",
                        Email = account.Email
                    }
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"FORGOT_PASSWORD_OTP_ERROR: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Verify OTP và reset password
        /// </summary>
        public async Task<BaseResponse> VerifyOtpResetPasswordAsync(VerifyOtpResetPasswordRequest request)
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
                        StatusCode = 404,
                        Message = "ACCOUNT_NOT_FOUND"
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

                // Verify OTP
                if (!OtpHelper.VerifyOtp(account.Email, request.Otp, removeOnSuccess: true))
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "INVALID_OR_EXPIRED_OTP",
                        Data = new
                        {
                            Message = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới."
                        }
                    };
                }

                // Validate new password strength
                if (!PasswordHelper.IsStrongPassword(request.NewPassword))
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "PASSWORD_NOT_STRONG_ENOUGH",
                        Data = new
                        {
                            Message = "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
                        }
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
                    Message = "PASSWORD_RESET_SUCCESS",
                    Data = new
                    {
                        Message = "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
                        Email = account.Email
                    }
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"VERIFY_OTP_RESET_PASSWORD_ERROR: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Cập nhật thông tin profile của user hiện tại (được gọi từ AccountController.UpdateProfileAsync)
        /// Cho phép user thay đổi: FullName, Phone, AvatarUrl, Bio
        /// Không cho phép thay đổi Email (cần API riêng với verify OTP)
        /// </summary>
        public async Task<BaseResponse> UpdateProfileAsync(UpdateProfileRequest request)
        {
            try
            {
                // Get current user ID from HttpContext
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return new BaseResponse
                    {
                        StatusCode = 401,
                        Message = "UNAUTHORIZED"
                    };
                }

                // Get account from database
                var account = await _unitOfWork.AccountRepository.GetByIdAsync(userId);
                if (account == null)
                {
                    return new BaseResponse
                    {
                        StatusCode = 404,
                        Message = "ACCOUNT_NOT_FOUND"
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

                // Update fields (chỉ update nếu có giá trị mới)
                if (!string.IsNullOrWhiteSpace(request.FullName))
                {
                    account.FullName = request.FullName.Trim();
                }

                if (!string.IsNullOrWhiteSpace(request.Phone))
                {
                    account.Phone = request.Phone.Trim();
                }

                if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
                {
                    account.AvatarUrl = request.AvatarUrl.Trim();
                }

                if (request.DateOfBirth.HasValue)
                {
                    account.DateOfBirth = request.DateOfBirth.Value;
                }

                // Update timestamps
                account.UpdatedAt = DateTime.UtcNow;

                // Save to database
                _unitOfWork.AccountRepository.Update(account);
                await _unitOfWork.SaveChangesAsync();

                // Create response DTO manually
                var response = new AccountResponse
                {
                    Id = account.Id,
                    Email = account.Email,
                    FullName = account.FullName,
                    Phone = account.Phone,
                    DateOfBirth = account.DateOfBirth,
                    AvatarUrl = account.AvatarUrl,
                    Role = account.RoleEnum,
                    IsActive = account.IsActive,
                    EmailVerified = account.EmailVerified
                };

                return new BaseResponse
                {
                    StatusCode = 200,
                    Message = "UPDATE_PROFILE_SUCCESS",
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    StatusCode = 500,
                    Message = $"UPDATE_PROFILE_ERROR: {ex.Message}"
                };
            }
        }

        #endregion
    }
}

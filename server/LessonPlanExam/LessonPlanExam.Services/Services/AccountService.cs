using App.Infrastructure.BaseClasses;
using App.Infrastructure.Exceptions;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using Microsoft.AspNetCore.Http;
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

        public AccountService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<BaseResponse> GetAccountsAsync(int page, int size)
        {
            // Explicitly use string-based includes to avoid ambiguity
            var response = await _unitOfWork.AccountRepository.GetPaginatedAsync(
                page, 
                size, 
                firstPage: 1, 
                predicate: (Expression<Func<LessonPlanExam.Repositories.Models.Account, bool>>)null, 
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
    }
}

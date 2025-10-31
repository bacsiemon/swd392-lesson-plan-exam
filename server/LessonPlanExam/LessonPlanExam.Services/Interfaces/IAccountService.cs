using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.AccountDTOs;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IAccountService
    {
        Task<BaseResponse> GetAccountsAsync(int page, int size);
        
        /// <summary>
        /// Delete account by ID (Admin only)
        /// </summary>
        /// <param name="accountId">ID của tài khoản cần xóa</param>
        /// <returns>Kết quả xóa tài khoản</returns>
        Task<BaseResponse> DeleteAccountAsync(int accountId);
        
        /// <summary>
        /// Extracts the user ID from the current JWT token in the HTTP context
        /// </summary>
        /// <returns>The user ID if the token is valid and present</returns>
        /// <exception cref="App.Infrastructure.Exceptions.UnauthorizedException">Thrown when no token is found or token is invalid</exception>
        int GetCurrentUserId();

        // Authentication methods
        Task<BaseResponse> LoginAsync(LoginRequest request);
        Task<BaseResponse> RegisterAsync(RegisterRequest request);
        Task<BaseResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<BaseResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<BaseResponse> ChangePasswordAsync(ChangePasswordRequest request);
        Task<BaseResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<BaseResponse> LogoutAsync();
        Task<BaseResponse> GetCurrentUserProfileAsync();
    }
}
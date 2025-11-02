using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Repositories.Enums;

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
        /// Lấy danh sách tất cả accounts phân loại theo role - chỉ dành cho Admin
        /// Trả về danh sách Teachers và Students (không bao gồm Admin)
        /// </summary>
        /// <returns>BaseResponse chứa AllAccountsResponse với danh sách phân loại theo role</returns>
        Task<BaseResponse> GetAllAccountsAsync();
        
        /// <summary>
        /// Extracts the user ID from the current JWT token in the HTTP context
        /// </summary>
        /// <returns>The user ID if the token is valid and present</returns>
        /// <exception cref="App.Infrastructure.Exceptions.UnauthorizedException">Thrown when no token is found or token is invalid</exception>
        int GetCurrentUserId();

        /// <summary>
        /// Extracts the user role from the current JWT token in the HTTP context
        /// </summary>
        /// <returns>The user role if the token is valid and present</returns>
        /// <exception cref="App.Infrastructure.Exceptions.UnauthorizedException">Thrown when no token is found or token is invalid</exception>
        EUserRole GetCurrentUserRole();

        // Authentication methods
        Task<BaseResponse> LoginAsync(LoginRequest request);
        Task<BaseResponse> RegisterAsync(RegisterRequest request);
        
        /// <summary>
        /// Register a new student account
        /// Creates both Account and Student entities in a single transaction
        /// </summary>
        /// <param name="request">Student registration details</param>
        /// <returns>Student registration response</returns>
        Task<BaseResponse> RegisterStudentAsync(StudentRegisterRequest request);
        
        /// <summary>
        /// Register a new teacher account
        /// Creates both Account and Teacher entities in a single transaction
        /// </summary>
        /// <param name="request">Teacher registration details including school name</param>
        /// <returns>Teacher registration response</returns>
        Task<BaseResponse> RegisterTeacherAsync(TeacherRegisterRequest request);
        
        Task<BaseResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<BaseResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<BaseResponse> ChangePasswordAsync(ChangePasswordRequest request);
        Task<BaseResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<BaseResponse> LogoutAsync();
        Task<BaseResponse> GetCurrentUserProfileAsync();
    }
}
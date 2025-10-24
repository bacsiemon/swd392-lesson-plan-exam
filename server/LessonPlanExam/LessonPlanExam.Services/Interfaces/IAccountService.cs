using App.Infrastructure.BaseClasses;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IAccountService
    {
        Task<BaseResponse> GetAccountsAsync(int page, int size);
        
        /// <summary>
        /// Extracts the user ID from the current JWT token in the HTTP context
        /// </summary>
        /// <returns>The user ID if the token is valid and present</returns>
        /// <exception cref="App.Infrastructure.Exceptions.UnauthorizedException">Thrown when no token is found or token is invalid</exception>
        int GetCurrentUserId();
    }
}
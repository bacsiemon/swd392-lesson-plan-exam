using LessonPlanExam.Repositories.Models;
using System.Security.Claims;

namespace LessonPlanExam.Services.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(Account account);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    bool ValidateRefreshToken(string refreshToken, int accountId);
    Task SaveRefreshTokenAsync(int accountId, string refreshToken, DateTime expiry);
    Task RevokeRefreshTokenAsync(string refreshToken);
    Task RevokeAllRefreshTokensAsync(int accountId);
}
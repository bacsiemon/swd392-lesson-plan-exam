using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Repositories.UoW;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace LessonPlanExam.Services.Services;

public class JwtService : IJwtService
{
    private readonly JwtSettings _jwtSettings;
    private readonly IUnitOfWork _unitOfWork;

    public JwtService(IOptions<JwtSettings> jwtSettings, IUnitOfWork unitOfWork)
    {
        _jwtSettings = jwtSettings.Value;
        _unitOfWork = unitOfWork;
    }

    public string GenerateAccessToken(Account account)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Name, account.FullName ?? account.Email),
            new Claim(ClaimTypes.Role, account.RoleEnum.ToString()),
            new Claim("userId", account.Id.ToString()),
            new Claim("email", account.Email),
            new Claim("role", account.RoleEnum.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpireMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidAudience = _jwtSettings.Audience,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }

    public bool ValidateRefreshToken(string refreshToken, int accountId)
    {
        // Implementation would check against stored refresh tokens in database
        // For now, returning true - you should implement proper validation
        return true;
    }

    public async Task SaveRefreshTokenAsync(int accountId, string refreshToken, DateTime expiry)
    {
        // Implementation to save refresh token to database
        // This would typically involve a RefreshToken entity
        await Task.CompletedTask;
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        // Implementation to revoke a specific refresh token
        await Task.CompletedTask;
    }

    public async Task RevokeAllRefreshTokensAsync(int accountId)
    {
        // Implementation to revoke all refresh tokens for a user
        await Task.CompletedTask;
    }
}
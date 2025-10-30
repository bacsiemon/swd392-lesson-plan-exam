using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Services.Mapping;

public static class AccountMappingExtensions
{
    public static Account ToEntity(this RegisterRequest request)
    {
        return new Account
        {
            Email = request.Email.ToLowerInvariant(),
            NormalizedEmail = request.Email.ToUpperInvariant(),
            FullName = request.FullName,
            RoleEnum = request.Role,
            Phone = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth.HasValue ? DateOnly.FromDateTime(request.DateOfBirth.Value) : null,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static LoginResponse ToLoginResponse(this Account account, string accessToken, string refreshToken, DateTime tokenExpiry, DateTime refreshTokenExpiry)
    {
        return new LoginResponse
        {
            Id = account.Id,
            Email = account.Email,
            FullName = account.FullName ?? account.Email,
            Role = account.RoleEnum,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            TokenExpiry = tokenExpiry,
            RefreshTokenExpiry = refreshTokenExpiry
        };
    }

    public static RegisterResponse ToRegisterResponse(this Account account)
    {
        return new RegisterResponse
        {
            Id = account.Id,
            Email = account.Email,
            FullName = account.FullName ?? account.Email,
            Message = "Account created successfully. Welcome email has been sent.",
            CreatedAt = account.CreatedAt ?? DateTime.UtcNow
        };
    }

    public static AccountResponse ToProfileResponse(this Account account)
    {
        return new AccountResponse
        {
            Id = account.Id,
            Email = account.Email,
            FullName = account.FullName,
            Role = account.RoleEnum,
            Phone = account.Phone,
            DateOfBirth = account.DateOfBirth,
            AvatarUrl = account.AvatarUrl,
            IsActive = account.IsActive,
            EmailVerified = account.EmailVerified
        };
    }
}
using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Enums;

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

    public static Account ToEntity(this StudentRegisterRequest request)
    {
        return new Account
        {
            Email = request.Email.ToLowerInvariant(),
            NormalizedEmail = request.Email.ToUpperInvariant(),
            FullName = request.FullName,
            RoleEnum = EUserRole.Student,
            Phone = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth.HasValue ? DateOnly.FromDateTime(request.DateOfBirth.Value) : null,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static Account ToEntity(this TeacherRegisterRequest request)
    {
        return new Account
        {
            Email = request.Email.ToLowerInvariant(),
            NormalizedEmail = request.Email.ToUpperInvariant(),
            FullName = request.FullName,
            RoleEnum = EUserRole.Teacher,
            Phone = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth.HasValue ? DateOnly.FromDateTime(request.DateOfBirth.Value) : null,
            IsActive = true,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static Student ToStudentEntity(this StudentRegisterRequest request, int accountId)
    {
        return new Student
        {
            AccountId = accountId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static Teacher ToTeacherEntity(this TeacherRegisterRequest request, int accountId)
    {
        return new Teacher
        {
            AccountId = accountId,
            SchoolName = request.SchoolName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static StudentRegisterResponse ToStudentRegisterResponse(this Account account, Student student)
    {
        return new StudentRegisterResponse
        {
            Id = student.AccountId,
            AccountId = account.Id,
            Email = account.Email,
            FullName = account.FullName ?? account.Email,
            Message = "Student account created successfully. Welcome email has been sent.",
            CreatedAt = account.CreatedAt ?? DateTime.UtcNow
        };
    }

    public static TeacherRegisterResponse ToTeacherRegisterResponse(this Account account, Teacher teacher)
    {
        return new TeacherRegisterResponse
        {
            AccountId = account.Id,
            Email = account.Email,
            FullName = account.FullName ?? account.Email,
            SchoolName = teacher.SchoolName ?? string.Empty,
            Message = "Teacher account created successfully. Welcome email has been sent.",
            CreatedAt = account.CreatedAt ?? DateTime.UtcNow
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
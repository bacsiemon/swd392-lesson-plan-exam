using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Repositories.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Mapping
{
    public static class AccountMappers
    {
        #region DTO to Entity

        #endregion

        #region Entity to DTO
        public static AccountResponse ToResponse(this Account entity)
        {
            return new AccountResponse
            {
                Id = entity.Id,
                Email = entity.Email,
                Role = entity.RoleEnum,
                FullName = entity.FullName,
                Phone = entity.Phone,
                DateOfBirth = entity.DateOfBirth,
                AvatarUrl = entity.AvatarUrl,
                IsActive = entity.IsActive,
                EmailVerified = entity.EmailVerified
            };
        }
        #endregion
    }
}

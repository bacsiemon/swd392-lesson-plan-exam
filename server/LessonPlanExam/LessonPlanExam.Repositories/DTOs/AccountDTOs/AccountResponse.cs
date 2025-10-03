using LessonPlanExam.Repositories.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LessonPlanExam.DTOs.AccountDTOs
{
    public class AccountResponse
    {
        public int Id { get; set; }

        public string Email { get; set; }

        public EUserRole Role { get; set; }

        public string FullName { get; set; }

        public string Phone { get; set; }

        public DateOnly? DateOfBirth { get; set; }

        public string AvatarUrl { get; set; }

        public bool? IsActive { get; set; }

        public bool? EmailVerified { get; set; }
    }
}

using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Mapping;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Services
{
    public class AccountService : IAccountService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AccountService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse> GetAccountsAsync(int page, int size)
        {
            var response = await _unitOfWork.AccountRepository.GetPaginatedAsync(page, size, firstPage: 1, orderBy: q => q.OrderByDescending(x => x.Id));
            return new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = response.Items.Select(e => e.ToResponse()),
                AdditionalData = response.AdditionalData
            };
        }
    }
}

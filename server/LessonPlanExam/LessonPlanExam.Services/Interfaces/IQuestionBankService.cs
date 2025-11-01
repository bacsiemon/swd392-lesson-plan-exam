using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.QuestionBankDTOs;
using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Services.Interfaces
{
	public interface IQuestionBankService
	{
		Task<BaseResponse<QuestionBankResponse>> CreateAsync(CreateQuestionBankRequest request);
		Task<BaseResponse<QuestionBankResponse>> UpdateAsync(int id, UpdateQuestionBankRequest request);
		Task<BaseResponse<QuestionBankResponse>> UpdateStatusAsync(int id, UpdateQuestionBankStatusRequest request);
		Task<BaseResponse<QuestionBankResponse>> GetByIdAsync(int id);
		Task<BaseResponse> QueryAsync(int? teacherId, int? gradeLevel, EQuestionBankStatus? status, string q, int page, int size);
		Task<BaseResponse<QuestionBankStatsResponse>> GetStatsAsync(int id);
		Task<BaseResponse<object>> ImportAsync(ImportQuestionBankItemsRequest request);
		Task<BaseResponse<IEnumerable<object>>> ExportAsync(int id);
	}
}


using LessonPlanExam.Repositories.DTOs.QuestionBankDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Repositories.Models;

namespace LessonPlanExam.Repositories.Interfaces
{
	public interface IQuestionBankRepository
	{
		Task<QuestionBank> CreateAsync(CreateQuestionBankRequest request, CancellationToken ct = default);
		Task<QuestionBank> UpdateAsync(int id, UpdateQuestionBankRequest request, CancellationToken ct = default);
		Task<QuestionBank> UpdateStatusAsync(int id, EQuestionBankStatus status, CancellationToken ct = default);
		Task<QuestionBank> GetByIdAsync(int id, CancellationToken ct = default);
		Task<(IEnumerable<QuestionBankListItem> Items, int TotalCount)> QueryAsync(int? teacherId, int? gradeLevel, EQuestionBankStatus? status, string q, int page, int size, CancellationToken ct = default);
		Task<QuestionBankStatsResponse> GetStatsAsync(int id, CancellationToken ct = default);
		Task<int> ImportAsync(ImportQuestionBankItemsRequest request, CancellationToken ct = default);
		Task<IEnumerable<object>> ExportAsync(int id, CancellationToken ct = default);
	}
}


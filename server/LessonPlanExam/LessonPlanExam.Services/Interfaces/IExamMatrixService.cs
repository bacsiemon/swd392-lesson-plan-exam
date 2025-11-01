using LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Interfaces
{
    public interface IExamMatrixService
    {
        Task<ExamMatrixResponse> CreateAsync(ExamMatrixCreateRequest request, CancellationToken ct = default);
        Task<IEnumerable<ExamMatrixResponse>> QueryAsync(int? teacherId, string q, CancellationToken ct = default);
        Task<ExamMatrixResponse> GetByIdAsync(int id, CancellationToken ct = default);
        Task<ExamMatrixResponse> UpdateAsync(int id, ExamMatrixUpdateRequest request, CancellationToken ct = default);
        Task<bool> DeleteAsync(int id, CancellationToken ct = default);
        Task<ExamMatrixItemResponse> CreateItemAsync(int matrixId, ExamMatrixItemCreateRequest request, CancellationToken ct = default);
        Task<IEnumerable<ExamMatrixItemResponse>> GetItemsAsync(int matrixId, CancellationToken ct = default);
        Task<ExamMatrixItemResponse> UpdateItemAsync(int itemId, ExamMatrixItemUpdateRequest request, CancellationToken ct = default);
        Task<bool> DeleteItemAsync(int itemId, CancellationToken ct = default);
        Task<ValidationResponse> ValidateAsync(int matrixId, CancellationToken ct = default);
    }
}


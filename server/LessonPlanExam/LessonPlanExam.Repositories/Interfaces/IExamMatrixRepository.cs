using LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs;
using LessonPlanExam.Repositories.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Interfaces
{
    public interface IExamMatrixRepository : Base.IGenericRepository<ExamMatrix>
    {
        Task<ExamMatrix> CreateMatrixAsync(ExamMatrixCreateRequest request, CancellationToken ct = default);
        Task<ExamMatrix> UpdateMatrixAsync(int id, ExamMatrixUpdateRequest request, CancellationToken ct = default);
        Task<ExamMatrix> GetMatrixWithItemsAsync(int id, CancellationToken ct = default);
        Task<IEnumerable<ExamMatrix>> GetMatricesByTeacherAsync(int? teacherId, string q, CancellationToken ct = default);
        Task<ExamMatrixItem> CreateMatrixItemAsync(int matrixId, ExamMatrixItemCreateRequest request, CancellationToken ct = default);
        Task<ExamMatrixItem> UpdateMatrixItemAsync(int itemId, ExamMatrixItemUpdateRequest request, CancellationToken ct = default);
        Task<bool> DeleteMatrixItemAsync(int itemId, CancellationToken ct = default);
        Task<ValidationResponse> ValidateMatrixAsync(int matrixId, CancellationToken ct = default);
    }
}


using LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs;
using LessonPlanExam.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Services
{
    public class ExamMatrixService : IExamMatrixService
    {
        private readonly IExamMatrixRepository _repo;

        public ExamMatrixService(IExamMatrixRepository repo)
        {
            _repo = repo;
        }

        public async Task<ExamMatrixResponse> CreateAsync(ExamMatrixCreateRequest request, CancellationToken ct = default)
        {
            var entity = await _repo.CreateMatrixAsync(request, ct);
            return MapResponse(entity);
        }

        public async Task<IEnumerable<ExamMatrixResponse>> QueryAsync(int? teacherId, string q, CancellationToken ct = default)
        {
            var matrices = await _repo.GetMatricesByTeacherAsync(teacherId, q, ct);
            return matrices.Select(MapResponse);
        }

        public async Task<ExamMatrixResponse> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var matrix = await _repo.GetMatrixWithItemsAsync(id, ct);
            return matrix == null ? null : MapResponse(matrix);
        }

        public async Task<ExamMatrixResponse> UpdateAsync(int id, ExamMatrixUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _repo.UpdateMatrixAsync(id, request, ct);
            return entity == null ? null : MapResponse(entity);
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null) return false;
            _repo.Remove(entity);
            await _repo.SaveChangesAsync(ct);
            return true;
        }

        public async Task<ExamMatrixItemResponse> CreateItemAsync(int matrixId, ExamMatrixItemCreateRequest request, CancellationToken ct = default)
        {
            var entity = await _repo.CreateMatrixItemAsync(matrixId, request, ct);
            return MapItemResponse(entity);
        }

        public async Task<IEnumerable<ExamMatrixItemResponse>> GetItemsAsync(int matrixId, CancellationToken ct = default)
        {
            var matrix = await _repo.GetMatrixWithItemsAsync(matrixId, ct);
            return matrix == null ? null : matrix.ExamMatrixItems.Select(MapItemResponse);
        }

        public async Task<ExamMatrixItemResponse> UpdateItemAsync(int itemId, ExamMatrixItemUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _repo.UpdateMatrixItemAsync(itemId, request, ct);
            return entity == null ? null : MapItemResponse(entity);
        }

        public async Task<bool> DeleteItemAsync(int itemId, CancellationToken ct = default)
        {
            return await _repo.DeleteMatrixItemAsync(itemId, ct);
        }

        public async Task<ValidationResponse> ValidateAsync(int matrixId, CancellationToken ct = default)
        {
            return await _repo.ValidateMatrixAsync(matrixId, ct);
        }

        private static ExamMatrixResponse MapResponse(Repositories.Models.ExamMatrix matrix)
        {
            return new ExamMatrixResponse
            {
                Id = matrix.Id,
                Name = matrix.Name,
                Description = matrix.Description,
                TeacherId = matrix.TeacherId,
                TotalQuestions = matrix.TotalQuestions,
                TotalPoints = matrix.TotalPoints,
                Configuration = matrix.Configuration
            };
        }

        private static ExamMatrixItemResponse MapItemResponse(Repositories.Models.ExamMatrixItem item)
        {
            return new ExamMatrixItemResponse
            {
                Id = item.Id,
                ExamMatrixId = item.ExamMatrixId,
                QuestionBankId = item.QuestionBankId,
                Domain = item.Domain,
                DifficultyLevel = item.DifficultyLevel,
                QuestionCount = item.QuestionCount,
                PointsPerQuestion = item.PointsPerQuestion
            };
        }
    }
}


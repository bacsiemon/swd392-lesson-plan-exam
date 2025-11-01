using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Repositories
{
    public class ExamMatrixRepository : Base.GenericRepository<ExamMatrix>, IExamMatrixRepository
    {
        private readonly LessonPlanExamDbContext _db;

        public ExamMatrixRepository(LessonPlanExamDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<ExamMatrix> CreateMatrixAsync(ExamMatrixCreateRequest request, CancellationToken ct = default)
        {
            var entity = new ExamMatrix
            {
                Name = request.Name,
                Description = request.Description,
                TeacherId = request.TeacherId,
                TotalQuestions = request.TotalQuestions,
                TotalPoints = request.TotalPoints,
                Configuration = request.Configuration,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _db.ExamMatrices.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<ExamMatrix> UpdateMatrixAsync(int id, ExamMatrixUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return null;

            entity.Name = request.Name;
            entity.Description = request.Description;
            entity.TotalQuestions = request.TotalQuestions;
            entity.TotalPoints = request.TotalPoints;
            entity.Configuration = request.Configuration;
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<ExamMatrix> GetMatrixWithItemsAsync(int id, CancellationToken ct = default)
        {
            var matrix = await _db.ExamMatrices.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, ct);
            if (matrix == null) return null;

            await _db.Entry(matrix).Collection(x => x.ExamMatrixItems).LoadAsync(ct);
            return matrix;
        }

        public async Task<IEnumerable<ExamMatrix>> GetMatricesByTeacherAsync(int? teacherId, string q, CancellationToken ct = default)
        {
            var query = _db.ExamMatrices.AsNoTracking().AsQueryable();

            if (teacherId.HasValue)
                query = query.Where(x => x.TeacherId == teacherId.Value);

            if (!string.IsNullOrEmpty(q))
            {
                var searchTerm = q.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(searchTerm) || 
                                         x.Description.ToLower().Contains(searchTerm));
            }

            return await query.OrderByDescending(x => x.Id).ToListAsync(ct);
        }

        public async Task<ExamMatrixItem> CreateMatrixItemAsync(int matrixId, ExamMatrixItemCreateRequest request, CancellationToken ct = default)
        {
            var entity = new ExamMatrixItem
            {
                ExamMatrixId = matrixId,
                QuestionBankId = request.QuestionBankId,
                Domain = request.Domain,
                DifficultyLevel = request.DifficultyLevel,
                QuestionCount = request.QuestionCount,
                PointsPerQuestion = request.PointsPerQuestion,
                CreatedAt = DateTime.UtcNow
            };
            await _db.ExamMatrixItems.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<ExamMatrixItem> UpdateMatrixItemAsync(int itemId, ExamMatrixItemUpdateRequest request, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrixItems.FirstOrDefaultAsync(x => x.Id == itemId, ct);
            if (entity == null) return null;

            entity.QuestionBankId = request.QuestionBankId;
            entity.Domain = request.Domain;
            entity.DifficultyLevel = request.DifficultyLevel;
            entity.QuestionCount = request.QuestionCount;
            entity.PointsPerQuestion = request.PointsPerQuestion;

            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<bool> DeleteMatrixItemAsync(int itemId, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrixItems.FirstOrDefaultAsync(x => x.Id == itemId, ct);
            if (entity == null) return false;

            _db.ExamMatrixItems.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> DeleteMatrixAsync(int id, CancellationToken ct = default)
        {
            var entity = await _db.ExamMatrices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return false;
            _db.ExamMatrices.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<ValidationResponse> ValidateMatrixAsync(int matrixId, CancellationToken ct = default)
        {
            var response = new ValidationResponse { Ok = true, Shortages = new List<ShortageInfo>() };
            var matrix = await GetMatrixWithItemsAsync(matrixId, ct);
            if (matrix == null) return response;

            foreach (var item in matrix.ExamMatrixItems)
            {
                // Query available questions in the bank
                var query = _db.Questions.AsNoTracking()
                    .Include(q => q.QuestionDifficulty)
                    .Where(q => q.QuestionBankId == item.QuestionBankId && 
                                (q.IsActive ?? true));

                // Check bank status
                var bank = await _db.QuestionBanks.AsNoTracking()
                    .FirstOrDefaultAsync(b => b.Id == item.QuestionBankId, ct);
                
                if (bank?.StatusEnum != null && bank.StatusEnum != EQuestionBankStatus.Active)
                {
                    response.Shortages.Add(new ShortageInfo
                    {
                        ItemId = item.Id,
                        Needed = item.QuestionCount,
                        Available = 0
                    });
                    response.Ok = false;
                    continue;
                }

                // Filter by domain through QuestionDifficulty if specified
                if (!string.IsNullOrEmpty(item.Domain))
                {
                    query = query.Where(q => q.QuestionDifficulty != null && q.QuestionDifficulty.Domain == item.Domain);
                }

                // Filter by difficulty level if specified
                if (item.DifficultyLevel.HasValue)
                {
                    query = query.Where(q => q.QuestionDifficultyId == item.DifficultyLevel.Value);
                }

                var available = await query.CountAsync(ct);

                if (available < item.QuestionCount)
                {
                    response.Shortages.Add(new ShortageInfo
                    {
                        ItemId = item.Id,
                        Needed = item.QuestionCount,
                        Available = available
                    });
                    response.Ok = false;
                }
            }

            return response;
        }
    }
}


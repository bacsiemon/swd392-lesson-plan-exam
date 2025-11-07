using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.DTOs.QuestionDifficultyDTOs;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Repositories
{
    public class QuestionDifficultyRepository : IQuestionDifficultyRepository
    {
        private readonly LessonPlanExamDbContext _db;
        public QuestionDifficultyRepository(LessonPlanExamDbContext db)
        {
            _db = db;
        }

        public async Task<QuestionDifficulty> CreateAsync(CreateQuestionDifficultyRequest request, CancellationToken ct = default)
        {
            var entity = new QuestionDifficulty
            {
                Domain = request.Domain,
                DifficultyLevel = request.DifficultyLevel,
                Description = request.Description
            };
            _db.QuestionDifficulties.Add(entity);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<QuestionDifficulty> UpdateAsync(int id, UpdateQuestionDifficultyRequest request, CancellationToken ct = default)
        {
            var entity = await _db.QuestionDifficulties.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return null;
            entity.Domain = request.Domain;
            entity.DifficultyLevel = request.DifficultyLevel;
            entity.Description = request.Description;
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        {
            var entity = await _db.QuestionDifficulties.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return false;
            // check for fk usage in Questions
            var used = await _db.Questions.AnyAsync(q => q.QuestionDifficultyId == id, ct);
            if (used) return false;
            _db.QuestionDifficulties.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public Task<QuestionDifficulty> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return _db.QuestionDifficulties.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<(IEnumerable<QuestionDifficultyListItem> Items, int TotalCount)> QueryAsync(string domain, int? difficultyLevel, int page, int size, CancellationToken ct = default)
        {
            var query = _db.QuestionDifficulties.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(domain))
            {
                var dn = domain.Trim().ToLower();
                query = query.Where(x => x.Domain != null && x.Domain.ToLower().Contains(dn));
            }
            if (difficultyLevel.HasValue) query = query.Where(x => x.DifficultyLevel == difficultyLevel.Value);

            var total = await query.CountAsync(ct);
            var items = await query.OrderBy(x => x.DifficultyLevel).Skip((page - 1) * size).Take(size)
                .Select(x => new QuestionDifficultyListItem { Id = x.Id, Domain = x.Domain, DifficultyLevel = x.DifficultyLevel, Description = x.Description })
                .ToListAsync(ct);
            return (items, total);
        }
    }
}

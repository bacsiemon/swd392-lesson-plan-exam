using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace LessonPlanExam.Repositories.Repositories
{
    public class ExamAttemptRepository : IExamAttemptRepository
    {
        private readonly LessonPlanExamDbContext _db;
        public ExamAttemptRepository(LessonPlanExamDbContext db)
        {
            _db = db;
        }

        public async Task<ExamAttempt> CreateAttemptAsync(ExamAttempt attempt, CancellationToken ct = default)
        {
            await _db.ExamAttempts.AddAsync(attempt, ct);
            await _db.SaveChangesAsync(ct);
            return attempt;
        }

        public async Task<ExamAttempt> GetAttemptWithAnswersAsync(int attemptId, CancellationToken ct = default)
        {
            var attempt = await _db.ExamAttempts.FirstOrDefaultAsync(a => a.Id == attemptId, ct);
            if (attempt == null) return null;
            await _db.Entry(attempt).Collection(x => x.ExamAttemptAnswers).Query().Include(a => a.Question).LoadAsync(ct);
            return attempt;
        }

        public async Task<IEnumerable<ExamAttempt>> QueryAttemptsByExamAsync(int examId, int? status, CancellationToken ct = default)
        {
            var q = _db.ExamAttempts.AsNoTracking().Where(x => x.ExamId == examId).AsQueryable();
            if (status.HasValue) q = q.Where(x => (int)x.StatusEnum == status.Value);
            return await q.OrderByDescending(x => x.Id).ToListAsync(ct);
        }

        public async Task<int> GetAttemptCountForStudentAsync(int examId, int studentId, CancellationToken ct = default)
        {
            return await _db.ExamAttempts.CountAsync(x => x.ExamId == examId && x.StudentId == studentId, ct);
        }
    }
}

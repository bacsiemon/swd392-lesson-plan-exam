using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Repositories
{
    public class ExamAttemptAnswerRepository : IExamAttemptAnswerRepository
    {
        private readonly LessonPlanExamDbContext _db;
        public ExamAttemptAnswerRepository(LessonPlanExamDbContext db)
        {
            _db = db;
        }

        public async Task<ExamAttemptAnswer> SaveAnswerAsync(ExamAttemptAnswer answer, CancellationToken ct = default)
        {
            var existing = await _db.ExamAttemptAnswers.FirstOrDefaultAsync(x => x.ExamAttemptId == answer.ExamAttemptId && x.QuestionId == answer.QuestionId, ct);
            if (existing != null)
            {
                existing.SelectedAnswerIds = answer.SelectedAnswerIds;
                existing.TextAnswer = answer.TextAnswer;
                existing.AnswerData = answer.AnswerData;
                existing.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
                return existing;
            }
            await _db.ExamAttemptAnswers.AddAsync(answer, ct);
            await _db.SaveChangesAsync(ct);
            return answer;
        }

        public async Task<ExamAttemptAnswer> GetAnswerAsync(int attemptId, int questionId, CancellationToken ct = default)
        {
            return await _db.ExamAttemptAnswers.AsNoTracking().FirstOrDefaultAsync(x => x.ExamAttemptId == attemptId && x.QuestionId == questionId, ct);
        }
    }
}

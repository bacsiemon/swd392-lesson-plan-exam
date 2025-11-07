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
                // Only update AnswerData if it's provided (not null or empty)
                // If answer.AnswerData is null, explicitly set to null
                if (answer.AnswerData != null && answer.AnswerData != "{}")
                {
                    existing.AnswerData = answer.AnswerData;
                }
                else if (answer.AnswerData == null)
                {
                    existing.AnswerData = null;
                }
                existing.UpdatedAt = DateTime.UtcNow;
                
                // Debug logging
                System.Diagnostics.Debug.WriteLine($"[SaveAnswerAsync] Updated existing answer: QuestionId={answer.QuestionId}, SelectedAnswerIds=[{string.Join(",", existing.SelectedAnswerIds ?? new List<int>())}], Count={existing.SelectedAnswerIds?.Count ?? 0}, TextAnswer={(existing.TextAnswer != null ? "has value" : "null")}, AnswerData={(existing.AnswerData != null ? existing.AnswerData : "null")}");
                
                await _db.SaveChangesAsync(ct);
                return existing;
            }
            
            // For new answer, ensure AnswerData is null if empty
            if (answer.AnswerData != null && answer.AnswerData == "{}")
            {
                answer.AnswerData = null;
            }
            
            // Debug logging for new answer
            System.Diagnostics.Debug.WriteLine($"[SaveAnswerAsync] Creating new answer: QuestionId={answer.QuestionId}, SelectedAnswerIds=[{string.Join(",", answer.SelectedAnswerIds ?? new List<int>())}], Count={answer.SelectedAnswerIds?.Count ?? 0}, TextAnswer={(answer.TextAnswer != null ? "has value" : "null")}, AnswerData={(answer.AnswerData != null ? answer.AnswerData : "null")}");
            
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

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
            
            // Debug logging
            foreach (var answer in attempt.ExamAttemptAnswers)
            {
                System.Diagnostics.Debug.WriteLine($"[GetAttemptWithAnswers] QuestionId={answer.QuestionId}, SelectedAnswerIds=[{string.Join(",", answer.SelectedAnswerIds ?? new List<int>())}], Count={answer.SelectedAnswerIds?.Count ?? 0}, IsNull={answer.SelectedAnswerIds == null}");
            }
            
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

        public async Task<ExamAttempt> UpdateAttemptAsync(ExamAttempt attempt, CancellationToken ct = default)
        {
            try
            {
                // Check if entity is already tracked in this context
                var trackedEntity = _db.ChangeTracker.Entries<ExamAttempt>()
                    .FirstOrDefault(e => e.Entity.Id == attempt.Id);
                
                ExamAttempt entityToUpdate;
                
                if (trackedEntity != null)
                {
                    // Entity is already tracked, update its properties directly
                    entityToUpdate = trackedEntity.Entity;
                    entityToUpdate.TotalScore = attempt.TotalScore;
                    entityToUpdate.MaxScore = attempt.MaxScore;
                    entityToUpdate.ScorePercentage = attempt.ScorePercentage;
                    entityToUpdate.StatusEnum = attempt.StatusEnum;
                    entityToUpdate.SubmittedAt = attempt.SubmittedAt;
                    entityToUpdate.AutoGradedAt = attempt.AutoGradedAt;
                    entityToUpdate.UpdatedAt = attempt.UpdatedAt;
                    
                    // Mark as modified to ensure SaveChanges updates it
                    trackedEntity.State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    
                    System.Diagnostics.Debug.WriteLine($"[UpdateAttemptAsync] Updating tracked entity {entityToUpdate.Id}: TotalScore={entityToUpdate.TotalScore}, MaxScore={entityToUpdate.MaxScore}, ScorePercentage={entityToUpdate.ScorePercentage}, SubmittedAt={entityToUpdate.SubmittedAt}");
                }
                else
                {
                    // Entity is not tracked, load it first, then update
                    entityToUpdate = await _db.ExamAttempts.FindAsync(new object[] { attempt.Id }, ct);
                    if (entityToUpdate == null)
                    {
                        System.Diagnostics.Debug.WriteLine($"[UpdateAttemptAsync] ERROR: Attempt {attempt.Id} not found in database");
                        throw new InvalidOperationException($"Attempt with ID {attempt.Id} not found");
                    }
                    
                    // Update properties
                    entityToUpdate.TotalScore = attempt.TotalScore;
                    entityToUpdate.MaxScore = attempt.MaxScore;
                    entityToUpdate.ScorePercentage = attempt.ScorePercentage;
                    entityToUpdate.StatusEnum = attempt.StatusEnum;
                    entityToUpdate.SubmittedAt = attempt.SubmittedAt;
                    entityToUpdate.AutoGradedAt = attempt.AutoGradedAt;
                    entityToUpdate.UpdatedAt = attempt.UpdatedAt;
                    
                    // Mark as modified
                    _db.Entry(entityToUpdate).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    
                    System.Diagnostics.Debug.WriteLine($"[UpdateAttemptAsync] Updating untracked entity {entityToUpdate.Id}: TotalScore={entityToUpdate.TotalScore}, MaxScore={entityToUpdate.MaxScore}, ScorePercentage={entityToUpdate.ScorePercentage}, SubmittedAt={entityToUpdate.SubmittedAt}");
                }
                
                // Save changes
                int savedCount = await _db.SaveChangesAsync(ct);
                System.Diagnostics.Debug.WriteLine($"[UpdateAttemptAsync] SaveChangesAsync returned: {savedCount} entities saved");
                
                return entityToUpdate;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[UpdateAttemptAsync] ERROR: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[UpdateAttemptAsync] StackTrace: {ex.StackTrace}");
                throw;
            }
        }
    }
}

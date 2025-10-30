using LessonPlanExam.Repositories.Context;
using LessonPlanExam.Repositories.DTOs.QuestionDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Repositories.Repositories {
    public class QuestionRepository : Base.GenericRepository<Question>, IQuestionRepository {
        private readonly LessonPlanExamDbContext _db;
        public QuestionRepository(LessonPlanExamDbContext db) : base(db) {
            _db = db;
        }

        public async Task<Question> CreateQuestionAsync(QuestionCreateRequest request, CancellationToken ct = default) {
            var entity = new Question {
                QuestionBankId = request.QuestionBankId,
                Title = request.Title,
                Content = request.Content,
                QuestionTypeEnum = request.QuestionTypeEnum,
                QuestionDifficultyId = request.QuestionDifficultyId,
                AdditionalData = request.AdditionalData ?? "",
                IsActive = true,
            };
            await _db.Questions.AddAsync(entity, ct);
            await _db.SaveChangesAsync(ct);

            // Answers
            if (request.QuestionTypeEnum == EQuestionType.MultipleChoice && request.MultipleChoiceAnswers != null) {
                foreach (var ans in request.MultipleChoiceAnswers) {
                    await _db.QuestionMultipleChoiceAnswers.AddAsync(new QuestionMultipleChoiceAnswer {
                        QuestionId = entity.Id,
                        AnswerText = ans.AnswerText,
                        IsCorrect = ans.IsCorrect,
                        Explanation = ans.Explanation,
                        OrderIndex = ans.OrderIndex ?? 0,
                        CreatedAt = DateTime.UtcNow
                    }, ct);
                }
            } else if (request.QuestionTypeEnum == EQuestionType.FillBlank && request.FillBlankAnswers != null) {
                foreach (var ans in request.FillBlankAnswers) {
                    await _db.QuestionFillBlankAnswers.AddAsync(new QuestionFillBlankAnswer {
                        QuestionId = entity.Id,
                        CorrectAnswer = ans.CorrectAnswer,
                        NormalizedCorrectAnswer = string.IsNullOrWhiteSpace(ans.NormalizedCorrectAnswer) ? (ans.CorrectAnswer?.Trim().ToLower()) : ans.NormalizedCorrectAnswer,
                        Explanation = ans.Explanation,
                        CreatedAt = DateTime.UtcNow
                    }, ct);
                }
            }
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<IEnumerable<Question>> QueryAsync(int? bankId, int? type, int? difficultyId, string _ignoreDomain, bool? active, string q, CancellationToken ct = default) {
            var query = _db.Questions.AsNoTracking().AsQueryable();
            if (bankId.HasValue) query = query.Where(x => x.QuestionBankId == bankId.Value);
            if (type.HasValue) query = query.Where(x => (int)x.QuestionTypeEnum == type.Value);
            if (difficultyId.HasValue) query = query.Where(x => x.QuestionDifficultyId == difficultyId.Value);
            if (active.HasValue) query = query.Where(x => x.IsActive == active.Value);
            if (!string.IsNullOrEmpty(q)) {
                var ql = q.ToLower();
                query = query.Where(x => x.Title.ToLower().Contains(ql) || x.Content.ToLower().Contains(ql));
            }
            return await query.OrderByDescending(x => x.Id).ToListAsync(ct);
        }

        public async Task<Question> GetWithAnswersAsync(int id, CancellationToken ct = default) {
            var q = await _db.Questions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (q == null) return null;
            // Load answers
            if (q.QuestionTypeEnum == EQuestionType.MultipleChoice)
                await _db.Entry(q).Collection(x => x.QuestionMultipleChoiceAnswers).LoadAsync(ct);
            else if (q.QuestionTypeEnum == EQuestionType.FillBlank)
                await _db.Entry(q).Collection(x => x.QuestionFillBlankAnswers).LoadAsync(ct);
            return q;
        }

        public async Task<Question> UpdateQuestionAsync(int id, QuestionUpdateRequest request, CancellationToken ct = default) {
            var entity = await _db.Questions.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return null;
            entity.Title = request.Title;
            entity.Content = request.Content;
            entity.QuestionTypeEnum = request.QuestionTypeEnum;
            entity.QuestionDifficultyId = request.QuestionDifficultyId;
            entity.AdditionalData = request.AdditionalData;
            // Update answers: xóa hết tạo lại
            if (request.QuestionTypeEnum == EQuestionType.MultipleChoice && request.MultipleChoiceAnswers != null) {
                var old = _db.QuestionMultipleChoiceAnswers.Where(x => x.QuestionId == entity.Id);
                _db.QuestionMultipleChoiceAnswers.RemoveRange(old);
                foreach (var ans in request.MultipleChoiceAnswers) {
                    await _db.QuestionMultipleChoiceAnswers.AddAsync(new QuestionMultipleChoiceAnswer {
                        QuestionId = entity.Id,
                        AnswerText = ans.AnswerText,
                        IsCorrect = ans.IsCorrect,
                        Explanation = ans.Explanation,
                        OrderIndex = ans.OrderIndex ?? 0,
                        CreatedAt = DateTime.UtcNow
                    }, ct);
                }
            } else if (request.QuestionTypeEnum == EQuestionType.FillBlank && request.FillBlankAnswers != null) {
                var old = _db.QuestionFillBlankAnswers.Where(x => x.QuestionId == entity.Id);
                _db.QuestionFillBlankAnswers.RemoveRange(old);
                foreach (var ans in request.FillBlankAnswers) {
                    await _db.QuestionFillBlankAnswers.AddAsync(new QuestionFillBlankAnswer {
                        QuestionId = entity.Id,
                        CorrectAnswer = ans.CorrectAnswer,
                        NormalizedCorrectAnswer = string.IsNullOrWhiteSpace(ans.NormalizedCorrectAnswer) ? (ans.CorrectAnswer?.Trim().ToLower()) : ans.NormalizedCorrectAnswer,
                        Explanation = ans.Explanation,
                        CreatedAt = DateTime.UtcNow
                    }, ct);
                }
            }
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task<bool> SetActiveAsync(int id, bool isActive, CancellationToken ct = default) {
            var entity = await _db.Questions.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return false;
            entity.IsActive = isActive;
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> DeleteQuestionAsync(int id, CancellationToken ct = default) {
            var entity = await _db.Questions.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null) return false;
            _db.Questions.Remove(entity);
            await _db.SaveChangesAsync(ct);
            return true;
        }
        public async Task<int> BulkCreateAsync(BulkCreateQuestionsRequest request, CancellationToken ct = default) {
            int count = 0;
            foreach (var item in request.Items) { item.QuestionBankId = request.QuestionBankId;
                var entity = await CreateQuestionAsync(item, ct); if (entity!=null) count++; }
            return count;
        }
        public async Task<object> PreviewAsync(int id, bool randomized, CancellationToken ct = default) {
            var q = await GetWithAnswersAsync(id, ct);
            if (q == null) return null;
            if (q.QuestionTypeEnum == EQuestionType.MultipleChoice && randomized && q.QuestionMultipleChoiceAnswers!=null)
            {
                var list = q.QuestionMultipleChoiceAnswers.OrderBy(x=>Guid.NewGuid()).ToList();
                return new {
                    q.Id,q.Title,q.Content,q.QuestionTypeEnum,q.QuestionDifficultyId,
                    Answers = list.Select(a => new { a.AnswerText, a.IsCorrect, a.Explanation, a.OrderIndex })
                };
            }
            else if (q.QuestionTypeEnum == EQuestionType.FillBlank)
            {
                return new {
                    q.Id,q.Title,q.Content,q.QuestionTypeEnum,q.QuestionDifficultyId,
                    Answers = q.QuestionFillBlankAnswers.Select(a => new { a.CorrectAnswer, a.NormalizedCorrectAnswer, a.Explanation })
                };
            }
            return q;
        }
    }
}

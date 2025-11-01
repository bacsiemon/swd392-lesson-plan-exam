using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LessonPlanExam.Repositories.DTOs.QuestionDTOs;

namespace LessonPlanExam.Services.Services {
    public class QuestionService : IQuestionService {
        private readonly IQuestionRepository _repo;
        public QuestionService(IQuestionRepository repo) {
            _repo = repo;
        }
        private static QuestionResponse MapResponse(Question q) {
            var resp = new QuestionResponse {
                Id = q.Id,
                QuestionBankId = q.QuestionBankId,
                Title = q.Title,
                Content = q.Content,
                QuestionTypeEnum = q.QuestionTypeEnum,
                QuestionDifficultyId = q.QuestionDifficultyId,
                AdditionalData = q.AdditionalData,
                IsActive = q.IsActive,
                MultipleChoiceAnswers = new(),
                FillBlankAnswers = new()
            };
            if (q.QuestionTypeEnum == Repositories.Enums.EQuestionType.MultipleChoice && q.QuestionMultipleChoiceAnswers != null) {
                resp.MultipleChoiceAnswers = q.QuestionMultipleChoiceAnswers.Select(a => new MultipleChoiceAnswerPayload {
                    AnswerText = a.AnswerText,
                    IsCorrect = a.IsCorrect ?? false,
                    Explanation = a.Explanation,
                    OrderIndex = a.OrderIndex
                }).ToList();
            } else if (q.QuestionTypeEnum == Repositories.Enums.EQuestionType.FillBlank && q.QuestionFillBlankAnswers != null) {
                resp.FillBlankAnswers = q.QuestionFillBlankAnswers.Select(a => new FillBlankAnswerPayload {
                    CorrectAnswer = a.CorrectAnswer,
                    NormalizedCorrectAnswer = a.NormalizedCorrectAnswer,
                    Explanation = a.Explanation
                }).ToList();
            }
            return resp;
        }
        public async Task<QuestionResponse> CreateAsync(QuestionCreateRequest request, CancellationToken ct = default) {
            var entity = await _repo.CreateQuestionAsync(request,ct);
            entity = await _repo.GetWithAnswersAsync(entity.Id, ct);
            return MapResponse(entity);
        }
        public async Task<IEnumerable<QuestionResponse>> QueryAsync(int? bankId, int? type, int? difficultyId, bool? active, string q, CancellationToken ct = default) {
            var lst = await _repo.QueryAsync(bankId, type, difficultyId, active, q, ct);
            // Nạp answers từng cái
            var result = new List<QuestionResponse>();
            foreach (var qitem in lst) {
                var loaded = await _repo.GetWithAnswersAsync(qitem.Id, ct);
                result.Add(MapResponse(loaded));
            }
            return result;
        }
        public async Task<QuestionResponse> GetByIdAsync(int id, CancellationToken ct = default) {
            var q = await _repo.GetWithAnswersAsync(id, ct);
            return q == null ? null : MapResponse(q);
        }
        public async Task<QuestionResponse> UpdateAsync(int id, QuestionUpdateRequest request, CancellationToken ct = default) {
            var entity = await _repo.UpdateQuestionAsync(id, request, ct);
            if (entity == null) return null;
            entity = await _repo.GetWithAnswersAsync(id, ct);
            return MapResponse(entity);
        }
        public async Task<bool> SetActiveAsync(int id, bool isActive, CancellationToken ct = default) => await _repo.SetActiveAsync(id, isActive, ct);
        public async Task<bool> DeleteAsync(int id, CancellationToken ct = default) => await _repo.DeleteQuestionAsync(id, ct);
        public async Task<int> BulkCreateAsync(BulkCreateQuestionsRequest request, CancellationToken ct = default) => await _repo.BulkCreateAsync(request, ct);
        public async Task<object> PreviewAsync(int id, bool randomized, CancellationToken ct = default) => await _repo.PreviewAsync(id, randomized, ct);
    }
}

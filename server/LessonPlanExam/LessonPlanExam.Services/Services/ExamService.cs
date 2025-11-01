using LessonPlanExam.Repositories.DTOs.ExamDTOs;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.Services.Services
{
    public class ExamService : IExamService
    {
        private readonly IExamRepository _repo;

        public ExamService(IExamRepository repo)
        {
            _repo = repo;
        }

        public async Task<ExamResponse> CreateAsync(ExamCreateRequest request, CancellationToken ct = default)
        {
            // Hash password if provided
            if (!string.IsNullOrEmpty(request.Password))
            {
                request.Password = PasswordHelper.HashPassword(request.Password);
            }
            var entity = await _repo.CreateExamAsync(request, ct);
            return MapResponse(entity);
        }

        public async Task<ExamResponse> CreateFromMatrixAsync(ExamFromMatrixRequest request, CancellationToken ct = default)
        {
            if (!string.IsNullOrEmpty(request.Password))
            {
                request.Password = PasswordHelper.HashPassword(request.Password);
            }
            var entity = await _repo.CreateExamFromMatrixAsync(request, ct);
            return MapResponse(entity);
        }

        public async Task<IEnumerable<ExamResponse>> QueryAsync(int? teacherId, LessonPlanExam.Repositories.Enums.EExamStatus? status, string q, CancellationToken ct = default)
        {
            var list = await _repo.GetExamsByTeacherAsync(teacherId, status, q, ct);
            return list.Select(MapResponse);
        }

        public async Task<ExamResponse> GetByIdAsync(int id, CancellationToken ct = default)
        {
            var exam = await _repo.GetExamWithQuestionsAsync(id, ct);
            return exam == null ? null : MapResponse(exam);
        }

        public async Task<ExamResponse> UpdateAsync(int id, ExamUpdateRequest request, CancellationToken ct = default)
        {
            if (!string.IsNullOrEmpty(request.Password))
            {
                request.Password = PasswordHelper.HashPassword(request.Password);
            }
            var ent = await _repo.UpdateExamAsync(id, request, ct);
            return ent == null ? null : MapResponse(ent);
        }

        public async Task<bool> UpdateStatusAsync(int id, LessonPlanExam.Repositories.Enums.EExamStatus status, CancellationToken ct = default)
        {
            return await _repo.UpdateExamStatusAsync(id, status, ct);
        }

        public async Task<ExamQuestionResponse> AddQuestionAsync(int examId, ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            var ent = await _repo.AddExamQuestionAsync(examId, request, ct);
            return ent == null ? null : MapItemResponse(ent);
        }

        public async Task<IEnumerable<ExamQuestionResponse>> GetQuestionsAsync(int examId, CancellationToken ct = default)
        {
            var exam = await _repo.GetExamWithQuestionsAsync(examId, ct);
            if (exam == null) return null;
            return exam.ExamQuestions.Select(MapItemResponse);
        }

        public async Task<ExamQuestionResponse> UpdateQuestionAsync(int examQuestionId, ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            var ent = await _repo.UpdateExamQuestionAsync(examQuestionId, request, ct);
            return ent == null ? null : MapItemResponse(ent);
        }

        public async Task<bool> DeleteQuestionAsync(int examQuestionId, CancellationToken ct = default)
        {
            return await _repo.DeleteExamQuestionAsync(examQuestionId, ct);
        }

        public async Task<PreviewRandomResponse> PreviewRandomAsync(int matrixId, decimal? totalPoints, CancellationToken ct = default)
        {
            var items = await _repo.PreviewRandomAsync(matrixId, totalPoints, ct);
            if (items == null) return null;
            return new PreviewRandomResponse { Questions = items.ToList() };
        }

        public async Task<AccessCheckResponse> CheckAccessAsync(int examId, int? studentId, string password, CancellationToken ct = default)
        {
            var exam = await _repo.GetExamWithQuestionsAsync(examId, ct);
            if (exam == null) return new AccessCheckResponse { Ok = false, Errors = new List<string> { "EXAM_NOT_FOUND" } };
            var errors = new List<string>();
            var now = DateTime.UtcNow;

            if (exam.StatusEnum != LessonPlanExam.Repositories.Enums.EExamStatus.Active)
            {
                errors.Add("EXAM_NOT_ACTIVE");
            }

            if (exam.StartTime.HasValue && now < exam.StartTime.Value)
            {
                errors.Add("EXAM_NOT_STARTED");
            }

            if (exam.EndTime.HasValue && now > exam.EndTime.Value)
            {
                errors.Add("EXAM_ENDED");
            }

            if (!string.IsNullOrEmpty(exam.PasswordHash))
            {
                if (string.IsNullOrEmpty(password) || !PasswordHelper.VerifyPassword(password, exam.PasswordHash))
                {
                    errors.Add("INVALID_PASSWORD");
                }
            }

            if (studentId.HasValue && exam.MaxAttempts.HasValue)
            {
                var attempts = await _repo.GetStudentAttemptCountAsync(exam.Id, studentId.Value, ct);
                if (attempts >= exam.MaxAttempts.Value)
                {
                    errors.Add("NO_ATTEMPTS_LEFT");
                }
            }

            return new AccessCheckResponse
            {
                Ok = errors.Count == 0,
                Errors = errors
            };
        }

        private static ExamResponse MapResponse(Repositories.Models.Exam e)
        {
            if (e == null) return null;
            var r = new ExamResponse
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                CreatedByTeacher = e.CreatedByTeacher,
                GradeLevel = e.GradeLevel,
                DurationMinutes = e.DurationMinutes,
                PassThreshold = e.PassThreshold,
                ShowResultsImmediately = e.ShowResultsImmediately,
                ShowCorrectAnswers = e.ShowCorrectAnswers,
                RandomizeQuestions = e.RandomizeQuestions,
                RandomizeAnswers = e.RandomizeAnswers,
                ScoringMethodEnum = e.ScoringMethodEnum,
                MaxAttempts = e.MaxAttempts,
                StartTime = e.StartTime,
                EndTime = e.EndTime,
                StatusEnum = e.StatusEnum,
                ExamMatrixId = e.ExamMatrixId,
                TotalQuestions = e.TotalQuestions,
                TotalPoints = e.TotalPoints,
                Questions = e.ExamQuestions?.Select(MapItemResponse).ToList() ?? new List<ExamQuestionResponse>()
            };
            return r;
        }

        private static ExamQuestionResponse MapItemResponse(Repositories.Models.ExamQuestion q)
        {
            if (q == null) return null;
            return new ExamQuestionResponse
            {
                Id = q.Id,
                ExamId = q.ExamId,
                QuestionId = q.QuestionId,
                OrderIndex = q.OrderIndex,
                Points = q.Points,
                QuestionTitle = q.Question?.Title,
                QuestionContent = q.Question?.Content,
                QuestionDifficultyId = q.Question?.QuestionDifficultyId ?? 0,
                QuestionTypeEnum = (int)q.Question?.QuestionTypeEnum
            };
        }
    }
}

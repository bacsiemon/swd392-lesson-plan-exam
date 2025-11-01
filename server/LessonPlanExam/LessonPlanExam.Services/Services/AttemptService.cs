using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Repositories.DTOs.AttemptDTOs;
using LessonPlanExam.Services.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System;
using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Services.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace LessonPlanExam.Services.Services
{
    public class AttemptService : IAttemptService
    {
        private readonly IExamRepository _examRepo;
        private readonly IExamAttemptRepository _attemptRepo;
        private readonly IExamAttemptAnswerRepository _answerRepo;
        private readonly IQuestionRepository _questionRepo;

        public AttemptService(IExamRepository examRepo, IExamAttemptRepository attemptRepo, IExamAttemptAnswerRepository answerRepo, IQuestionRepository questionRepo)
        {
            _examRepo = examRepo;
            _attemptRepo = attemptRepo;
            _answerRepo = answerRepo;
            _questionRepo = questionRepo;
        }

        public async Task<AttemptStartResponse> StartAttemptAsync(int examId, int studentId, string password, CancellationToken ct = default)
        {
            var exam = await _examRepo.GetExamWithQuestionsAsync(examId, ct);
            if (exam == null) return null;

            // Check status/time/password/attempts
            if (exam.StatusEnum != LessonPlanExam.Repositories.Enums.EExamStatus.Active) return null;
            var now = DateTime.UtcNow;
            if (exam.StartTime.HasValue && now < exam.StartTime.Value) return null;
            if (exam.EndTime.HasValue && now > exam.EndTime.Value) return null;
            if (!string.IsNullOrEmpty(exam.PasswordHash) && !PasswordHelper.VerifyPassword(password, exam.PasswordHash)) return null;
            if (exam.MaxAttempts.HasValue)
            {
                var cnt = await _attemptRepo.GetAttemptCountForStudentAsync(examId, studentId, ct);
                if (cnt >= exam.MaxAttempts.Value) return null;
            }

            // Create attempt
            var attempt = new ExamAttempt
            {
                ExamId = exam.Id,
                StudentId = studentId,
                AttemptNumber = (await _attemptRepo.GetAttemptCountForStudentAsync(examId, studentId, ct)) + 1,
                StartedAt = DateTime.UtcNow,
                StatusEnum = LessonPlanExam.Repositories.Enums.EAttemptStatus.InProgress,
                CreatedAt = DateTime.UtcNow
            };

            attempt = await _attemptRepo.CreateAttemptAsync(attempt, ct);

            // Snapshot questions order - if RandomizeQuestions then shuffle presentation
            var qitems = exam.ExamQuestions.OrderBy(x => x.OrderIndex).ToList();
            var presentation = new List<AttemptQuestionItem>();
            var rnd = new Random();
            var toPresent = exam.RandomizeQuestions == true ? qitems.OrderBy(x => rnd.Next()).ToList() : qitems;
            int idx = 1;
            foreach (var q in toPresent)
            {
                presentation.Add(new AttemptQuestionItem
                {
                    QuestionId = q.QuestionId,
                    OrderIndex = idx++,
                    PointsPossible = q.Points
                });
            }

            return new AttemptStartResponse
            {
                AttemptId = attempt.Id,
                AttemptNumber = attempt.AttemptNumber,
                ExamId = exam.Id,
                DurationMinutes = exam.DurationMinutes,
                StartedAt = attempt.StartedAt.Value,
                Questions = presentation
            };
        }

        public async Task<bool> SaveAnswerAsync(int examId, int attemptId, SaveAnswerRequest request, CancellationToken ct = default)
        {
            // Validate attempt exists
            var att = await _attemptRepo.GetAttemptWithAnswersAsync(attemptId, ct);
            if (att == null) return false;

            List<int> selectedIds = new List<int>();
            if (!string.IsNullOrWhiteSpace(request.SelectedAnswerIds))
            {
                selectedIds = request.SelectedAnswerIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => {
                        if (int.TryParse(s.Trim(), out var v)) return v;
                        return -1;
                    })
                    .Where(v => v > 0)
                    .ToList();
            }

            var answer = new ExamAttemptAnswer
            {
                ExamAttemptId = attemptId,
                QuestionId = request.QuestionId,
                SelectedAnswerIds = selectedIds,
                TextAnswer = request.TextAnswer,
                AnswerData = request.AnswerData,
                CreatedAt = DateTime.UtcNow
            };
            await _answerRepo.SaveAnswerAsync(answer, ct);
            return true;
        }

        public async Task<SubmitResponse> SubmitAttemptAsync(int examId, int attemptId, CancellationToken ct = default)
        {
            var attempt = await _attemptRepo.GetAttemptWithAnswersAsync(attemptId, ct);
            if (attempt == null) return null;

            // Auto grading
            decimal totalPossible = 0m;
            decimal totalEarned = 0m;
            var details = new List<SubmitQuestionDetail>();

            // load exam once
            var exam = await _examRepo.GetExamWithQuestionsAsync(attempt.ExamId, ct);

            foreach (var item in attempt.ExamAttemptAnswers)
            {
                var question = await _questionRepo.GetWithAnswersAsync(item.QuestionId, ct);
                if (question == null) continue;
                decimal ptsPossible = 1m;
                // find exam question points
                var eqItem = exam.ExamQuestions.FirstOrDefault(x => x.QuestionId == item.QuestionId && x.ExamId == attempt.ExamId);
                if (eqItem != null) ptsPossible = eqItem.Points ?? 1m;

                totalPossible += ptsPossible;
                decimal earned = 0m;
                bool correct = false;

                if (question.QuestionTypeEnum == LessonPlanExam.Repositories.Enums.EQuestionType.MultipleChoice)
                {
                    // compare selected ids with correct answers
                    var correctAnswers = question.QuestionMultipleChoiceAnswers.Where(a => a.IsCorrect == true).Select(a => a.Id).OrderBy(x => x).ToList();
                    var selected = item.SelectedAnswerIds ?? new List<int>();
                    if (correctAnswers.SequenceEqual(selected.OrderBy(x => x)))
                    {
                        earned = ptsPossible;
                        correct = true;
                    }
                }
                else if (question.QuestionTypeEnum == LessonPlanExam.Repositories.Enums.EQuestionType.FillBlank)
                {
                    var correctAnswers = question.QuestionFillBlankAnswers.Select(a => a.NormalizedCorrectAnswer).ToList();
                    var normalized = NormalizeText(item.TextAnswer);
                    if (correctAnswers.Any(ca => ca == normalized))
                    {
                        earned = ptsPossible;
                        correct = true;
                    }
                }

                totalEarned += earned;
                details.Add(new SubmitQuestionDetail
                {
                    QuestionId = item.QuestionId,
                    PointsPossible = ptsPossible,
                    PointsEarned = earned,
                    Correct = correct,
                    Explanation = "" // optionally fill from question data
                });
            }

            // Update attempt
            attempt.TotalScore = totalEarned;
            attempt.MaxScore = totalPossible;
            attempt.ScorePercentage = totalPossible > 0 ? (decimal)Math.Round((double)(totalEarned / totalPossible * 100), 2) : 0;
            attempt.StatusEnum = LessonPlanExam.Repositories.Enums.EAttemptStatus.Submitted;
            attempt.UpdatedAt = DateTime.UtcNow;

            // Persist changes: not implemented via repo update method; assume ChangeTracker
            // For production, add method in repo to update attempt and save.

            var passed = false;
            if (attempt.ScorePercentage.HasValue && exam.PassThreshold.HasValue)
            {
                passed = attempt.ScorePercentage.Value >= exam.PassThreshold.Value;
            }

            return new SubmitResponse
            {
                AttemptId = attempt.Id,
                TotalScore = totalEarned,
                ScorePercentage = attempt.ScorePercentage ?? 0,
                Passed = passed,
                Details = details
            };
        }

        public async Task<SubmitResponse> GetAttemptResultAsync(int examId, int attemptId, int studentId, CancellationToken ct = default)
        {
            var attempt = await _attemptRepo.GetAttemptWithAnswersAsync(attemptId, ct);
            if (attempt == null) return null;
            if (attempt.StudentId != studentId) return null;
            return new SubmitResponse
            {
                AttemptId = attempt.Id,
                TotalScore = attempt.TotalScore ?? 0,
                ScorePercentage = attempt.ScorePercentage ?? 0,
                Passed = (attempt.ScorePercentage ?? 0) >= (attempt.Exam?.PassThreshold ?? 0),
                Details = new List<SubmitQuestionDetail>()
            };
        }

        private static string NormalizeText(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";
            var s = input.Trim().ToLowerInvariant();
            // remove diacritics
            var normalized = s.Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder();
            foreach (var ch in normalized)
            {
                var uc = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch);
                if (uc != System.Globalization.UnicodeCategory.NonSpacingMark)
                    sb.Append(ch);
            }
            return sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }
    }
}

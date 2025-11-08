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
            // Check if ExamQuestions is null or empty
            var qitems = exam.ExamQuestions?.OrderBy(x => x.OrderIndex).ToList() ?? new List<ExamQuestion>();
            
            // Log for debugging
            System.Diagnostics.Debug.WriteLine($"[StartAttempt] ExamId: {examId}, ExamQuestions count: {qitems.Count}");
            
            var presentation = new List<AttemptQuestionItem>();
            var rnd = new Random();
            var toPresent = exam.RandomizeQuestions == true ? qitems.OrderBy(x => rnd.Next()).ToList() : qitems;
            int idx = 1;
            foreach (var q in toPresent)
            {
                // Only add if QuestionId is valid
                if (q.QuestionId > 0)
                {
                    presentation.Add(new AttemptQuestionItem
                    {
                        QuestionId = q.QuestionId,
                        OrderIndex = idx++,
                        PointsPossible = q.Points
                    });
                    System.Diagnostics.Debug.WriteLine($"[StartAttempt] Added question: QuestionId={q.QuestionId}, OrderIndex={idx-1}, Points={q.Points}");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"[StartAttempt] Skipped question with invalid QuestionId: {q.QuestionId}");
                }
            }

            System.Diagnostics.Debug.WriteLine($"[StartAttempt] Final presentation count: {presentation.Count}");

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

        public async Task<SaveAnswerResult> SaveAnswerAsync(int examId, int attemptId, SaveAnswerRequest request, CancellationToken ct = default)
        {
            // Validate attempt exists
            var att = await _attemptRepo.GetAttemptWithAnswersAsync(attemptId, ct);
            if (att == null) return SaveAnswerResult.Fail("ATTEMPT_NOT_FOUND", "Attempt does not exist or is not accessible.");

            // Validate attempt belongs to exam
            if (att.ExamId != examId) return SaveAnswerResult.Fail("ATTEMPT_EXAM_MISMATCH", "Attempt does not belong to the specified exam.");

            // Load question to validate payload type
            var question = await _questionRepo.GetWithAnswersAsync(request.QuestionId, ct);
            if (question == null) return SaveAnswerResult.Fail("QUESTION_NOT_FOUND", "Question not found.");

            if (question.QuestionTypeEnum == LessonPlanExam.Repositories.Enums.EQuestionType.MultipleChoice)
            {
                // require selected ids
                if (request.SelectedAnswerIds == null || !request.SelectedAnswerIds.Any()) return SaveAnswerResult.Fail("MCQ_SELECTION_REQUIRED", "Selected answer ids are required for multiple choice questions.");
                // optional: validate ids exist in question options
                var optionIds = question.QuestionMultipleChoiceAnswers?.Select(a => a.Id).ToHashSet() ?? new HashSet<int>();
                if (!request.SelectedAnswerIds.All(id => optionIds.Contains(id))) return SaveAnswerResult.Fail("MCQ_OPTION_INVALID", "One or more selected answer ids are invalid.");
            }
            else if (question.QuestionTypeEnum == LessonPlanExam.Repositories.Enums.EQuestionType.FillBlank)
            {
                if (string.IsNullOrWhiteSpace(request.TextAnswer)) return SaveAnswerResult.Fail("FILLBLANK_TEXT_REQUIRED", "Text answer is required for fill-blank questions.");
            }

            // Only set AnswerData if it's provided and not empty or just "{}"
            string finalAnswerData = null;
            if (!string.IsNullOrWhiteSpace(request.AnswerData) && request.AnswerData != "{}")
            {
                finalAnswerData = request.AnswerData;
            }
            
            var answer = new ExamAttemptAnswer
            {
                ExamAttemptId = attemptId,
                QuestionId = request.QuestionId,
                SelectedAnswerIds = request.SelectedAnswerIds ?? new List<int>(),
                TextAnswer = request.TextAnswer,
                AnswerData = finalAnswerData,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Debug logging
            System.Diagnostics.Debug.WriteLine($"[SaveAnswer] QuestionId={request.QuestionId}, SelectedAnswerIds=[{string.Join(",", answer.SelectedAnswerIds ?? new List<int>())}], Count={answer.SelectedAnswerIds?.Count ?? 0}, TextAnswer={(answer.TextAnswer != null ? "has value" : "null")}, AnswerData={(answer.AnswerData != null ? answer.AnswerData : "null")}");
            
            await _answerRepo.SaveAnswerAsync(answer, ct);
            return SaveAnswerResult.Ok();
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
                    var selectedOrdered = selected.OrderBy(x => x).ToList();
                    
                    // Debug logging
                    System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] QuestionId={item.QuestionId}, CorrectAnswers=[{string.Join(",", correctAnswers)}], Selected=[{string.Join(",", selected)}], SelectedOrdered=[{string.Join(",", selectedOrdered)}]");
                    
                    // Compare: both lists must have same count and same elements in same order
                    bool isEqual = correctAnswers.Count == selectedOrdered.Count && correctAnswers.SequenceEqual(selectedOrdered);
                    System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] QuestionId={item.QuestionId}, IsEqual={isEqual}, CorrectCount={correctAnswers.Count}, SelectedCount={selectedOrdered.Count}");
                    
                    if (isEqual)
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
            attempt.SubmittedAt = DateTime.UtcNow; // Set SubmittedAt when submitting
            attempt.AutoGradedAt = DateTime.UtcNow; // Set AutoGradedAt since we're auto-grading
            attempt.UpdatedAt = DateTime.UtcNow;

            System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] Before UpdateAttemptAsync - Attempt {attempt.Id}: TotalScore={attempt.TotalScore}, MaxScore={attempt.MaxScore}, ScorePercentage={attempt.ScorePercentage}, StatusEnum={attempt.StatusEnum}, SubmittedAt={attempt.SubmittedAt}");

            // Persist changes to database
            try
            {
                var updatedAttempt = await _attemptRepo.UpdateAttemptAsync(attempt, ct);
                System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] After UpdateAttemptAsync - Attempt {updatedAttempt.Id}: TotalScore={updatedAttempt.TotalScore}, MaxScore={updatedAttempt.MaxScore}, ScorePercentage={updatedAttempt.ScorePercentage}, StatusEnum={updatedAttempt.StatusEnum}, SubmittedAt={updatedAttempt.SubmittedAt}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] ERROR updating attempt {attempt.Id}: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] StackTrace: {ex.StackTrace}");
                throw; // Re-throw to let controller handle it
            }

            var passed = false;
            if (attempt.ScorePercentage.HasValue && exam.PassThreshold.HasValue)
            {
                passed = attempt.ScorePercentage.Value >= exam.PassThreshold.Value;
            }

            System.Diagnostics.Debug.WriteLine($"[SubmitAttempt] Attempt {attempt.Id} submitted successfully: TotalScore={totalEarned}, MaxScore={totalPossible}, ScorePercentage={attempt.ScorePercentage}, SubmittedAt={attempt.SubmittedAt}, Passed={passed}");

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

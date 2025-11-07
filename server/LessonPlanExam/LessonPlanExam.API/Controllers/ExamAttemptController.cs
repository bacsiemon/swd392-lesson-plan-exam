using LessonPlanExam.Repositories.DTOs.AttemptDTOs;
using LessonPlanExam.Repositories.Interfaces;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/exams/{examId}/attempts")]
    [ApiController]
    public class ExamAttemptController : ControllerBase
    {
        private readonly IAttemptService _attemptService;
        private readonly IExamAttemptRepository _attemptRepo;
        private readonly IAccountService _accountService;

        public ExamAttemptController(IAttemptService attemptService, IExamAttemptRepository attemptRepo, IAccountService accountService)
        {
            _attemptService = attemptService;
            _attemptRepo = attemptRepo;
            _accountService = accountService;
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Start a new attempt for the specified exam if conditions are met (exam active, within time window,
        /// attempts left and student authenticated). If the exam is password protected pass `password` as query parameter.
        /// 
        /// Sample call:
        /// ```
        /// POST /api/exams/5/attempts/start?password=plainText
        /// ```
        /// </remarks>
        /// <param name="examId">The ID of the exam to attempt.</param>
        /// <param name="password">Optional plain-text password for protected exams.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns attempt start payload with question snapshot.</response>
        /// <response code="400">If attempt cannot be started (limits, timing, etc.).</response>
        /// <response code="401">If the user is not authenticated.</response>
        [HttpPost("start")]
        public async Task<IActionResult> StartAttempt([FromRoute] int examId, [FromQuery] string password = null, CancellationToken ct = default)
        {
            int studentId;
            try { studentId = _accountService.GetCurrentUserId(); }
            catch { return Unauthorized(); }

            var res = await _attemptService.StartAttemptAsync(examId, studentId, password, ct);
            if (res == null) return BadRequest(new { Message = "CANNOT_START_ATTEMPT" });
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Save or update a single answer for an in-progress attempt.
        /// For MCQ send `selectedAnswerIds` as an array of integers. For fill-blank send `textAnswer`.
        /// `answerData` is optional JSON/string for rich answers or metadata.
        /// 
        /// Sample MCQ request body:
        /// ```
        /// { "questionId": 123, "selectedAnswerIds": [10, 11] }
        /// ```
        /// 
        /// Sample Fill-Blank request body:
        /// ```
        /// { "questionId": 124, "textAnswer": "water" }
        /// ```
        /// 
        /// Sample with answerData:
        /// ```
        /// { "questionId": 125, "textAnswer": "answer", "answerData": "{\"steps\": [\"1\", \"2\"]}" }
        /// ```
        /// </remarks>
        /// <param name="examId">The exam ID.</param>
        /// <param name="attemptId">The attempt ID.</param>
        /// <param name="request">Answer payload.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the answer was saved successfully. Returns SaveAnswerResult.</response>
        /// <response code="400">If the request is invalid or cannot be saved. Returns error code and message.</response>
        [HttpPost("{attemptId}/answer")]
        public async Task<IActionResult> SaveAnswer([FromRoute] int examId, [FromRoute] int attemptId, [FromBody] SaveAnswerRequest request, CancellationToken ct = default)
        {
            if (request == null) return BadRequest(new { Error = "INVALID_REQUEST", Message = "Request body is required." });
            
            // Debug logging
            System.Diagnostics.Debug.WriteLine($"[SaveAnswer Controller] ExamId={examId}, AttemptId={attemptId}, QuestionId={request.QuestionId}, SelectedAnswerIds=[{string.Join(",", request.SelectedAnswerIds ?? new List<int>())}], Count={request.SelectedAnswerIds?.Count ?? 0}, TextAnswer={(request.TextAnswer != null ? "has value" : "null")}, AnswerData={(request.AnswerData != null ? request.AnswerData : "null")}");
            
            var result = await _attemptService.SaveAnswerAsync(examId, attemptId, request, ct);
            if (result == null) return BadRequest(new { Error = "UNKNOWN_ERROR", Message = "Save operation failed." });
            if (!result.Success)
            {
                System.Diagnostics.Debug.WriteLine($"[SaveAnswer Controller] Failed: ErrorCode={result.ErrorCode}, Message={result.Message}");
                return BadRequest(new { Error = result.ErrorCode ?? "SAVE_FAILED", Message = result.Message });
            }
            
            System.Diagnostics.Debug.WriteLine($"[SaveAnswer Controller] Success: QuestionId={request.QuestionId}");
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Submit an attempt for auto-grading. The system will grade MCQ and Fill-Blank automatically and return
        /// the score summary and per-question details (if allowed by exam settings).
        /// 
        /// Sample call:
        /// ```
        /// POST /api/exams/5/attempts/10/submit
        /// ```
        /// </remarks>
        /// <param name="examId">The exam ID.</param>
        /// <param name="attemptId">The attempt ID to submit.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns grading result with total score and details.</response>
        /// <response code="400">If submission fails (invalid attempt, already submitted, etc.).</response>
        [HttpPost("{attemptId}/submit")]
        public async Task<IActionResult> SubmitAttempt([FromRoute] int examId, [FromRoute] int attemptId, CancellationToken ct = default)
        {
            var res = await _attemptService.SubmitAttemptAsync(examId, attemptId, ct);
            if (res == null) return BadRequest(new { Message = "CANNOT_SUBMIT_ATTEMPT" });
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get the latest attempt of the currently authenticated student for the given exam.
        /// Useful for students to resume or view their most recent attempt.
        /// </remarks>
        /// <param name="examId">The exam ID.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the latest attempt result for the student.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="404">If no attempt is found.</response>
        [HttpGet("my-latest")]
        public async Task<IActionResult> GetMyLatest([FromRoute] int examId, CancellationToken ct = default)
        {
            int studentId;
            try { studentId = _accountService.GetCurrentUserId(); }
            catch { return Unauthorized(); }

            var attempts = await _attemptRepo.QueryAttemptsByExamAsync(examId, null, ct);
            var myLatest = attempts.FirstOrDefault(a => a.StudentId == studentId);
            if (myLatest == null) return NotFound();

            var res = await _attemptService.GetAttemptResultAsync(examId, myLatest.Id, studentId, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get detailed attempt information including saved answers for review. Students can fetch their own
        /// attempts; teachers can fetch attempts for their exams (authorization should be enforced in controller/service).
        /// </remarks>
        /// <param name="examId">The exam ID.</param>
        /// <param name="attemptId">The attempt ID.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns detailed attempt information.</response>
        /// <response code="404">If the attempt is not found.</response>
        [HttpGet("{attemptId}")]
        public async Task<IActionResult> GetAttemptDetail([FromRoute] int examId, [FromRoute] int attemptId, CancellationToken ct = default)
        {
            var attempt = await _attemptRepo.GetAttemptWithAnswersAsync(attemptId, ct);
            if (attempt == null) return NotFound();

            var dto = new AttemptDetailResponse
            {
                AttemptId = attempt.Id,
                ExamId = attempt.ExamId,
                StudentId = attempt.StudentId,
                AttemptNumber = attempt.AttemptNumber,
                StartedAt = attempt.StartedAt,
                SubmittedAt = attempt.SubmittedAt,
                StatusEnum = attempt.StatusEnum,
                TotalScore = attempt.TotalScore,
                MaxScore = attempt.MaxScore,
                ScorePercentage = attempt.ScorePercentage,
                Answers = attempt.ExamAttemptAnswers?.Select(a => new AttemptAnswerItem
                {
                    QuestionId = a.QuestionId,
                    SelectedAnswerIds = a.SelectedAnswerIds ?? new List<int>(),
                    TextAnswer = a.TextAnswer,
                    AnswerData = a.AnswerData,
                    PointsEarned = a.PointsEarned,
                    PointsPossible = a.PointsPossible,
                    IsCorrect = a.IsCorrect
                }).ToList() ?? new List<AttemptAnswerItem>()
            };

            return Ok(dto);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Query attempts for a specific exam. Typically used by teachers to list student attempts and filter by status.
        /// Use `status` query parameter to filter by attempt status.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/exams/5/attempts?status=2
        /// ```
        /// </remarks>
        /// <param name="examId">The exam ID.</param>
        /// <param name="status">Optional status filter (use enum value for EAttemptStatus).</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns a list of attempts (summary fields).</response>
        [HttpGet]
        public async Task<IActionResult> Query([FromRoute] int examId, [FromQuery] int? status = null, CancellationToken ct = default)
        {
            var list = await _attemptRepo.QueryAttemptsByExamAsync(examId, status, ct);
            var dto = list.Select(a => new
            {
                a.Id,
                a.StudentId,
                a.AttemptNumber,
                Status = a.StatusEnum,
                a.StartedAt,
                a.SubmittedAt,
                a.TotalScore,
                a.ScorePercentage
            });
            return Ok(dto);
        }
    }
}

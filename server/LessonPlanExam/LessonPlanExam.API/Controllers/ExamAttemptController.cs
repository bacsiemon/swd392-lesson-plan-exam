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

        [HttpPost("{attemptId}/answer")]
        public async Task<IActionResult> SaveAnswer([FromRoute] int examId, [FromRoute] int attemptId, [FromBody] SaveAnswerRequest request, CancellationToken ct = default)
        {
            if (request == null) return BadRequest();
            var ok = await _attemptService.SaveAnswerAsync(examId, attemptId, request, ct);
            if (!ok) return BadRequest(new { Message = "CANNOT_SAVE_ANSWER" });
            return Ok(new { Status = ok });
        }

        [HttpPost("{attemptId}/submit")]
        public async Task<IActionResult> SubmitAttempt([FromRoute] int examId, [FromRoute] int attemptId, CancellationToken ct = default)
        {
            var res = await _attemptService.SubmitAttemptAsync(examId, attemptId, ct);
            if (res == null) return BadRequest(new { Message = "CANNOT_SUBMIT_ATTEMPT" });
            return Ok(res);
        }

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

using LessonPlanExam.Repositories.DTOs.ExamDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/exams")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _service;

        public ExamController(IExamService service)
        {
            _service = service;
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Create a new exam manually.
        /// 
        /// Sample request:
        /// ```
        /// POST /api/exams
        /// {
        ///   "title": "Chemistry Midterm",
        ///   "description": "Midterm exam for grade 10",
        ///   "createdByTeacher": 1,
        ///   "durationMinutes": 45,
        ///   "maxAttempts": 1,
        ///   "totalPoints": 100
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">The exam creation request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="201">Returns the newly created exam.</response>
        /// <response code="400">If the request is invalid.</response>
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] ExamCreateRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateAsync(request, ct);
            return StatusCode(201, res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Generate an exam from an existing exam matrix. Questions are selected randomly according to the matrix items.
        /// 
        /// Sample request:
        /// ```
        /// POST /api/exams/from-matrix
        /// {
        ///   "examMatrixId": 3,
        ///   "title": "Randomized Chemistry Quiz",
        ///   "createdByTeacher": 1,
        ///   "totalPoints": 100
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">The create-from-matrix request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="201">Returns the newly generated exam with its questions.</response>
        /// <response code="400">If matrix not found or request invalid.</response>
        [HttpPost("from-matrix")]
        public async Task<IActionResult> CreateFromMatrixAsync([FromBody] ExamFromMatrixRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateFromMatrixAsync(request, ct);
            if (res == null) return BadRequest(new { Message = "MATRIX_NOT_FOUND_OR_INVALID" });
            return StatusCode(201, res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get a list of exams with optional filters by teacher, status and a search query.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/exams?teacherId=1&status=Active&q=chemistry
        /// ```
        /// </remarks>
        /// <param name="teacherId">Filter by teacher ID.</param>
        /// <param name="status">Filter by exam status.</param>
        /// <param name="q">Search term in title or description.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the list of exams.</response>
        [HttpGet]
        public async Task<IActionResult> QueryAsync([FromQuery] int? teacherId, [FromQuery] EExamStatus? status, [FromQuery] string q = null, CancellationToken ct = default)
        {
            var res = await _service.QueryAsync(teacherId, status, q, ct);
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get the details of a specific exam by its ID, including associated exam questions.
        /// </remarks>
        /// <param name="id">The ID of the exam to retrieve.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the exam details with questions.</response>
        /// <response code="404">If the exam is not found.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var res = await _service.GetByIdAsync(id, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Update an existing exam's metadata (title, timing, display options, etc.).
        /// </remarks>
        /// <param name="id">The ID of the exam to update.</param>
        /// <param name="request">The exam update request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the updated exam.</response>
        /// <response code="404">If the exam is not found.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] ExamUpdateRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.UpdateAsync(id, request, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Update an exam's status (Draft, Active, Inactive).
        /// 
        /// Sample request:
        /// ```
        /// PATCH /api/exams/12/status
        /// { "statusEnum": 2 } // Active
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the exam.</param>
        /// <param name="request">Status update request containing new status.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the status was updated successfully.</response>
        /// <response code="404">If the exam is not found.</response>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatusAsync([FromRoute] int id, [FromBody] UpdateExamStatusRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ok = await _service.UpdateStatusAsync(id, request.StatusEnum, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Add a question to an exam manually.
        /// 
        /// Sample request:
        /// ```
        /// POST /api/exams/5/questions
        /// { "questionId": 123, "points": 2.5, "orderIndex": 3 }
        /// ```
        /// </remarks>
        /// <param name="id">Exam ID to add the question to.</param>
        /// <param name="request">Question add request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="201">Returns the created exam question record.</response>
        /// <response code="400">If exam or question is invalid.</response>
        [HttpPost("{id}/questions")]
        public async Task<IActionResult> AddQuestionAsync([FromRoute] int id, [FromBody] ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.AddQuestionAsync(id, request, ct);
            if (res == null) return BadRequest(new { Message = "INVALID_EXAM_OR_QUESTION" });
            return StatusCode(201, res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get all questions assigned to an exam.
        /// </remarks>
        /// <param name="id">Exam ID.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the list of exam questions.</response>
        /// <response code="404">If the exam is not found.</response>
        [HttpGet("{id}/questions")]
        public async Task<IActionResult> GetQuestionsAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var res = await _service.GetQuestionsAsync(id, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Update points or order index of an existing exam question.
        /// </remarks>
        /// <param name="examQuestionId">The ID of the exam question to update.</param>
        /// <param name="request">The update request containing points and/or orderIndex.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the updated exam question.</response>
        /// <response code="404">If the exam question is not found.</response>
        [HttpPut("{id}/questions/{examQuestionId}")]
        public async Task<IActionResult> UpdateQuestionAsync([FromRoute] int examQuestionId, [FromBody] ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.UpdateQuestionAsync(examQuestionId, request, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Permanently remove a question from an exam.
        /// </remarks>
        /// <param name="examQuestionId">The ID of the exam question to delete.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the deletion was successful.</response>
        /// <response code="404">If the exam question is not found.</response>
        [HttpDelete("{id}/questions/{examQuestionId}")]
        public async Task<IActionResult> DeleteQuestionAsync([FromRoute] int examQuestionId, CancellationToken ct = default)
        {
            var ok = await _service.DeleteQuestionAsync(examQuestionId, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Preview a randomized set of questions from a matrix without saving to the database.
        /// Use this to verify distribution and point allocation before creating the exam.
        /// 
        /// Query parameter `totalPoints` can be provided to preview point distribution.
        /// </remarks>
        /// <param name="id">The exam matrix ID to preview.</param>
        /// <param name="totalPoints">Optional total points to distribute among previewed questions.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the preview list of questions with estimated points.</response>
        /// <response code="404">If the matrix is not found.</response>
        [HttpPost("{id}/preview-random")]
        public async Task<IActionResult> PreviewRandomAsync([FromRoute] int id, [FromQuery] decimal? totalPoints = null, CancellationToken ct = default)
        {
            var res = await _service.PreviewRandomAsync(id, totalPoints, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Check access conditions for entering an exam: status, start/end time, password and remaining attempts.
        /// 
        /// Sample successful response:
        /// ```
        /// { "ok": true, "errors": [] }
        /// ```
        /// Sample failed response:
        /// ```
        /// { "ok": false, "errors": ["EXAM_NOT_ACTIVE", "INVALID_PASSWORD"] }
        /// ```
        /// </remarks>
        /// <param name="id">Exam ID to check access for.</param>
        /// <param name="studentId">Optional student ID (to check attempts left).</param>
        /// <param name="password">Optional plain-text password to validate against stored hash.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns access check result with list of errors if any.</response>
        [HttpGet("{id}/access")]
        public async Task<IActionResult> CheckAccessAsync([FromRoute] int id, [FromQuery] int? studentId = null, [FromQuery] string password = null, CancellationToken ct = default)
        {
            var res = await _service.CheckAccessAsync(id, studentId, password, ct);
            return Ok(res);
        }
    }
}

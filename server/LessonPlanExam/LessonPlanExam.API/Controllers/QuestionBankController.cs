using LessonPlanExam.Repositories.DTOs.QuestionBankDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
	[Route("api/question-banks")]
	[ApiController]
	public class QuestionBankController : ControllerBase
	{
		private readonly IQuestionBankService _service;

		public QuestionBankController(IQuestionBankService service)
		{
			_service = service;
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Create a new question bank.
        /// 
        /// Sample request:
        /// ```
        /// POST /api/question-banks
        /// {
        ///   "name": "Chemistry Grade 10",
        ///   "gradeLevel": 10,
        ///   "teacherId": 1,
        ///   "description": "Question bank for 10th-grade chemistry."
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">The question bank creation request.</param>
        /// <response code="201">Returns the newly created question bank.</response>
        /// <response code="400">If the request is invalid.</response>
        [HttpPost]
		public async Task<IActionResult> CreateAsync([FromBody] CreateQuestionBankRequest request)
		{
			var res = await _service.CreateAsync(request);
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Get a paginated list of question banks with optional filters.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/question-banks?gradeLevel=10&amp;status=Active&amp;q=chemistry&amp;page=1&amp;size=10
        /// ```
        /// </remarks>
        /// <param name="teacherId">Filter by the ID of the teacher who created the bank.</param>
        /// <param name="gradeLevel">Filter by grade level.</param>
        /// <param name="status">Filter by status (Draft, Active, Archived).</param>
        /// <param name="q">Search term in the name or description.</param>
        /// <param name="page">Page number for pagination (default is 1).</param>
        /// <param name="size">Number of items per page (default is 10).</param>
        /// <response code="200">Returns a paginated list of question banks.</response>
        [HttpGet]
		public async Task<IActionResult> QueryAsync([FromQuery] int? teacherId, [FromQuery] int? gradeLevel, [FromQuery] EQuestionBankStatus? status, [FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int size = 10)
		{
			var res = await _service.QueryAsync(teacherId, gradeLevel, status, q, page, size);
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Get the details of a specific question bank by its ID.
        /// </remarks>
        /// <param name="id">The ID of the question bank to retrieve.</param>
        /// <response code="200">Returns the question bank details.</response>
        /// <response code="404">If the question bank is not found.</response>
        [HttpGet("{id}")]
		public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
		{
			var res = await _service.GetByIdAsync(id);
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Update a question bank's information (name, grade level, description).
        /// </remarks>
        /// <param name="id">The ID of the question bank to update.</param>
        /// <param name="request">The question bank update request.</param>
        /// <response code="200">Returns the updated question bank.</response>
        /// <response code="404">If the question bank is not found.</response>
        [HttpPut("{id}")]
		public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateQuestionBankRequest request)
		{
			var res = await _service.UpdateAsync(id, request);
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Update the status of a question bank (e.g., from Draft to Active).
        /// </remarks>
        /// <param name="id">The ID of the question bank to update.</param>
        /// <param name="request">The request containing the new status.</param>
        /// <response code="200">Returns the updated question bank with the new status.</response>
        /// <response code="404">If the question bank is not found.</response>
        [HttpPatch("{id}/status")]
		public async Task<IActionResult> UpdateStatusAsync([FromRoute] int id, [FromBody] UpdateQuestionBankStatusRequest request)
		{
			var res = await _service.UpdateStatusAsync(id, request);
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Get statistics for a question bank, such as the total number of questions and counts by type and difficulty.
        /// </remarks>
        /// <param name="id">The ID of the question bank.</param>
        /// <response code="200">Returns the statistics for the question bank.</response>
        /// <response code="404">If the question bank is not found.</response>
        [HttpGet("{id}/stats")]
		public async Task<IActionResult> StatsAsync([FromRoute] int id)
		{
			var res = await _service.GetStatsAsync(id);
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Bulk import multiple questions into a question bank from a structured request.
        /// </remarks>
        /// <param name="id">The ID of the question bank to import questions into.</param>
        /// <param name="request">The bulk import request containing the list of questions.</param>
        /// <response code="201">Returns the number of questions successfully imported.</response>
        /// <response code="400">If the request is invalid.</response>
        [HttpPost("{id}/import")]
		public async Task<IActionResult> ImportAsync([FromRoute] int id, [FromBody] ImportQuestionBankItemsRequest request)
		{
			if (request == null) return BadRequest(new { StatusCode = 400, Message = "INVALID_REQUEST" });
			request.QuestionBankId = id; // Enforce that bank id matches route
			var res = await _service.ImportAsync(request); // Returns inserted count
			return StatusCode(res.StatusCode, res);
		}

        /// <summary>User</summary>
        /// <remarks>
        /// Export all questions within a question bank as a JSON object. This is useful for backups or transferring content.
        /// </remarks>
        /// <param name="id">The ID of the question bank to export.</param>
        /// <response code="200">Returns a JSON object containing all questions from the bank.</response>
        /// <response code="404">If the question bank is not found.</response>
        [HttpGet("{id}/export")]
		public async Task<IActionResult> ExportAsync([FromRoute] int id)
		{
			var res = await _service.ExportAsync(id);
			return StatusCode(res.StatusCode, res);
		}
	}
}


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

		/// <summary>
		/// Create a new question bank.
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateAsync([FromBody] CreateQuestionBankRequest request)
		{
			// Call service to create a question bank and return the standardized response
			var res = await _service.CreateAsync(request);
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Get a list of question banks with optional filters
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> QueryAsync([FromQuery] int? teacherId, [FromQuery] int? gradeLevel, [FromQuery] EQuestionBankStatus? status, [FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int size = 10)
		{
			// Service handles filtering and pagination; returns items and paging metadata
			var res = await _service.QueryAsync(teacherId, gradeLevel, status, q, page, size);
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Get details of a question bank by its ID.
		/// </summary>
		[HttpGet("{id}")]
		public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
		{
			// Call service to get details; error if invalid ID
			var res = await _service.GetByIdAsync(id);
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Update a question bank's info
		/// </summary>
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateQuestionBankRequest request)
		{
			var res = await _service.UpdateAsync(id, request);
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Update the status of a question bank 
		/// </summary>
		[HttpPatch("{id}/status")]
		public async Task<IActionResult> UpdateStatusAsync([FromRoute] int id, [FromBody] UpdateQuestionBankStatusRequest request)
		{
			// Service changes status; allowed status: Draft, Active, Archived
			var res = await _service.UpdateStatusAsync(id, request);
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Get statistics of questions inside the bank
		/// </summary>
		[HttpGet("{id}/stats")]
		public async Task<IActionResult> StatsAsync([FromRoute] int id)
		{
			// Returns question counts grouped by type/difficulty/domain
			var res = await _service.GetStatsAsync(id);
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Bulk import multiple questions into the bank
		/// </summary>
		[HttpPost("{id}/import")]
		public async Task<IActionResult> ImportAsync([FromRoute] int id, [FromBody] ImportQuestionBankItemsRequest request)
		{
			if (request == null) return BadRequest(new { StatusCode = 400, Message = "INVALID_REQUEST" });
			request.QuestionBankId = id; // Enforce that bank id matches route
			var res = await _service.ImportAsync(request); // Returns inserted count
			return StatusCode(res.StatusCode, res);
		}

		/// <summary>
		/// Export all questions in the bank as JSON
		/// </summary>
		[HttpGet("{id}/export")]
		public async Task<IActionResult> ExportAsync([FromRoute] int id)
		{
			// Allows easy backup/transfer of whole bank with all questions
			var res = await _service.ExportAsync(id);
			return StatusCode(res.StatusCode, res);
		}
	}
}


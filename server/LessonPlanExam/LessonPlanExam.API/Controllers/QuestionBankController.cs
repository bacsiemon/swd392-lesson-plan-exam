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

		[HttpPost]
		public async Task<IActionResult> CreateAsync([FromBody] CreateQuestionBankRequest request)
		{
			var res = await _service.CreateAsync(request);
			return StatusCode(res.StatusCode, res);
		}

		[HttpGet]
		public async Task<IActionResult> QueryAsync([FromQuery] int? teacherId, [FromQuery] int? gradeLevel, [FromQuery] EQuestionBankStatus? status, [FromQuery] string q, [FromQuery] int page = 1, [FromQuery] int size = 10)
		{
			var res = await _service.QueryAsync(teacherId, gradeLevel, status, q, page, size);
			return StatusCode(res.StatusCode, res);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
		{
			var res = await _service.GetByIdAsync(id);
			return StatusCode(res.StatusCode, res);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateQuestionBankRequest request)
		{
			var res = await _service.UpdateAsync(id, request);
			return StatusCode(res.StatusCode, res);
		}

		[HttpPatch("{id}/status")]
		public async Task<IActionResult> UpdateStatusAsync([FromRoute] int id, [FromBody] UpdateQuestionBankStatusRequest request)
		{
			var res = await _service.UpdateStatusAsync(id, request);
			return StatusCode(res.StatusCode, res);
		}

		[HttpGet("{id}/stats")]
		public async Task<IActionResult> StatsAsync([FromRoute] int id)
		{
			var res = await _service.GetStatsAsync(id);
			return StatusCode(res.StatusCode, res);
		}

		[HttpPost("{id}/import")]
		public async Task<IActionResult> ImportAsync([FromRoute] int id, [FromBody] ImportQuestionBankItemsRequest request)
		{
			if (request == null) return BadRequest(new { StatusCode = 400, Message = "INVALID_REQUEST" });
			request.QuestionBankId = id;
			var res = await _service.ImportAsync(request);
			return StatusCode(res.StatusCode, res);
		}

		[HttpGet("{id}/export")]
		public async Task<IActionResult> ExportAsync([FromRoute] int id)
		{
			var res = await _service.ExportAsync(id);
			return StatusCode(res.StatusCode, res);
		}
	}
}


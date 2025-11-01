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

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] ExamCreateRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateAsync(request, ct);
            return StatusCode(201, res);
        }

        [HttpPost("from-matrix")]
        public async Task<IActionResult> CreateFromMatrixAsync([FromBody] ExamFromMatrixRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateFromMatrixAsync(request, ct);
            if (res == null) return BadRequest(new { Message = "MATRIX_NOT_FOUND_OR_INVALID" });
            return StatusCode(201, res);
        }

        [HttpGet]
        public async Task<IActionResult> QueryAsync([FromQuery] int? teacherId, [FromQuery] EExamStatus? status, [FromQuery] string q = null, CancellationToken ct = default)
        {
            var res = await _service.QueryAsync(teacherId, status, q, ct);
            return Ok(res);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var res = await _service.GetByIdAsync(id, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] ExamUpdateRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.UpdateAsync(id, request, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatusAsync([FromRoute] int id, [FromBody] UpdateExamStatusRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ok = await _service.UpdateStatusAsync(id, request.StatusEnum, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        [HttpPost("{id}/questions")]
        public async Task<IActionResult> AddQuestionAsync([FromRoute] int id, [FromBody] ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.AddQuestionAsync(id, request, ct);
            if (res == null) return BadRequest(new { Message = "INVALID_EXAM_OR_QUESTION" });
            return StatusCode(201, res);
        }

        [HttpGet("{id}/questions")]
        public async Task<IActionResult> GetQuestionsAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var res = await _service.GetQuestionsAsync(id, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPut("{id}/questions/{examQuestionId}")]
        public async Task<IActionResult> UpdateQuestionAsync([FromRoute] int examQuestionId, [FromBody] ExamQuestionAddRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.UpdateQuestionAsync(examQuestionId, request, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpDelete("{id}/questions/{examQuestionId}")]
        public async Task<IActionResult> DeleteQuestionAsync([FromRoute] int examQuestionId, CancellationToken ct = default)
        {
            var ok = await _service.DeleteQuestionAsync(examQuestionId, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        [HttpPost("{id}/preview-random")]
        public async Task<IActionResult> PreviewRandomAsync([FromRoute] int id, [FromQuery] decimal? totalPoints = null, CancellationToken ct = default)
        {
            var res = await _service.PreviewRandomAsync(id, totalPoints, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpGet("{id}/access")]
        public async Task<IActionResult> CheckAccessAsync([FromRoute] int id, [FromQuery] int? studentId = null, [FromQuery] string password = null, CancellationToken ct = default)
        {
            var res = await _service.CheckAccessAsync(id, studentId, password, ct);
            return Ok(res);
        }
    }
}

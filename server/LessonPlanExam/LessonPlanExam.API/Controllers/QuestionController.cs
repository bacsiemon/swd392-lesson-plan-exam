using LessonPlanExam.Repositories.DTOs.QuestionDTOs;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.API.Controllers {
    [Route("api/questions")]
    [ApiController]
    public class QuestionController : ControllerBase {
        private readonly IQuestionService _service;
        public QuestionController(IQuestionService service) { _service = service; }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuestionCreateRequest request, CancellationToken ct) {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateAsync(request, ct);
            return Ok(res);
        }

        [HttpGet]
        public async Task<IActionResult> Query([FromQuery] int? bankId, [FromQuery] int? type, [FromQuery] int? difficultyId, [FromQuery] string domain, [FromQuery] bool? active, [FromQuery] string q, CancellationToken ct) {
            var result = await _service.QueryAsync(bankId, type, difficultyId, domain, active, q, ct);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct) {
            var res = await _service.GetByIdAsync(id, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] QuestionUpdateRequest request, CancellationToken ct) {
            var res = await _service.UpdateAsync(id, request, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ToggleActive([FromRoute] int id, [FromQuery] bool isActive, CancellationToken ct) {
            var ok = await _service.SetActiveAsync(id, isActive, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct) {
            var ok = await _service.DeleteAsync(id, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkCreateQuestionsRequest request, CancellationToken ct) {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var cnt = await _service.BulkCreateAsync(request, ct);
            return Ok(new { Inserted = cnt });
        }

        [HttpGet("{id}/preview")]
        public async Task<IActionResult> Preview([FromRoute] int id, [FromQuery] bool randomized, CancellationToken ct) {
            var preview = await _service.PreviewAsync(id, randomized, ct);
            if (preview == null) return NotFound();
            return Ok(preview);
        }
    }
}

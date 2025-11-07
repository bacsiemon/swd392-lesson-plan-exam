using App.Infrastructure.BaseClasses;
using LessonPlanExam.Repositories.DTOs.QuestionDifficultyDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using LessonPlanExam.API.Attributes;
using System.Threading.Tasks;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/question-difficulties")]
    [ApiController]
    public class QuestionDifficultyController : ControllerBase
    {
        private readonly IQuestionDifficultyService _service;

        public QuestionDifficultyController(IQuestionDifficultyService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateQuestionDifficultyRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateAsync(request);
            return StatusCode(res.StatusCode, res);
        }

        [HttpGet]
        public async Task<IActionResult> QueryAsync([FromQuery] string? domain, [FromQuery] int? difficultyLevel, [FromQuery] int page = 1, [FromQuery] int size = 20)
        {
            var res = await _service.QueryAsync(domain, difficultyLevel, page, size);
            return StatusCode(res.StatusCode, res);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var res = await _service.GetByIdAsync(id);
            return StatusCode(res.StatusCode, res);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateQuestionDifficultyRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.UpdateAsync(id, request);
            return StatusCode(res.StatusCode, res);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            var res = await _service.DeleteAsync(id);
            return StatusCode(res.StatusCode, res);
        }
    }
}

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

        /// <summary>Teacher</summary>
        /// <remarks>
        /// Create a new question difficulty entry.
        /// </remarks>
        /// <param name="request">Create payload</param>
        /// <response code="201">Returns created difficulty</response>
        /// <response code="400">Invalid request</response>
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateQuestionDifficultyRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateAsync(request);
            return StatusCode(res.StatusCode, res);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// Get a paginated list of question difficulties. Optional filters: domain, difficultyLevel.
        /// </remarks>
        /// <param name="domain">Filter by domain</param>
        /// <param name="difficultyLevel">Filter by difficulty level</param>
        /// <param name="page">Page number (default 1)</param>
        /// <param name="size">Page size (default 20)</param>
        /// <response code="200">Returns list of difficulties</response>
        [HttpGet]
        public async Task<IActionResult> QueryAsync([FromQuery] string? domain, [FromQuery] int? difficultyLevel, [FromQuery] int page = 1, [FromQuery] int size = 20)
        {
            var res = await _service.QueryAsync(domain, difficultyLevel, page, size);
            return StatusCode(res.StatusCode, res);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// Get a difficulty by id.
        /// </remarks>
        /// <param name="id">Difficulty id</param>
        /// <response code="200">Returns difficulty</response>
        /// <response code="400">If not found</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var res = await _service.GetByIdAsync(id);
            return StatusCode(res.StatusCode, res);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// Update a difficulty entry.
        /// </remarks>
        /// <param name="id">Difficulty id</param>
        /// <param name="request">Update payload</param>
        /// <response code="200">Returns updated difficulty</response>
        /// <response code="400">If invalid or not found</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateQuestionDifficultyRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.UpdateAsync(id, request);
            return StatusCode(res.StatusCode, res);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// Delete a difficulty entry. Will fail if difficulty is used by existing questions.
        /// </remarks>
        /// <param name="id">Difficulty id</param>
        /// <response code="200">Deleted</response>
        /// <response code="400">If invalid or in use</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            var res = await _service.DeleteAsync(id);
            return StatusCode(res.StatusCode, res);
        }
    }
}

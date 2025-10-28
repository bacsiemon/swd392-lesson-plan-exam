using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonPlanController : ControllerBase
    {
        private readonly ILessonPlanService _lessonPlanService;

        public LessonPlanController(ILessonPlanService lessonPlanService)
        {
            _lessonPlanService = lessonPlanService;
        }


        [HttpPost]
        public async Task<IActionResult> CreateLessonPlanAsync([FromBody] CreateLessonPlanRequest request)
        {
            var response = await _lessonPlanService.CreateLessonPlanAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        
        [HttpGet("current-teacher")]
        public async Task<IActionResult> GetLessonPlansAsync([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _lessonPlanService.GetByCurrentTeacherAsync(page, size);
            return Ok(response);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLessonPlanByIdAsync(int id)
        {
            var response = await _lessonPlanService.GetLessonPlanByIdAsync(id);
            return StatusCode(response.StatusCode, response);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLessonPlanAsync(int id, [FromBody] UpdateLessonPlanRequest request)
        {
            var response = await _lessonPlanService.UpdateLessonPlanAsync(id, request);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLessonPlanAsync(int id)
        {
            var response = await _lessonPlanService.DeleteLessonPlanAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("{id}/upload-file")]
        public async Task<IActionResult> UploadFileAsync(int id, IFormFile file)
        {
            if (file == null)
            {
                return BadRequest(new { StatusCode = 400, Message = "FILE_REQUIRED" });
            }

            var response = await _lessonPlanService.UploadFileAsync(id, file);
            return StatusCode(response.StatusCode, response);
        }
    }
}
using LessonPlanExam.API.Attributes;
using LessonPlanExam.Repositories.DTOs.SlotPlanDTOs;
using LessonPlanExam.Repositories.Enums;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    /// <summary>
    /// SlotPlan management controller
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class SlotPlanController : ControllerBase
    {
        private readonly ISlotPlanService _slotPlanService;

        /// <summary>
        /// SlotPlanController constructor
        /// </summary>
        /// <param name="slotPlanService"></param>
        public SlotPlanController(ISlotPlanService slotPlanService)
        {
            _slotPlanService = slotPlanService;
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        ///
        /// Create a new slot plan for a lesson plan.  
        /// 
        /// Only the lesson plan creator (teacher) can create slot plans for their lesson plans.  
        /// Each slot number must be unique within a lesson plan.  
        ///
        /// Parameters:
        /// lessonPlanId: Required, must be a valid lesson plan ID that belongs to the authenticated teacher.  
        /// slotNumber: Required, must be greater than 0 and unique within the lesson plan.  
        /// title: Required, maximum 255 characters.  
        /// durationMinutes: Optional, duration of the slot in minutes. Must be greater than 0 if provided.  
        /// content: Required, detailed content and activities for this slot.  
        ///
        /// Sample request:
        ///```
        /// POST /api/slotplan  
        /// {  
        /// "lessonPlanId": 1,  
        /// "slotNumber": 1,  
        /// "title": "Introduction and Warm-up",  
        /// "durationMinutes": 15,  
        /// "content": "Begin with a brief review of previous lesson. Introduce today's topic with engaging questions."  
        /// }
        ///```
        /// </remarks>
        /// <param name="request">Slot plan creation request containing all required slot information</param>
        /// <response code="201">Slot plan created successfully. Returns the created slot plan with assigned ID and timestamps.</response>
        /// <response code="400">Validation error. Possible messages:
        /// - LESSON_PLAN_ID_REQUIRED  
        /// - SLOT_NUMBER_REQUIRED  
        /// - TITLE_REQUIRED  
        /// - TITLE_MAX_255_CHARACTERS  
        /// - CONTENT_REQUIRED  
        /// - DURATION_MUST_BE_GREATER_THAN_ZERO  
        /// - SLOT_NUMBER_ALREADY_EXISTS  
        /// </response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. Possible messages:
        /// - TEACHER_ONLY  
        /// - LESSON_PLAN_NOT_OWNED_BY_TEACHER  
        /// </response>
        /// <response code="404">Lesson plan not found. Message: LESSON_PLAN_NOT_FOUND</response>
        /// <response code="500">Internal server error occurred during slot plan creation. Handled by ExceptionMiddleware.</response>
        [HttpPost]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> CreateSlotPlanAsync([FromBody] CreateSlotPlanRequest request)
        {
            var response = await _slotPlanService.CreateSlotPlanAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        ///
        /// Edit an existing slot plan for a lesson plan.  
        /// 
        /// Only the lesson plan creator (teacher) can edit slot plans for their lesson plans.  
        /// The slot number cannot be changed through this endpoint.  
        ///
        /// Parameters:
        /// title: Required, maximum 255 characters.  
        /// durationMinutes: Optional, duration of the slot in minutes. Must be greater than 0 if provided.  
        /// content: Required, detailed content and activities for this slot.  
        ///
        /// Sample request:
        ///```
        /// PUT /api/slotplan/5  
        /// {  
        /// "title": "Updated Introduction and Warm-up",  
        /// "durationMinutes": 20,  
        /// "content": "Begin with a comprehensive review of previous lesson. Introduce today's topic with interactive questions and group discussion."  
        /// }
        ///```
        /// </remarks>
        /// <param name="id">The ID of the slot plan to edit</param>
        /// <param name="request">Slot plan update request containing updated slot information</param>
        /// <response code="200">Slot plan updated successfully. Returns the updated slot plan with modified timestamps.</response>
        /// <response code="400">Validation error. Possible messages:
        /// - TITLE_REQUIRED  
        /// - TITLE_MAX_255_CHARACTERS  
        /// - CONTENT_REQUIRED  
        /// - DURATION_MUST_BE_GREATER_THAN_ZERO  
        /// </response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. Possible messages:
        /// - TEACHER_ONLY  
        /// - LESSON_PLAN_NOT_OWNED_BY_TEACHER  
        /// </response>
        /// <response code="404">Not found. Possible messages:
        /// - SLOT_PLAN_NOT_FOUND  
        /// - LESSON_PLAN_NOT_FOUND  
        /// </response>
        /// <response code="500">Internal server error occurred during slot plan update. Handled by ExceptionMiddleware.</response>
        [HttpPut("{id}")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> EditSlotPlanAsync(int id, [FromBody] UpdateSlotPlanRequest request)
        {
            var response = await _slotPlanService.UpdateSlotPlanAsync(id, request);
            return StatusCode(response.StatusCode, response);
        }
    }
}
using LessonPlanExam.API.Attributes;
using LessonPlanExam.Repositories.DTOs.LessonPlanDTOs;
using LessonPlanExam.Repositories.Enums;
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

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Create a new lesson plan.
        /// 
        /// Parameters:
        /// title: Required, maximum 255 characters.  
        /// createdByTeacher: Required, must be a valid teacher ID.  
        /// objectives: Required, lesson objectives and learning outcomes.  
        /// description: Required, detailed lesson description.  
        /// imageUrl: Optional, URL to lesson plan cover image.  
        /// gradeLevel: Required, target grade level for the lesson.  
        /// 
        /// Sample request:
        /// ```
        /// POST /api/lessonplan  
        /// {  
        /// "title": "Introduction to Mathematics",  
        /// "createdByTeacher": 1,  
        /// "objectives": "Students will learn basic arithmetic operations",  
        /// "description": "This lesson covers addition, subtraction, multiplication and division",  
        /// "imageUrl": "https://example.com/math-cover.jpg",  
        /// "gradeLevel": 5  
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">Lesson plan creation request containing all required lesson information</param>
        /// <response code="201">Lesson plan created successfully. Returns the created lesson plan with assigned ID and timestamps.</response>
        /// <response code="400">Validation error. Possible messages:
        /// - TITLE_REQUIRED  
        /// - TITLE_TOO_LONG  
        /// - TEACHER_ID_REQUIRED  
        /// - OBJECTIVES_REQUIRED  
        /// - DESCRIPTION_REQUIRED  
        /// - GRADE_LEVEL_REQUIRED  
        /// - INVALID_TEACHER_ID  
        /// </response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="500">Internal server error occurred during lesson plan creation. Handled by ExceptionMiddleware.</response>
        [HttpPost]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> CreateLessonPlanAsync([FromBody] CreateLessonPlanRequest request)
        {
            var response = await _lessonPlanService.CreateLessonPlanAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Get paginated list of lesson plans for the current authenticated teacher.
        /// 
        /// Returns lesson plans created by the currently logged-in teacher with pagination support.
        /// Results are ordered by creation date (newest first).
        /// 
        /// Sample request:
        /// ```
        /// GET /api/lessonplan/current-teacher?page=1&amp;size=10
        /// ```
        /// </remarks>
        /// <param name="page">Page number (default: 1). Must be greater than 0.</param>
        /// <param name="size">Number of items per page (default: 10). Must be between 1 and 100.</param>
        /// <response code="200">Lesson plans retrieved successfully. Returns paginated list with lesson plan details and pagination metadata.</response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. User is not a teacher or does not have access to lesson plans.</response>
        /// <response code="500">Internal server error occurred while retrieving lesson plans. Handled by ExceptionMiddleware.</response>
        [HttpGet("current-teacher")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> GetLessonPlansAsync([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _lessonPlanService.GetByCurrentTeacherAsync(page, size);
            return Ok(response);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// 
        /// Get detailed information about a specific lesson plan by ID.
        /// 
        /// Returns complete lesson plan details including associated slot plans and materials.
        /// Access is restricted to the lesson plan creator and authorized users.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/lessonplan/123
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the lesson plan to retrieve</param>
        /// <response code="200">Lesson plan retrieved successfully. Returns detailed lesson plan information including title, objectives, description, grade level, and associated content.</response>
        /// <response code="400">Invalid lesson plan ID provided.</response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. User does not have access to this lesson plan.</response>
        /// <response code="404">Lesson plan not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred while retrieving lesson plan. Handled by ExceptionMiddleware.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLessonPlanByIdAsync(int id)
        {
            var response = await _lessonPlanService.GetLessonPlanByIdAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// 
        /// Search for lesson plans with optional filters and pagination.
        /// 
        /// Allows users to search lesson plans by title, teacher name, and/or grade level.
        /// All search parameters are optional and can be used independently or in combination.
        /// Results are paginated and returned in descending order by creation date.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/lessonplan/search?title=mathematics&amp;teacherName=john&amp;gradeLevel=5&amp;page=1&amp;size=10
        /// ```
        /// </remarks>
        /// <param name="title">Optional title filter. Searches for lesson plans containing this text in the title (case-insensitive)</param>
        /// <param name="teacherName">Optional teacher name filter. Searches for lesson plans created by teachers whose name contains this text (case-insensitive)</param>
        /// <param name="gradeLevel">Optional grade level filter. Searches for lesson plans targeting this specific grade level</param>
        /// <param name="page">Page number for pagination (default: 1). Must be greater than 0</param>
        /// <param name="size">Number of items per page (default: 10). Must be between 1 and 100</param>
        /// <response code="200">Lesson plans retrieved successfully. Returns paginated search results with lesson plan summaries and pagination metadata.</response>
        /// <response code="400">Validation error. Possible messages:
        /// - INVALID_PAGE_NUMBER  
        /// - INVALID_PAGE_SIZE  
        /// - INVALID_GRADE_LEVEL  
        /// </response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="500">Internal server error occurred during search operation. Handled by ExceptionMiddleware.</response>
        [HttpGet("search")]
        public async Task<IActionResult> SearchAsync(
            [FromQuery] string? title,
            [FromQuery] string? teacherName,
            [FromQuery] int? gradeLevel,
            [FromQuery] int page = 1,
            [FromQuery] int size = 10)
        {
            var response = await _lessonPlanService.SearchAsync(title, teacherName, gradeLevel, page, size);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Update an existing lesson plan.
        /// 
        /// Only the lesson plan creator can update their lesson plans.
        /// All fields except ID can be modified. Timestamps are automatically updated.
        /// 
        /// Parameters:
        /// title: Required, maximum 255 characters.  
        /// objectives: Required, updated lesson objectives and learning outcomes.  
        /// description: Required, updated detailed lesson description.  
        /// imageUrl: Optional, URL to updated lesson plan cover image.  
        /// gradeLevel: Required, updated target grade level for the lesson.  
        /// 
        /// Sample request:
        /// ```
        /// PUT /api/lessonplan/123  
        /// {  
        /// "title": "Advanced Mathematics Concepts",  
        /// "objectives": "Students will master complex arithmetic and basic algebra",  
        /// "description": "Extended lesson covering fractions, decimals, and introduction to variables",  
        /// "imageUrl": "https://example.com/advanced-math-cover.jpg",  
        /// "gradeLevel": 6  
        /// }
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the lesson plan to update</param>
        /// <param name="request">Updated lesson plan information</param>
        /// <response code="200">Lesson plan updated successfully. Returns the updated lesson plan information.</response>
        /// <response code="400">Validation error. Possible messages:
        /// - TITLE_REQUIRED  
        /// - TITLE_TOO_LONG  
        /// - OBJECTIVES_REQUIRED  
        /// - DESCRIPTION_REQUIRED  
        /// - GRADE_LEVEL_REQUIRED  
        /// - INVALID_LESSON_PLAN_ID  
        /// </response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. User does not have permission to update this lesson plan.</response>
        /// <response code="404">Lesson plan not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during lesson plan update. Handled by ExceptionMiddleware.</response>
        [HttpPut("{id}")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> UpdateLessonPlanAsync(int id, [FromBody] UpdateLessonPlanRequest request)
        {
            var response = await _lessonPlanService.UpdateLessonPlanAsync(id, request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Delete a lesson plan permanently.
        /// 
        /// Only the lesson plan creator can delete their lesson plans.
        /// This action is irreversible and will also remove all associated slot plans and materials.
        /// 
        /// Sample request:
        /// ```
        /// DELETE /api/lessonplan/123
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the lesson plan to delete</param>
        /// <response code="200">Lesson plan deleted successfully.</response>
        /// <response code="400">Invalid lesson plan ID provided.</response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. User does not have permission to delete this lesson plan.</response>
        /// <response code="404">Lesson plan not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during lesson plan deletion. Handled by ExceptionMiddleware.</response>
        [HttpDelete("{id}")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> DeleteLessonPlanAsync(int id)
        {
            var response = await _lessonPlanService.DeleteLessonPlanAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Upload a file attachment to an existing lesson plan.
        /// 
        /// Allows teachers to attach supplementary materials, documents, images, or other resources to their lesson plans.
        /// 
        /// Maximum file size: 10MB  
        /// Supported file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, JPEG, PNG, GIF, TXT  
        /// 
        /// Sample request:
        /// ```
        /// POST /api/lessonplan/123/upload-file  
        /// Content-Type: multipart/form-data  
        /// ```
        /// Form Data:  
        /// - file: [Select file to upload]  
        /// 
        /// </remarks>
        /// <param name="id">The ID of the lesson plan to attach the file to</param>
        /// <param name="file">The file to upload and attach to the lesson plan</param>
        /// <response code="201">File uploaded and attached successfully. Returns file information including ID, filename, MIME type, upload date, file size, and download URL.</response>
        /// <response code="400">Validation error. Possible messages:
        /// - FILE_REQUIRED  
        /// - INVALID_FILE_EXTENSION  
        /// - FILE_SIZE_EXCEEDS_LIMIT  
        /// - INVALID_LESSON_PLAN_ID  
        /// </response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. User does not have permission to upload files to this lesson plan.</response>
        /// <response code="404">Lesson plan not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during file upload. Handled by ExceptionMiddleware.</response>
        [HttpPost("{id}/upload-file")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> UploadFileAsync(int id, IFormFile file)
        {
            if (file == null)
            {
                return BadRequest(new { StatusCode = 400, Message = "FILE_REQUIRED" });
            }

            var response = await _lessonPlanService.UploadFileAsync(id, file);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Delete a file attachment from a lesson plan.
        /// 
        /// Permanently removes a file that was previously attached to a lesson plan.
        /// Only the lesson plan creator can delete files from their lesson plans.
        /// 
        /// Sample request:
        /// ```
        /// DELETE /api/lessonplan/files/456
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the file to delete from the lesson plan</param>
        /// <response code="200">File deleted successfully from the lesson plan.</response>
        /// <response code="400">Invalid file ID provided.</response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. User does not have permission to delete this file.</response>
        /// <response code="404">File not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during file deletion. Handled by ExceptionMiddleware.</response>
        [HttpDelete("files/{id}")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> DeleteLessonPlanFileAsync(int id)
        {
            var response = await _lessonPlanService.DeleteLessonPlanFileAsync(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>Teacher</summary>
        /// <remarks>
        /// 
        /// Generate and download a Word document (.docx) for a specific lesson plan with its slot plans.
        /// 
        /// Creates a professionally formatted Word document containing:
        /// - Lesson plan title and details
        /// - Teacher information and school
        /// - Learning objectives and description
        /// - All slot plans (activities) with their content and duration
        /// - Document metadata and generation timestamp
        /// 
        /// Only the lesson plan creator (teacher) can generate documents for their lesson plans.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/lessonplan/123/generate-word-document
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the lesson plan to generate a Word document for</param>
        /// <response code="200">Word document generated successfully. Returns the .docx file as binary data with appropriate headers for download.</response>
        /// <response code="400">Invalid lesson plan ID provided.</response>
        /// <response code="401">Unauthorized. User authentication required.</response>
        /// <response code="403">Forbidden. Possible messages:
        /// - TEACHER_ONLY (Only teachers can generate Word documents)
        /// - LESSON_PLAN_NOT_OWNED_BY_TEACHER (User can only generate documents for their own lesson plans)
        /// </response>
        /// <response code="404">Lesson plan not found with the specified ID.</response>
        /// <response code="500">Internal server error occurred during document generation. Possible messages:
        /// - DOCUMENT_GENERATION_FAILED (Error occurred while creating the Word document)
        /// </response>
        [HttpGet("{id}/generate-word-document")]
        [AuthorizeRoles(EUserRole.Teacher)]
        public async Task<IActionResult> GenerateWordDocumentAsync(int id)
        {
            var response = await _lessonPlanService.GenerateWordDocumentAsync(id);
            
            if (response.StatusCode != 200)
            {
                return StatusCode(response.StatusCode, response);
            }

            // Return the Word document as a file download
            var fileName = $"LessonPlan_{id}_{DateTime.Now:yyyyMMdd_HHmmss}.docx";
            return File(
                response.Data,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileName
            );
        }
    }
}
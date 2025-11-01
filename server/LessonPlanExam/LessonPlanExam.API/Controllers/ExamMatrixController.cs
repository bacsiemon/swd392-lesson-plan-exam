using LessonPlanExam.Repositories.DTOs.ExamMatrixDTOs;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/exam-matrices")]
    [ApiController]
    public class ExamMatrixController : ControllerBase
    {
        private readonly IExamMatrixService _service;

        public ExamMatrixController(IExamMatrixService service)
        {
            _service = service;
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Create a new exam matrix (criteria for randomizing exam questions).
        /// 
        /// Sample request:
        /// ```
        /// POST /api/exam-matrices
        /// {
        ///   "name": "Chemistry Grade 10 Exam",
        ///   "description": "Random exam matrix for chemistry",
        ///   "teacherId": 1,
        ///   "totalQuestions": 50,
        ///   "totalPoints": 100
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">The exam matrix creation request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="201">Returns the newly created exam matrix.</response>
        /// <response code="400">If the request is invalid.</response>
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] ExamMatrixCreateRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateAsync(request, ct);
            return StatusCode(201, result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get a list of exam matrices with optional filters.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/exam-matrices?teacherId=1&amp;q=chemistry
        /// ```
        /// </remarks>
        /// <param name="teacherId">Filter by teacher ID.</param>
        /// <param name="q">Search term in name or description.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the list of exam matrices.</response>
        [HttpGet]
        public async Task<IActionResult> QueryAsync([FromQuery] int? teacherId, [FromQuery] string q, CancellationToken ct = default)
        {
            var result = await _service.QueryAsync(teacherId, q, ct);
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get the details of a specific exam matrix by its ID, including all items.
        /// </remarks>
        /// <param name="id">The ID of the exam matrix to retrieve.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the exam matrix details.</response>
        /// <response code="404">If the exam matrix is not found.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var result = await _service.GetByIdAsync(id, ct);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Update an existing exam matrix.
        /// </remarks>
        /// <param name="id">The ID of the exam matrix to update.</param>
        /// <param name="request">The exam matrix update request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the updated exam matrix.</response>
        /// <response code="404">If the exam matrix is not found.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] ExamMatrixUpdateRequest request, CancellationToken ct = default)
        {
            var result = await _service.UpdateAsync(id, request, ct);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Permanently delete an exam matrix. This action is irreversible.
        /// </remarks>
        /// <param name="id">The ID of the exam matrix to delete.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the operation is successful.</response>
        /// <response code="404">If the exam matrix is not found.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var ok = await _service.DeleteAsync(id, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Add a new item to an existing exam matrix.
        /// 
        /// Sample request:
        /// ```
        /// POST /api/exam-matrices/1/items
        /// {
        ///   "questionBankId": 2,
        ///   "domain": "Organic Chemistry",
        ///   "difficultyLevel": 3,
        ///   "questionCount": 10,
        ///   "pointsPerQuestion": 2.0
        /// }
        /// ```
        /// </remarks>
        /// <param name="id">The ID of the exam matrix.</param>
        /// <param name="request">The matrix item creation request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="201">Returns the newly created matrix item.</response>
        /// <response code="400">If the request is invalid.</response>
        /// <response code="404">If the exam matrix is not found.</response>
        [HttpPost("{id}/items")]
        public async Task<IActionResult> CreateItemAsync([FromRoute] int id, [FromBody] ExamMatrixItemCreateRequest request, CancellationToken ct = default)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateItemAsync(id, request, ct);
            return StatusCode(201, result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get all items in an exam matrix.
        /// </remarks>
        /// <param name="id">The ID of the exam matrix.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the list of matrix items.</response>
        /// <response code="404">If the exam matrix is not found.</response>
        [HttpGet("{id}/items")]
        public async Task<IActionResult> GetItemsAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var result = await _service.GetItemsAsync(id, ct);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Update an existing exam matrix item.
        /// </remarks>
        /// <param name="itemId">The ID of the matrix item to update.</param>
        /// <param name="request">The matrix item update request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the updated matrix item.</response>
        /// <response code="404">If the matrix item is not found.</response>
        [HttpPut("{id}/items/{itemId}")]
        public async Task<IActionResult> UpdateItemAsync([FromRoute] int itemId, [FromBody] ExamMatrixItemUpdateRequest request, CancellationToken ct = default)
        {
            var result = await _service.UpdateItemAsync(itemId, request, ct);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Permanently delete an exam matrix item.
        /// </remarks>
        /// <param name="itemId">The ID of the matrix item to delete.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the operation is successful.</response>
        /// <response code="404">If the matrix item is not found.</response>
        [HttpDelete("{id}/items/{itemId}")]
        public async Task<IActionResult> DeleteItemAsync([FromRoute] int itemId, CancellationToken ct = default)
        {
            var ok = await _service.DeleteItemAsync(itemId, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Validate if the exam matrix has enough questions according to its criteria.
        /// Returns a list of shortages if any item doesn't have enough available questions.
        /// </remarks>
        /// <param name="id">The ID of the exam matrix to validate.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns validation result with shortage information.</response>
        /// <response code="404">If the exam matrix is not found.</response>
        [HttpPost("{id}/validate")]
        public async Task<IActionResult> ValidateAsync([FromRoute] int id, CancellationToken ct = default)
        {
            var result = await _service.ValidateAsync(id, ct);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }
}


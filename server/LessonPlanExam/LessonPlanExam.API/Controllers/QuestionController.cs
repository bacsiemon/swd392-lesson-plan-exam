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

        /// <summary>User</summary>
        /// <remarks>
        /// Create a new question within a specific question bank.
        /// Depending on the `questionTypeEnum`, provide either `multipleChoiceAnswers` or `fillBlankAnswers`.
        /// 
        /// Sample request (Multiple Choice):
        /// ```
        /// POST /api/questions
        /// {
        ///   "questionBankId": 1,
        ///   "title": "What is the chemical formula for water?",
        ///   "content": "Select the correct option.",
        ///   "questionTypeEnum": 0,
        ///   "multipleChoiceAnswers": [
        ///     { "answerText": "H2O", "isCorrect": true },
        ///     { "answerText": "CO2", "isCorrect": false }
        ///   ]
        /// }
        /// ```
        /// 
        /// Sample request (Fill-Blank):
        /// ```
        /// POST /api/questions
        /// {
        ///   "questionBankId": 1,
        ///   "title": "Name the compound",
        ///   "content": "Write the common name for H2O",
        ///   "questionTypeEnum": 1,
        ///   "fillBlankAnswers": [
        ///     { "correctAnswer": "water", "normalizedCorrectAnswer": "water" }
        ///   ]
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">The question creation request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="201">Returns the newly created question.</response>
        /// <response code="400">If the request is invalid.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuestionCreateRequest request, CancellationToken ct) {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _service.CreateAsync(request, ct);
            return StatusCode(201, res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get a list of questions based on specified filters. All parameters are optional.
        /// 
        /// Sample request:
        /// ```
        /// GET /api/questions?bankId=1&amp;type=0&amp;active=true&amp;q=water
        /// ```
        /// </remarks>
        /// <param name="bankId">Filter by Question Bank ID.</param>
        /// <param name="type">Filter by question type (0 for MultipleChoice, 1 for FillBlank).</param>
        /// <param name="difficultyId">Filter by difficulty ID.</param>
        /// <param name="active">Filter by active status.</param>
        /// <param name="q">Search term in question title or content.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the list of questions.</response>
        [HttpGet]
        public async Task<IActionResult> Query([FromQuery] int? bankId, [FromQuery] int? type, [FromQuery] int? difficultyId, [FromQuery] bool? active, [FromQuery] string q, CancellationToken ct) {
            var result = await _service.QueryAsync(bankId, type, difficultyId, active, q, ct);
            return Ok(result);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get the details of a specific question by its ID, including its answers.
        /// </remarks>
        /// <param name="id">The ID of the question to retrieve.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the question details.</response>
        /// <response code="404">If the question is not found.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct) {
            var res = await _service.GetByIdAsync(id, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Update an existing question. This action replaces the entire question content and its associated answers.
        /// </remarks>
        /// <param name="id">The ID of the question to update.</param>
        /// <param name="request">The question update request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the updated question.</response>
        /// <response code="404">If the question is not found.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] QuestionUpdateRequest request, CancellationToken ct) {
            var res = await _service.UpdateAsync(id, request, ct);
            if (res == null) return NotFound();
            return Ok(res);
        }
        
        /// <summary>User</summary>
        /// <remarks>
        /// Activate or deactivate a question.
        /// </remarks>
        /// <param name="id">The ID of the question to update.</param>
        /// <param name="isActive">The new active status.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the operation is successful.</response>
        /// <response code="404">If the question is not found.</response>
        [HttpPatch("{id}/active")]
        public async Task<IActionResult> ToggleActive([FromRoute] int id, [FromQuery] bool isActive, CancellationToken ct) {
            var ok = await _service.SetActiveAsync(id, isActive, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Permanently delete a question. This action is irreversible.
        /// </remarks>
        /// <param name="id">The ID of the question to delete.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">If the operation is successful.</response>
        /// <response code="404">If the question is not found.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct) {
            var ok = await _service.DeleteAsync(id, ct);
            if (!ok) return NotFound();
            return Ok(new { Status = ok });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Create multiple questions for a specific question bank in a single request.
        /// </remarks>
        /// <param name="request">The bulk creation request.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the number of questions successfully inserted.</response>
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkCreateQuestionsRequest request, CancellationToken ct) {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var cnt = await _service.BulkCreateAsync(request, ct);
            return Ok(new { Inserted = cnt });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Get a preview of a question. For Multiple Choice questions, the answers can be randomized by setting `randomized=true`.
        /// </remarks>
        /// <param name="id">The ID of the question to preview.</param>
        /// <param name="randomized">Whether to randomize the order of answers for Multiple Choice questions.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <response code="200">Returns the question preview.</response>
        /// <response code="404">If the question is not found.</response>
        [HttpGet("{id}/preview")]
        public async Task<IActionResult> Preview([FromRoute] int id, [FromQuery] bool randomized, CancellationToken ct) {
            var preview = await _service.PreviewAsync(id, randomized, ct);
            if (preview == null) return NotFound();
            return Ok(preview);
        }
    }
}

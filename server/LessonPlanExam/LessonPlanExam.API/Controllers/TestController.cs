using App.Infrastructure.BaseClasses;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public TestController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        /// <summary>
        /// Test Api Endpoint
        /// </summary>
        /// <remarks>
        ///     Returns an object with the current UTC timestamp and the entered string parameter.
        /// </remarks>
        /// <param name="optionalString">Optional String</param>
        /// <response code ="200">API is working</response>
        [HttpGet("test-api")]
        public IActionResult TestApi(string? optionalString)
        {
            return Ok(new BaseResponse
            {
                StatusCode = 200,
                Message = "API is working",
                Data = new
                {
                    Timestamp = DateTime.UtcNow,
                    OptionalString = optionalString
                }
            });
        }

        /// <summary>User</summary>
        /// <remarks>
        /// Test endpoint that demonstrates AccountService JWT functionality.
        /// Requires a valid JWT token in the Authorization header.
        /// 
        /// Sample request:
        /// 
        /// GET /api/test/current-user
        /// Authorization: Bearer {your-jwt-token}
        /// 
        /// </remarks>
        /// <response code="200">Returns the current user ID extracted from JWT token</response>
        /// <response code="401">Unauthorized. Possible messages:
        /// - HTTP_CONTEXT_NOT_AVAILABLE
        /// - AUTHORIZATION_HEADER_MISSING
        /// - INVALID_AUTHORIZATION_HEADER_FORMAT
        /// - JWT_TOKEN_MISSING
        /// - USER_ID_NOT_FOUND_IN_TOKEN
        /// - INVALID_USER_ID_FORMAT_IN_TOKEN
        /// - INVALID_JWT_TOKEN
        /// </response>
        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            var userId = _accountService.GetCurrentUserId();
            
            return Ok(new BaseResponse
            {
                StatusCode = 200,
                Message = "SUCCESS",
                Data = new
                {
                    UserId = userId,
                    Message = "User ID extracted from JWT token successfully via AccountService"
                }
            });
        }
    }
}

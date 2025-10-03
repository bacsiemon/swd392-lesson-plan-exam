using App.Infrastructure.BaseClasses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
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
    }
}

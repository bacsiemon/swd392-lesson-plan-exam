using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        /// <summary>
        /// Get Accounts with pagination
        /// </summary>
        /// <param name="page"></param>
        /// <param name="size"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAccountsAsync([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _accountService.GetAccountsAsync(page, size);
            return Ok(response);
        }
    }
}

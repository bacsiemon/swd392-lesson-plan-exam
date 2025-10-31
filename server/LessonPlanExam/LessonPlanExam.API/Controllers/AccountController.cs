using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    /// <summary>
    /// Account management and authentication controller
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        
        /// <summary>
        /// Initialize AccountController with dependencies
        /// </summary>
        /// <param name="accountService">Account service for authentication operations</param>
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        #region Authentication Endpoints

        /// <summary>
        /// Login with email and password
        /// </summary>
        /// <param name="request">Login credentials</param>
        /// <returns>JWT token and user information</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
        {
            var response = await _accountService.LoginAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Register a new account
        /// </summary>
        /// <param name="request">Registration information</param>
        /// <returns>Account creation confirmation</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
        {
            var response = await _accountService.RegisterAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Request password reset via email
        /// </summary>
        /// <param name="request">Email for password reset</param>
        /// <returns>Password reset email sent confirmation</returns>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordRequest request)
        {
            var response = await _accountService.ForgotPasswordAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Reset password using reset token
        /// </summary>
        /// <param name="request">Reset token and new password</param>
        /// <returns>Password reset confirmation</returns>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPasswordAsync([FromBody] ResetPasswordRequest request)
        {
            var response = await _accountService.ResetPasswordAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Change password for authenticated user
        /// </summary>
        /// <param name="request">Current and new password</param>
        /// <returns>Password change confirmation</returns>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
        {
            var response = await _accountService.ChangePasswordAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Refresh JWT access token
        /// </summary>
        /// <param name="request">Refresh token</param>
        /// <returns>New access token</returns>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequest request)
        {
            var response = await _accountService.RefreshTokenAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Logout and revoke refresh tokens
        /// </summary>
        /// <returns>Logout confirmation</returns>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> LogoutAsync()
        {
            var response = await _accountService.LogoutAsync();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get current user profile information
        /// </summary>
        /// <returns>Current user profile</returns>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfileAsync()
        {
            var response = await _accountService.GetCurrentUserProfileAsync();
            return StatusCode(response.StatusCode, response);
        }

        #endregion

        #region Admin Endpoints

        /// <summary>
        /// Get Accounts with pagination (Admin only)
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="size">Page size</param>
        /// <returns>Paginated list of accounts</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAccountsAsync([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _accountService.GetAccountsAsync(page, size);
            return Ok(response);
        }

        #endregion
    }
}

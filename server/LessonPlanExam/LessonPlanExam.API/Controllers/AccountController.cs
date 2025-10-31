using LessonPlanExam.Repositories.DTOs.AccountDTOs;
using LessonPlanExam.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LessonPlanExam.API.Controllers
{
    /// <summary>
    /// Controller quản lý tài khoản và xác thực người dùng
    /// Xử lý tất cả các chức năng liên quan đến đăng nhập, đăng ký, quản lý mật khẩu
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        
        /// <summary>
        /// Khởi tạo AccountController với các dependency injection
        /// </summary>
        /// <param name="accountService">Service xử lý logic nghiệp vụ cho tài khoản</param>
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        #region Authentication Endpoints - Các API xác thực người dùng

        /// <summary>
        /// API đăng nhập bằng email và mật khẩu
        /// Trả về JWT token và thông tin người dùng khi đăng nhập thành công
        /// </summary>
        /// <param name="request">Thông tin đăng nhập (email, password)</param>
        /// <returns>JWT token, refresh token và thông tin user</returns>
        [HttpPost("login")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
        {
            // Gọi service để xử lý logic đăng nhập
            var response = await _accountService.LoginAsync(request);
            // Trả về kết quả với status code tương ứng
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API đăng ký tài khoản mới
        /// Tạo tài khoản mới trong hệ thống với các thông tin cơ bản
        /// </summary>
        /// <param name="request">Thông tin đăng ký (email, password, fullName, role, v.v.)</param>
        /// <returns>Xác nhận tạo tài khoản thành công và thông tin tài khoản</returns>
        [HttpPost("register")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
        {
            // Gọi service để xử lý logic đăng ký tài khoản
            var response = await _accountService.RegisterAsync(request);
            // Trả về kết quả (thường là 201 Created nếu thành công)
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API yêu cầu đặt lại mật khẩu qua email
        /// Gửi email chứa token để reset mật khẩu đến địa chỉ email của người dùng
        /// </summary>
        /// <param name="request">Email của người dùng cần reset mật khẩu</param>
        /// <returns>Xác nhận đã gửi email reset mật khẩu</returns>
        [HttpPost("forgot-password")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordRequest request)
        {
            // Gọi service để xử lý logic gửi email reset password
            var response = await _accountService.ForgotPasswordAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API đặt lại mật khẩu bằng token reset
        /// Sử dụng token từ email để đặt mật khẩu mới
        /// </summary>
        /// <param name="request">Token reset và mật khẩu mới</param>
        /// <returns>Xác nhận đã đổi mật khẩu thành công</returns>
        [HttpPost("reset-password")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> ResetPasswordAsync([FromBody] ResetPasswordRequest request)
        {
            // Gọi service để xử lý logic reset password với token
            var response = await _accountService.ResetPasswordAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API đổi mật khẩu cho người dùng đã đăng nhập
        /// Yêu cầu nhập mật khẩu hiện tại và mật khẩu mới
        /// </summary>
        /// <param name="request">Mật khẩu hiện tại và mật khẩu mới</param>
        /// <returns>Xác nhận đã đổi mật khẩu thành công</returns>
        [HttpPost("change-password")]
        [Authorize] // Yêu cầu phải đăng nhập (có JWT token hợp lệ)
        public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
        {
            // Gọi service để xử lý logic đổi mật khẩu
            var response = await _accountService.ChangePasswordAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API làm mới JWT access token
        /// Sử dụng refresh token để tạo access token mới khi token cũ hết hạn
        /// </summary>
        /// <param name="request">Refresh token để tạo access token mới</param>
        /// <returns>Access token mới và thông tin về thời gian hết hạn</returns>
        [HttpPost("refresh-token")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequest request)
        {
            // Gọi service để xử lý logic refresh token
            var response = await _accountService.RefreshTokenAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API đăng xuất và vô hiệu hóa refresh token
        /// Hủy bỏ tất cả các token của người dùng để đảm bảo bảo mật
        /// </summary>
        /// <returns>Xác nhận đăng xuất thành công</returns>
        [HttpPost("logout")]
        [Authorize] // Yêu cầu phải đăng nhập (có JWT token hợp lệ)
        public async Task<IActionResult> LogoutAsync()
        {
            // Gọi service để xử lý logic logout (revoke tokens)
            var response = await _accountService.LogoutAsync();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API lấy thông tin profile của người dùng hiện tại
        /// Trả về thông tin chi tiết của người dùng đã đăng nhập
        /// </summary>
        /// <returns>Thông tin profile người dùng (tên, email, role, v.v.)</returns>
        [HttpGet("profile")]
        [Authorize] // Yêu cầu phải đăng nhập (có JWT token hợp lệ)
        public async Task<IActionResult> GetProfileAsync()
        {
            // Gọi service để lấy thông tin profile của user hiện tại
            var response = await _accountService.GetCurrentUserProfileAsync();
            return StatusCode(response.StatusCode, response);
        }

        #endregion

        #region Admin Endpoints - Các API dành cho Admin

        /// <summary>
        /// API lấy danh sách tài khoản với phân trang (Chỉ dành cho Admin)
        /// Cho phép Admin xem tất cả tài khoản trong hệ thống
        /// </summary>
        /// <param name="page">Số trang (mặc định = 1)</param>
        /// <param name="size">Số lượng record trên 1 trang (mặc định = 10)</param>
        /// <returns>Danh sách tài khoản được phân trang</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được truy cập
        public async Task<IActionResult> GetAccountsAsync([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            // Gọi service để lấy danh sách tài khoản với phân trang
            var response = await _accountService.GetAccountsAsync(page, size);
            // Trả về danh sách tài khoản (chỉ Admin mới được xem)
            return Ok(response);
        }

        #endregion
    }
}

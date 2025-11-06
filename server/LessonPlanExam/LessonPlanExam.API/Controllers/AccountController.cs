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
        /// API đăng ký tài khoản học sinh
        /// Tạo tài khoản mới với role Student và entity Student tương ứng
        /// </summary>
        /// <param name="request">Thông tin đăng ký học sinh</param>
        /// <returns>Xác nhận tạo tài khoản học sinh thành công và thông tin tài khoản</returns>
        [HttpPost("register-student")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> RegisterStudentAsync([FromBody] StudentRegisterRequest request)
        {
            // Gọi service để xử lý logic đăng ký tài khoản học sinh
            var response = await _accountService.RegisterStudentAsync(request);
            // Trả về kết quả (201 Created nếu thành công)
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API đăng ký tài khoản giáo viên
        /// Tạo tài khoản mới với role Teacher và entity Teacher tương ứng (bao gồm school name)
        /// </summary>
        /// <param name="request">Thông tin đăng ký giáo viên</param>
        /// <returns>Xác nhận tạo tài khoản giáo viên thành công và thông tin tài khoản</returns>
        [HttpPost("register-teacher")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> RegisterTeacherAsync([FromBody] TeacherRegisterRequest request)
        {
            // Gọi service để xử lý logic đăng ký tài khoản giáo viên
            var response = await _accountService.RegisterTeacherAsync(request);
            // Trả về kết quả (201 Created nếu thành công)
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API yêu cầu gửi OTP qua email để reset mật khẩu
        /// Gửi mã OTP 6 chữ số đến email người dùng, có hiệu lực 5 phút
        /// </summary>
        /// <param name="request">Email của người dùng cần reset mật khẩu</param>
        /// <returns>Xác nhận đã gửi OTP qua email</returns>
        [HttpPost("forgot-password-otp")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> ForgotPasswordWithOtpAsync([FromBody] ForgotPasswordWithOtpRequest request)
        {
            // Gọi service để gửi OTP qua email
            var response = await _accountService.ForgotPasswordWithOtpAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API xác thực OTP và đặt lại mật khẩu mới
        /// Verify mã OTP và cập nhật mật khẩu mới cho tài khoản
        /// </summary>
        /// <param name="request">Email, mã OTP và mật khẩu mới</param>
        /// <returns>Xác nhận đã đổi mật khẩu thành công</returns>
        [HttpPost("verify-otp-reset-password")]
        [AllowAnonymous] // Cho phép truy cập không cần xác thực
        public async Task<IActionResult> VerifyOtpResetPasswordAsync([FromBody] VerifyOtpResetPasswordRequest request)
        {
            // Gọi service để verify OTP và reset password
            var response = await _accountService.VerifyOtpResetPasswordAsync(request);
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

        /// <summary>
        /// API cập nhật thông tin profile của người dùng hiện tại
        /// Cho phép user thay đổi FullName, Phone, AvatarUrl, DateOfBirth
        /// Không cho phép thay đổi Email (cần API riêng để đảm bảo bảo mật)
        /// </summary>
        /// <param name="request">Thông tin cần cập nhật</param>
        /// <returns>Thông tin profile sau khi cập nhật</returns>
        [HttpPut("profile")]
        [Authorize] // Yêu cầu phải đăng nhập (có JWT token hợp lệ)
        public async Task<IActionResult> UpdateProfileAsync([FromBody] UpdateProfileRequest request)
        {
            // Gọi service để cập nhật profile
            var response = await _accountService.UpdateProfileAsync(request);
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

        /// <summary>
        /// API xóa tài khoản theo ID (Chỉ dành cho Admin - Role = 0)
        /// Thực hiện soft delete - đánh dấu tài khoản là đã xóa thay vì xóa hẳn
        /// </summary>
        /// <param name="id">ID của tài khoản cần xóa</param>
        /// <returns>Xác nhận đã xóa tài khoản thành công</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Chỉ Admin (role = 0) mới được xóa tài khoản
        public async Task<IActionResult> DeleteAccountAsync(int id)
        {
            // Gọi service để xóa tài khoản (soft delete)
            var response = await _accountService.DeleteAccountAsync(id);
            // Trả về kết quả xóa tài khoản
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// API xem tất cả tài khoản phân loại theo role (Chỉ dành cho Admin - Role = 0)
        /// Trả về danh sách Teachers và Students, không bao gồm Admin accounts
        /// </summary>
        /// <returns>Danh sách tài khoản được phân loại theo role: Teachers và Students</returns>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Chỉ Admin (role = 0) mới được xem tất cả tài khoản
        public async Task<IActionResult> GetAllAccountsAsync()
        {
            // Gọi service để lấy danh sách tất cả tài khoản phân loại theo role
            var response = await _accountService.GetAllAccountsAsync();
            // Trả về danh sách tài khoản với status code tương ứng
            return StatusCode(response.StatusCode, response);
        }

        #endregion
    }
}

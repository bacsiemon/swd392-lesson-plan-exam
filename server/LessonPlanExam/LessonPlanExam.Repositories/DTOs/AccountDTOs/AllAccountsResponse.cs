using LessonPlanExam.Repositories.Enums;

namespace LessonPlanExam.Repositories.DTOs.AccountDTOs
{
    /// <summary>
    /// DTO cho response danh sách tất cả accounts phân loại theo role
    /// Chỉ Admin mới có thể xem thông tin này
    /// </summary>
    public class AllAccountsResponse
    {
        /// <summary>
        /// Danh sách giáo viên (role = 1)
        /// </summary>
        public List<AccountSummary> Teachers { get; set; } = new List<AccountSummary>();

        /// <summary>
        /// Danh sách học sinh (role = 2)
        /// </summary>
        public List<AccountSummary> Students { get; set; } = new List<AccountSummary>();

        /// <summary>
        /// Tổng số giáo viên
        /// </summary>
        public int TotalTeachers { get; set; }

        /// <summary>
        /// Tổng số học sinh
        /// </summary>
        public int TotalStudents { get; set; }

        /// <summary>
        /// Tổng số accounts (không bao gồm Admin)
        /// </summary>
        public int TotalAccounts => TotalTeachers + TotalStudents;
    }

    /// <summary>
    /// DTO tóm tắt thông tin account cho Admin xem
    /// </summary>
    public class AccountSummary
    {
        /// <summary>
        /// ID của account
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Email đăng nhập
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Họ và tên đầy đủ
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Số điện thoại
        /// </summary>
        public string Phone { get; set; } = string.Empty;

        /// <summary>
        /// Vai trò của user (1 = Teacher, 2 = Student)
        /// </summary>
        public EUserRole Role { get; set; }

        /// <summary>
        /// Trạng thái active
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Email đã được xác thực chưa
        /// </summary>
        public bool? EmailVerified { get; set; }

        /// <summary>
        /// Ngày tạo tài khoản
        /// </summary>
        public DateTime? CreatedAt { get; set; }

        /// <summary>
        /// Lần cuối cập nhật
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}
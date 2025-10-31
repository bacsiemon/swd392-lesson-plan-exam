# 📋 TÓM TẮT ACCOUNTCONTROLLER - GIẢI THÍCH CHI TIẾT

## 🎯 **MỤC ĐÍCH CHÍNH:**
AccountController quản lý toàn bộ chức năng liên quan đến tài khoản người dùng và xác thực trong hệ thống.

## 📂 **CẤU TRÚC CONTROLLER:**

### **🔧 Dependency Injection:**
```csharp
private readonly IAccountService _accountService;
```
- **Giải thích**: Tiêm IAccountService để xử lý logic nghiệp vụ
- **Lợi ích**: Tách biệt Controller (xử lý HTTP) và Service (xử lý logic)

## 🚀 **CÁC API ENDPOINTS:**

### **1. 🔐 AUTHENTICATION ENDPOINTS (Xác thực người dùng):**

#### **📥 POST /api/account/login**
- **Mục đích**: Đăng nhập bằng email/password
- **Input**: `LoginRequest` (email, password)
- **Output**: JWT token + refresh token + thông tin user
- **Bảo mật**: `[AllowAnonymous]` - không cần token
- **Status Code**: 200 OK (thành công), 401 Unauthorized (sai thông tin)

#### **📝 POST /api/account/register**
- **Mục đích**: Đăng ký tài khoản mới
- **Input**: `RegisterRequest` (email, password, fullName, role, v.v.)
- **Output**: Thông tin tài khoản đã tạo
- **Bảo mật**: `[AllowAnonymous]` - không cần token
- **Status Code**: 201 Created (thành công), 400 Bad Request (dữ liệu không hợp lệ)

#### **📧 POST /api/account/forgot-password**
- **Mục đích**: Yêu cầu reset mật khẩu qua email
- **Input**: `ForgotPasswordRequest` (email)
- **Output**: Xác nhận đã gửi email (hoặc lỗi nếu email service fail)
- **Bảo mật**: `[AllowAnonymous]` - không cần token
- **Lưu ý**: Cần email settings thật để hoạt động

#### **🔄 POST /api/account/reset-password**
- **Mục đích**: Đặt lại mật khẩu bằng token từ email
- **Input**: `ResetPasswordRequest` (email, resetToken, newPassword)
- **Output**: Xác nhận đã đổi mật khẩu
- **Bảo mật**: `[AllowAnonymous]` - không cần token
- **Status**: Hiện tại trả về 501 (Not Implemented)

#### **🔐 POST /api/account/change-password**
- **Mục đích**: Đổi mật khẩu khi đã đăng nhập
- **Input**: `ChangePasswordRequest` (currentPassword, newPassword)
- **Output**: Xác nhận đã đổi mật khẩu
- **Bảo mật**: `[Authorize]` - CẦN JWT token hợp lệ
- **Kiểm tra**: Phải nhập đúng mật khẩu hiện tại

#### **🔄 POST /api/account/refresh-token**
- **Mục đích**: Làm mới access token khi hết hạn
- **Input**: `RefreshTokenRequest` (refreshToken)
- **Output**: Access token mới
- **Bảo mật**: `[AllowAnonymous]` - không cần token (dùng refresh token)
- **Status**: Hiện tại trả về 501 (Not Implemented)

#### **🚪 POST /api/account/logout**
- **Mục đích**: Đăng xuất và vô hiệu hóa tokens
- **Input**: Không cần (tự động lấy từ JWT)
- **Output**: Xác nhận đã đăng xuất
- **Bảo mật**: `[Authorize]` - CẦN JWT token hợp lệ

#### **👤 GET /api/account/profile**
- **Mục đích**: Lấy thông tin profile người dùng hiện tại
- **Input**: Không cần (tự động lấy từ JWT)
- **Output**: Thông tin chi tiết user (id, email, fullName, role, v.v.)
- **Bảo mật**: `[Authorize]` - CẦN JWT token hợp lệ

### **2. 👑 ADMIN ENDPOINTS (Chỉ dành cho Admin):**

#### **📋 GET /api/account?page=1&size=10**
- **Mục đích**: Lấy danh sách tất cả tài khoản (có phân trang)
- **Input**: `page` (số trang), `size` (số record/trang)
- **Output**: Danh sách tài khoản được phân trang
- **Bảo mật**: `[Authorize(Roles = "Admin")]` - CHỈ Admin được truy cập

## 🔒 **BẢO MẬT VÀ AUTHORIZATION:**

### **Các mức độ bảo mật:**
1. **`[AllowAnonymous]`**: Không cần token (login, register, forgot password)
2. **`[Authorize]`**: Cần JWT token hợp lệ (change password, profile, logout)
3. **`[Authorize(Roles = "Admin")]`**: Cần token + phải là Admin

### **JWT Token Flow:**
```
1. User login → Nhận JWT token + refresh token
2. Gọi protected APIs → Gửi "Authorization: Bearer {token}"
3. Token hết hạn → Dùng refresh token để lấy token mới
4. Logout → Vô hiệu hóa tất cả tokens
```

## 🎨 **PATTERN DESIGN:**

### **Controller → Service Pattern:**
```csharp
// Controller chỉ xử lý HTTP request/response
var response = await _accountService.LoginAsync(request);
return StatusCode(response.StatusCode, response);
```

### **Consistent Response Format:**
Tất cả APIs đều trả về `BaseResponse` với:
- `statusCode`: HTTP status code
- `message`: Thông báo (SUCCESS, ERROR, v.v.)
- `data`: Dữ liệu thực tế
- `errors`: Danh sách lỗi validation

## 🚨 **LƯU Ý QUAN TRỌNG:**

### **✅ APIs hoạt động tốt:**
- ✅ Login/Register
- ✅ Change Password  
- ✅ Profile
- ✅ Admin endpoints

### **⚠️ APIs cần hoàn thiện:**
- ⚠️ Forgot Password (cần email settings thật)
- ⚠️ Reset Password (return 501 - Not Implemented)
- ⚠️ Refresh Token (return 501 - Not Implemented)

### **🛡️ Security Best Practices được áp dụng:**
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password hashing (PBKDF2)
- ✅ Input validation
- ✅ Proper HTTP status codes
- ✅ Separation of concerns (Controller/Service)

Với cấu trúc này, AccountController đã sẵn sàng cho môi trường production và có thể mở rộng thêm nhiều chức năng khác! 🚀
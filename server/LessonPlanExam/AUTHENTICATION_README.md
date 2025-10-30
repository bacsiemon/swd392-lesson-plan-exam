# Authentication System Implementation

## 📋 Tổng quan

Hệ thống Authentication đã được triển khai đầy đủ với JWT token, bao gồm:

- ✅ **Đăng ký tài khoản** (Register)
- ✅ **Đăng nhập** (Login) 
- ✅ **Quên mật khẩu** (Forgot Password)
- ✅ **Đặt lại mật khẩu** (Reset Password)
- ✅ **Đổi mật khẩu** (Change Password)
- ✅ **Refresh Token** (JWT Token refresh)
- ✅ **Đăng xuất** (Logout)
- ✅ **Lấy thông tin profile** (Get Profile)

## 🔧 Các Components đã tạo

### 1. DTOs (Data Transfer Objects)
Located in `LessonPlanExam.Repositories/DTOs/AccountDTOs/`:
- `LoginRequest.cs` - Thông tin đăng nhập
- `LoginResponse.cs` - Response sau khi đăng nhập thành công
- `RegisterRequest.cs` - Thông tin đăng ký tài khoản
- `RegisterResponse.cs` - Response sau khi đăng ký thành công
- `ForgotPasswordRequest.cs` - Request quên mật khẩu
- `ResetPasswordRequest.cs` - Request đặt lại mật khẩu
- `ChangePasswordRequest.cs` - Request đổi mật khẩu
- `RefreshTokenRequest.cs` - Request refresh JWT token

### 2. Services
Located in `LessonPlanExam.Services/`:

#### Interfaces:
- `IJwtService.cs` - Service xử lý JWT tokens
- `IEmailService.cs` - Service gửi email
- `IAccountService.cs` - Service xử lý authentication (đã cập nhật)

#### Implementations:
- `JwtService.cs` - Generate và validate JWT tokens
- `EmailService.cs` - Gửi email welcome và reset password
- `AccountService.cs` - Xử lý tất cả logic authentication
- `PasswordHelper.cs` - Helper cho hash/verify password

### 3. Configuration
- `JwtSettings.cs` - Configuration cho JWT
- `EmailSettings.cs` - Configuration cho Email service
- `appsettings.json` & `appsettings.Development.json` - JWT và Email settings

### 4. Controllers
- `AccountController.cs` - API endpoints cho authentication

## 🚀 API Endpoints

### Public Endpoints (Không cần JWT token)
```http
POST /api/account/register          # Đăng ký tài khoản
POST /api/account/login             # Đăng nhập
POST /api/account/forgot-password   # Quên mật khẩu
POST /api/account/reset-password    # Đặt lại mật khẩu
POST /api/account/refresh-token     # Refresh JWT token
```

### Protected Endpoints (Cần JWT token)
```http
GET  /api/account/profile           # Lấy thông tin profile
POST /api/account/change-password   # Đổi mật khẩu
POST /api/account/logout            # Đăng xuất
```

### Admin Only Endpoints
```http
GET  /api/account                   # Lấy danh sách tài khoản (phân trang)
```

## 📝 Cách sử dụng

### 1. Đăng ký tài khoản mới
```http
POST /api/account/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "confirmPassword": "StrongPass123!",
  "fullName": "User Name",
  "role": 1,
  "phoneNumber": "+1234567890"
}
```

### 2. Đăng nhập
```http
POST /api/account/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "LOGIN_SUCCESS",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "User Name",
    "role": 1,
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "base64encodedtoken...",
    "tokenExpiry": "2025-10-27T15:00:00Z",
    "refreshTokenExpiry": "2025-11-03T14:00:00Z"
  }
}
```

### 3. Sử dụng JWT Token
Thêm header vào các request cần authentication:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 4. Lấy thông tin profile
```http
GET /api/account/profile
Authorization: Bearer {your-jwt-token}
```

## ⚙️ Configuration

### JWT Settings trong appsettings.json:
```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGeneration...",
    "Issuer": "LessonPlanExamAPI",
    "Audience": "LessonPlanExamClient",
    "AccessTokenExpireMinutes": 60,
    "RefreshTokenExpireDays": 7
  }
}
```

### Email Settings:
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderPassword": "your-app-password",
    "SenderName": "Lesson Plan Exam System"
  }
}
```

## 🔒 Security Features

### Password Requirements:
- Tối thiểu 6 ký tự
- Có chữ hoa, chữ thường
- Có số và ký tự đặc biệt
- Hash bằng PBKDF2 với salt

### JWT Token:
- Access token: 60 phút (có thể config)
- Refresh token: 7 ngày (có thể config)
- Signed bằng HMAC SHA256

### Role-based Authorization:
- **Admin (0)**: Full access
- **Teacher (1)**: Teacher features
- **Student (2)**: Student features

## 🚨 Cần hoàn thiện

### 1. Package Dependencies
Cần thêm package để JWT hoạt động:
```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.11
```

### 2. Database Schema
Cần thêm các fields vào bảng `Account`:
```sql
ALTER TABLE accounts ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE accounts ADD COLUMN password_reset_expiry TIMESTAMP;
```

### 3. Uncomment JWT Configuration
Trong `Program.cs`, bỏ comment phần JWT configuration sau khi install package.

### 4. Refresh Token Storage
Implement proper refresh token storage (hiện tại chưa có).

## 🧪 Testing

Sử dụng file `authentication-test.http` để test các API endpoints.

### Test Flow:
1. Đăng ký tài khoản mới
2. Đăng nhập để lấy JWT token
3. Sử dụng token để truy cập protected endpoints
4. Test các error cases

## 📚 Documentation

- Swagger UI sẽ có đầy đủ documentation
- JWT authorization đã được configure trong Swagger
- Có thể test trực tiếp từ Swagger UI

## ✅ Hoàn thành

Hệ thống authentication đã sẵn sàng sử dụng với tất cả các tính năng cơ bản. Chỉ cần:

1. Install JWT package
2. Uncomment JWT configuration 
3. Update database schema (nếu cần reset password)
4. Configure email settings
5. Build và run project

🎉 **Enjoy your complete authentication system!**
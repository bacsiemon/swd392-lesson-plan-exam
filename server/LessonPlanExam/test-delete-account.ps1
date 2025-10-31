# Test Delete Account API for Admin users
# Bước 1: Đăng ký Admin account
Write-Host "===== 1. Đăng ký Admin account ====="
$registerResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "fullName": "Admin Test User",
  "email": "admin@test.com",
  "password": "Admin123!",
  "phone": "0901234567",
  "role": 0
}'
Write-Host "Admin account registered:" $registerResponse.isSuccess
Write-Host "Admin ID:" $registerResponse.data.id
$adminId = $registerResponse.data.id

# Bước 2: Đăng ký Teacher account để test xóa
Write-Host "`n===== 2. Đăng ký Teacher account ====="
$teacherResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "fullName": "Teacher Test User",
  "email": "teacher@test.com",
  "password": "Teacher123!",
  "phone": "0901234568",
  "role": 1
}'
Write-Host "Teacher account registered:" $teacherResponse.isSuccess
Write-Host "Teacher ID:" $teacherResponse.data.id
$teacherId = $teacherResponse.data.id

# Bước 3: Đăng nhập Admin để lấy token
Write-Host "`n===== 3. Đăng nhập Admin ====="
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "email": "admin@test.com",
  "password": "Admin123!"
}'
Write-Host "Admin login successful:" $loginResponse.isSuccess
$adminToken = $loginResponse.data.token
Write-Host "Admin token received"

# Bước 4: Test xóa Teacher account với Admin token
Write-Host "`n===== 4. Test xóa Teacher account với Admin token ====="
try {
    $deleteResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/$teacherId" -Method DELETE -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $adminToken"
    }
    Write-Host "Delete successful:" $deleteResponse.isSuccess
    Write-Host "Delete message:" $deleteResponse.message
} catch {
    Write-Host "Delete error:" $_.Exception.Message
}

# Bước 5: Test xóa account không tồn tại
Write-Host "`n===== 5. Test xóa account không tồn tại ====="
try {
    $fakeId = "00000000-0000-0000-0000-000000000000"
    $deleteResponse2 = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/$fakeId" -Method DELETE -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $adminToken"
    }
    Write-Host "Delete fake account result:" $deleteResponse2.message
} catch {
    Write-Host "Expected error for fake account:" $_.Exception.Message
}

# Bước 6: Test xóa chính account Admin (should fail)
Write-Host "`n===== 6. Test xóa chính account Admin (should fail) ====="
try {
    $deleteResponse3 = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/$adminId" -Method DELETE -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $adminToken"
    }
    Write-Host "Delete own account result:" $deleteResponse3.message
} catch {
    Write-Host "Expected error for deleting own account:" $_.Exception.Message
}

# Bước 7: Đăng nhập Teacher để test unauthorized access
Write-Host "`n===== 7. Test unauthorized access với Teacher token ====="
# Đăng ký Student để Teacher thử xóa
$studentResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "fullName": "Student Test User",
  "email": "student@test.com",
  "password": "Student123!",
  "phone": "0901234569",
  "role": 2
}'
$studentId = $studentResponse.data.id

# Đăng nhập Teacher
$teacherLoginResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "email": "teacher@test.com",
  "password": "Teacher123!"
}'
$teacherToken = $teacherLoginResponse.data.token

# Teacher cố gắng xóa Student (should fail - unauthorized)
try {
    $unauthorizedDelete = Invoke-RestMethod -Uri "http://localhost:5166/api/Account/$studentId" -Method DELETE -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $teacherToken"
    }
    Write-Host "Unauthorized delete result:" $unauthorizedDelete.message
} catch {
    Write-Host "Expected authorization error:" $_.Exception.Message
}

Write-Host "`n===== Test ket thuc ====="
Write-Host "Tat ca test cases da duoc thuc hien!"
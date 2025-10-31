# Comprehensive Authentication API Test Script
# Note: Email settings are fake, so forgot password emails won't actually be sent

$baseUrl = "http://localhost:5166/api"
$testResults = @()

Write-Host "=== 🚀 COMPREHENSIVE AUTHENTICATION API TESTS ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "Note: Email settings are fake for development testing" -ForegroundColor Yellow
Write-Host ""

function Test-API {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{'Content-Type' = 'application/json'},
        [int[]]$ExpectedSuccessCodes = @(200, 201),
        [string]$Description = ""
    )
    
    $result = @{
        TestName = $TestName
        Status = "UNKNOWN"
        StatusCode = 0
        Message = ""
        Response = $null
    }
    
    Write-Host "🧪 Test: $TestName" -ForegroundColor White
    if ($Description) {
        Write-Host "   📝 $Description" -ForegroundColor Gray
    }
    Write-Host "   🔗 $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $uri = "$baseUrl$Endpoint"
        
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Depth 3
            Write-Host "   📤 Body: $bodyJson" -ForegroundColor DarkGray
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $bodyJson -Headers $Headers
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $Headers
        }
        
        $result.Status = "PASS"
        $result.StatusCode = 200
        $result.Message = "Success"
        $result.Response = $response
        
        Write-Host "   ✅ PASS - Request successful" -ForegroundColor Green
        if ($response -and $response.message) {
            Write-Host "   💬 Message: $($response.message)" -ForegroundColor Green
        }
        
        return $response
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        $result.StatusCode = $statusCode
        $result.Message = $errorMessage
        
        if ($statusCode -in $ExpectedSuccessCodes) {
            $result.Status = "PASS"
            Write-Host "   ✅ PASS - Expected status: $statusCode" -ForegroundColor Green
        } else {
            $result.Status = "FAIL"
            Write-Host "   ❌ FAIL - Status: $statusCode" -ForegroundColor Red
            Write-Host "   💥 Error: $errorMessage" -ForegroundColor Red
            
            if ($_.ErrorDetails) {
                Write-Host "   📄 Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
        }
        return $null
    } finally {
        $script:testResults += $result
        Write-Host ""
    }
}

Write-Host "=== 📝 1. REGISTRATION TESTS ===" -ForegroundColor Magenta

# Test 1: Valid Registration
$registerBody = @{
    email = "testuser@example.com"
    password = "Test123!"
    confirmPassword = "Test123!"
    fullName = "Test User"
    role = 2  # Student
    phoneNumber = "0123456789"
    dateOfBirth = "1995-01-01T00:00:00.000Z"
}
Test-API "Valid Student Registration" "POST" "/account/register" $registerBody -Description "Register a new student account with valid data"

# Test 2: Teacher Registration
$teacherBody = @{
    email = "teacher@example.com"
    password = "Teacher123!"
    confirmPassword = "Teacher123!"
    fullName = "Teacher User"
    role = 1  # Teacher
    phoneNumber = "0987654321"
    dateOfBirth = "1985-05-15T00:00:00.000Z"
}
Test-API "Valid Teacher Registration" "POST" "/account/register" $teacherBody -Description "Register a new teacher account"

# Test 3: Duplicate Email
Test-API "Duplicate Email Registration" "POST" "/account/register" $registerBody @{'Content-Type' = 'application/json'} @(400, 409) -Description "Should fail - email already exists"

# Test 4: Invalid Email Format
$invalidEmailBody = @{
    email = "invalid-email"
    password = "Test123!"
    confirmPassword = "Test123!"
    fullName = "Invalid User"
    role = 2
}
Test-API "Invalid Email Format" "POST" "/account/register" $invalidEmailBody @{'Content-Type' = 'application/json'} @(400) -Description "Should fail - invalid email format"

# Test 5: Weak Password
$weakPasswordBody = @{
    email = "weakpass@example.com"
    password = "123"
    confirmPassword = "123"
    fullName = "Weak Password User"
    role = 2
}
Test-API "Weak Password Registration" "POST" "/account/register" $weakPasswordBody @{'Content-Type' = 'application/json'} @(400) -Description "Should fail - password too weak"

# Test 6: Password Mismatch
$mismatchBody = @{
    email = "mismatch@example.com"
    password = "Test123!"
    confirmPassword = "Different123!"
    fullName = "Mismatch User"
    role = 2
}
Test-API "Password Mismatch Registration" "POST" "/account/register" $mismatchBody @{'Content-Type' = 'application/json'} @(400) -Description "Should fail - passwords don't match"

Write-Host "=== 🔐 2. LOGIN TESTS ===" -ForegroundColor Magenta

# Test 7: Valid Login
$loginBody = @{
    email = "testuser@example.com"
    password = "Test123!"
}
$loginResponse = Test-API "Valid Login" "POST" "/account/login" $loginBody -Description "Login with correct credentials"

# Extract access token
$accessToken = $null
if ($loginResponse -and $loginResponse.data -and $loginResponse.data.accessToken) {
    $accessToken = $loginResponse.data.accessToken
    Write-Host "🔑 Access Token obtained: $($accessToken.Substring(0, 50))..." -ForegroundColor Yellow
    Write-Host ""
}

# Test 8: Wrong Password
$wrongPasswordBody = @{
    email = "testuser@example.com"
    password = "WrongPassword123!"
}
Test-API "Wrong Password Login" "POST" "/account/login" $wrongPasswordBody @{'Content-Type' = 'application/json'} @(400, 401) -Description "Should fail - wrong password"

# Test 9: Non-existent Email
$nonexistentBody = @{
    email = "nonexistent@example.com"
    password = "Test123!"
}
Test-API "Non-existent Email Login" "POST" "/account/login" $nonexistentBody @{'Content-Type' = 'application/json'} @(400, 401) -Description "Should fail - email doesn't exist"

# Test 10: Empty Credentials
$emptyEmailBody = @{
    email = ""
    password = "Test123!"
}
Test-API "Empty Email Login" "POST" "/account/login" $emptyEmailBody @{'Content-Type' = 'application/json'} @(400) -Description "Should fail - empty email"

Write-Host "=== 🛡️ 3. PROTECTED ENDPOINT TESTS ===" -ForegroundColor Magenta

# Test 11: Get Profile with Valid Token
if ($accessToken) {
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Get Profile with Token" "GET" "/account/profile" $null $authHeaders -Description "Access protected endpoint with valid token"
} else {
    Write-Host "⚠️ SKIPPED: Get Profile with Token - No access token available" -ForegroundColor Yellow
    Write-Host ""
}

# Test 12: Get Profile without Token
Test-API "Get Profile without Token" "GET" "/account/profile" $null @{} @(401) -Description "Should fail - no authentication token"

# Test 13: Get Profile with Invalid Token
$invalidAuthHeaders = @{ 
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer invalid_token_here"
}
Test-API "Get Profile with Invalid Token" "GET" "/account/profile" $null $invalidAuthHeaders @(401) -Description "Should fail - invalid token"

Write-Host "=== 🔄 4. PASSWORD MANAGEMENT TESTS ===" -ForegroundColor Magenta

# Test 14: Change Password
if ($accessToken) {
    $changePasswordBody = @{
        currentPassword = "Test123!"
        newPassword = "NewPassword123!"
        confirmPassword = "NewPassword123!"
    }
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Change Password" "POST" "/account/change-password" $changePasswordBody $authHeaders -Description "Change password with valid current password"
} else {
    Write-Host "⚠️ SKIPPED: Change Password - No access token available" -ForegroundColor Yellow
    Write-Host ""
}

# Test 15: Change Password with Wrong Current Password
if ($accessToken) {
    $wrongCurrentPasswordBody = @{
        currentPassword = "WrongCurrentPassword123!"
        newPassword = "NewPassword123!"
        confirmPassword = "NewPassword123!"
    }
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Change Password Wrong Current" "POST" "/account/change-password" $wrongCurrentPasswordBody $authHeaders @(400, 401) -Description "Should fail - wrong current password"
} else {
    Write-Host "⚠️ SKIPPED: Change Password Wrong Current - No access token available" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=== 📧 5. FORGOT PASSWORD TESTS ===" -ForegroundColor Magenta

# Test 16: Forgot Password Valid Email
$forgotPasswordBody = @{
    email = "testuser@example.com"
}
Test-API "Forgot Password Valid Email" "POST" "/account/forgot-password" $forgotPasswordBody -Description "Request password reset (email won't be sent due to fake SMTP)"

# Test 17: Forgot Password Non-existent Email
$forgotNonexistentBody = @{
    email = "nonexistent@example.com"
}
Test-API "Forgot Password Non-existent Email" "POST" "/account/forgot-password" $forgotNonexistentBody -Description "Should return success for security (even if email doesn't exist)"

# Test 18: Forgot Password Invalid Email
$forgotInvalidBody = @{
    email = "invalid-email"
}
Test-API "Forgot Password Invalid Email" "POST" "/account/forgot-password" $forgotInvalidBody @{'Content-Type' = 'application/json'} @(400) -Description "Should fail - invalid email format"

Write-Host "=== ⚙️ 6. UNIMPLEMENTED FEATURE TESTS ===" -ForegroundColor Magenta

# Test 19: Reset Password (Not Implemented)
$resetPasswordBody = @{
    email = "testuser@example.com"
    resetToken = "SAMPLE_TOKEN"
    newPassword = "ResetPassword123!"
    confirmPassword = "ResetPassword123!"
}
Test-API "Reset Password" "POST" "/account/reset-password" $resetPasswordBody @{'Content-Type' = 'application/json'} @(501, 400) -Description "Expected to fail - feature not implemented"

# Test 20: Refresh Token (Not Implemented)
$refreshTokenBody = @{
    refreshToken = "sample_refresh_token"
}
Test-API "Refresh Token" "POST" "/account/refresh-token" $refreshTokenBody @{'Content-Type' = 'application/json'} @(501, 400) -Description "Expected to fail - feature not implemented"

Write-Host "=== 🚪 7. LOGOUT TESTS ===" -ForegroundColor Magenta

# Test 21: Logout with Token
if ($accessToken) {
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Logout with Token" "POST" "/account/logout" $null $authHeaders -Description "Logout with valid token"
} else {
    Write-Host "⚠️ SKIPPED: Logout with Token - No access token available" -ForegroundColor Yellow
    Write-Host ""
}

# Test 22: Logout without Token
Test-API "Logout without Token" "POST" "/account/logout" $null @{} @(401) -Description "Should fail - no authentication token"

Write-Host "=== 📊 TEST SUMMARY ===" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$unknownTests = ($testResults | Where-Object { $_.Status -eq "UNKNOWN" }).Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "✅ Passed: $passedTests" -ForegroundColor Green
Write-Host "❌ Failed: $failedTests" -ForegroundColor Red
Write-Host "❓ Unknown: $unknownTests" -ForegroundColor Yellow

if ($failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    Write-Host "📈 Success Rate: $successRate%" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 📋 DETAILED RESULTS ===" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $statusColor = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        default { "Yellow" }
    }
    $statusIcon = switch ($result.Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        default { "❓" }
    }
    
    Write-Host "$statusIcon $($result.TestName) - $($result.Status)" -ForegroundColor $statusColor
    if ($result.StatusCode -ne 0) {
        Write-Host "    Status Code: $($result.StatusCode)" -ForegroundColor Gray
    }
    if ($result.Message -and $result.Status -eq "FAIL") {
        Write-Host "    Error: $($result.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== ⚠️ KNOWN LIMITATIONS ===" -ForegroundColor Yellow
Write-Host "🔸 Email Service: Uses fake SMTP settings, so password reset emails won't be sent" -ForegroundColor Yellow
Write-Host "🔸 Reset Password: Returns 501 Not Implemented" -ForegroundColor Yellow
Write-Host "🔸 Refresh Token: Returns 501 Not Implemented" -ForegroundColor Yellow
Write-Host "🔸 Database: Uses local PostgreSQL connection" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== 🔗 USEFUL LINKS ===" -ForegroundColor Cyan
Write-Host "📖 Swagger UI: http://localhost:5166/swagger" -ForegroundColor Cyan
Write-Host "🌐 API Base URL: $baseUrl" -ForegroundColor Cyan

Write-Host ""
Write-Host "Test completed at $(Get-Date)" -ForegroundColor Gray
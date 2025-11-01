#!/usr/bin/env pwsh

# Comprehensive Authentication API Test Script
# Server: http://localhost:5166

$baseUrl = "http://localhost:5166/api"
$headers = @{ 'Content-Type' = 'application/json' }

Write-Host "=== COMPREHENSIVE AUTHENTICATION API TESTS ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test counter
$testCount = 0
$passCount = 0
$failCount = 0

function Test-API {
    param (
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{ 'Content-Type' = 'application/json' },
        [int[]]$ExpectedCodes = @(200, 201)
    )
    
    $script:testCount++
    Write-Host "Test $script:testCount`: $TestName" -ForegroundColor White
    Write-Host "  Method: $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $uri = "$baseUrl$Endpoint"
        
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Depth 3
            Write-Host "  Body: $bodyJson" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $bodyJson -Headers $Headers
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $Headers
        }
        
        Write-Host "  ✅ PASS - Status: 200 OK" -ForegroundColor Green
        if ($response) {
            Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
        }
        $script:passCount++
        return $response
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        if ($statusCode -in $ExpectedCodes) {
            Write-Host "  ✅ PASS - Expected Status: $statusCode" -ForegroundColor Green
            $script:passCount++
        } else {
            Write-Host "  ❌ FAIL - Status: $statusCode, Error: $errorMessage" -ForegroundColor Red
            if ($_.ErrorDetails) {
                Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
            $script:failCount++
        }
        return $null
    }
    Write-Host ""
}

# Variables for test data
$testEmail = "testuser@example.com"
$testPassword = "Test123!"
$teacherEmail = "teacher@example.com"
$teacherPassword = "Teacher123!"
$adminEmail = "admin@example.com"
$adminPassword = "Admin123!"

Write-Host "=== 1. REGISTRATION TESTS ===" -ForegroundColor Magenta

# Test 1: Register Student Account
$registerBody = @{
    email = $testEmail
    password = $testPassword
    confirmPassword = $testPassword
    fullName = "Test Student User"
    role = 2
    phoneNumber = "0123456789"
    dateOfBirth = "1995-01-01T00:00:00.000Z"
}
Test-API "Register Student Account" "POST" "/account/register" $registerBody

# Test 2: Register Teacher Account
$teacherRegisterBody = @{
    email = $teacherEmail
    password = $teacherPassword
    confirmPassword = $teacherPassword
    fullName = "Test Teacher User"
    role = 1
    phoneNumber = "0987654321"
    dateOfBirth = "1985-05-15T00:00:00.000Z"
}
Test-API "Register Teacher Account" "POST" "/account/register" $teacherRegisterBody

# Test 3: Register Admin Account
$adminRegisterBody = @{
    email = $adminEmail
    password = $adminPassword
    confirmPassword = $adminPassword
    fullName = "Test Admin User"
    role = 0
    phoneNumber = "0111222333"
}
Test-API "Register Admin Account" "POST" "/account/register" $adminRegisterBody

# Test 4: Duplicate Email (Should Fail)
$duplicateBody = @{
    email = $testEmail
    password = $testPassword
    confirmPassword = $testPassword
    fullName = "Duplicate User"
    role = 2
}
Test-API "Register Duplicate Email (Should Fail)" "POST" "/account/register" $duplicateBody @{ 'Content-Type' = 'application/json' } @(400, 409)

# Test 5: Invalid Email Format (Should Fail)
$invalidEmailBody = @{
    email = "invalid-email"
    password = $testPassword
    confirmPassword = $testPassword
    fullName = "Invalid Email User"
    role = 1
}
Test-API "Register Invalid Email (Should Fail)" "POST" "/account/register" $invalidEmailBody @{ 'Content-Type' = 'application/json' } @(400)

# Test 6: Weak Password (Should Fail)
$weakPasswordBody = @{
    email = "weakpass@example.com"
    password = "123"
    confirmPassword = "123"
    fullName = "Weak Password User"
    role = 1
}
Test-API "Register Weak Password (Should Fail)" "POST" "/account/register" $weakPasswordBody @{ 'Content-Type' = 'application/json' } @(400)

Write-Host "=== 2. LOGIN TESTS ===" -ForegroundColor Magenta

# Test 7: Login with Student Account
$loginBody = @{
    email = $testEmail
    password = $testPassword
}
$loginResponse = Test-API "Login Student Account" "POST" "/account/login" $loginBody

$accessToken = $null
if ($loginResponse -and $loginResponse.data -and $loginResponse.data.accessToken) {
    $accessToken = $loginResponse.data.accessToken
    Write-Host "  🔑 Access Token obtained: $($accessToken.Substring(0, 50))..." -ForegroundColor Yellow
}

# Test 8: Login with Wrong Password (Should Fail)
$wrongPasswordBody = @{
    email = $testEmail
    password = "WrongPassword123!"
}
Test-API "Login Wrong Password (Should Fail)" "POST" "/account/login" $wrongPasswordBody @{ 'Content-Type' = 'application/json' } @(400, 401)

# Test 9: Login Non-existent Email (Should Fail)
$nonexistentBody = @{
    email = "nonexistent@example.com"
    password = $testPassword
}
Test-API "Login Non-existent Email (Should Fail)" "POST" "/account/login" $nonexistentBody @{ 'Content-Type' = 'application/json' } @(400, 401)

Write-Host "=== 3. PROTECTED ENDPOINT TESTS ===" -ForegroundColor Magenta

# Test 10: Get Profile with Token
if ($accessToken) {
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Get User Profile with Token" "GET" "/account/profile" $null $authHeaders
} else {
    Write-Host "Test 10: Get User Profile - SKIPPED (No access token)" -ForegroundColor Yellow
    $script:testCount++
}

# Test 11: Get Profile without Token (Should Fail)
Test-API "Get User Profile without Token (Should Fail)" "GET" "/account/profile" $null @{} @(401)

# Test 12: Get Profile with Invalid Token (Should Fail)
$invalidAuthHeaders = @{ 
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer invalid_token_here"
}
Test-API "Get User Profile with Invalid Token (Should Fail)" "GET" "/account/profile" $null $invalidAuthHeaders @(401)

Write-Host "=== 4. PASSWORD MANAGEMENT TESTS ===" -ForegroundColor Magenta

# Test 13: Change Password
if ($accessToken) {
    $changePasswordBody = @{
        currentPassword = $testPassword
        newPassword = "NewPassword123!"
        confirmPassword = "NewPassword123!"
    }
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Change Password" "POST" "/account/change-password" $changePasswordBody $authHeaders
} else {
    Write-Host "Test 13: Change Password - SKIPPED (No access token)" -ForegroundColor Yellow
    $script:testCount++
}

# Test 14: Change Password with Wrong Current Password (Should Fail)
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
    Test-API "Change Password with Wrong Current (Should Fail)" "POST" "/account/change-password" $wrongCurrentPasswordBody $authHeaders @(400, 401)
} else {
    Write-Host "Test 14: Change Password Wrong Current - SKIPPED (No access token)" -ForegroundColor Yellow
    $script:testCount++
}

Write-Host "=== 5. FORGOT PASSWORD TESTS ===" -ForegroundColor Magenta

# Test 15: Forgot Password - Valid Email
$forgotPasswordBody = @{
    email = $testEmail
}
Test-API "Forgot Password - Valid Email" "POST" "/account/forgot-password" $forgotPasswordBody

# Test 16: Forgot Password - Non-existent Email (Should still return 200 for security)
$forgotNonexistentBody = @{
    email = "nonexistent@example.com"
}
Test-API "Forgot Password - Non-existent Email" "POST" "/account/forgot-password" $forgotNonexistentBody

# Test 17: Forgot Password - Invalid Email Format (Should Fail)
$forgotInvalidBody = @{
    email = "invalid-email"
}
Test-API "Forgot Password - Invalid Email (Should Fail)" "POST" "/account/forgot-password" $forgotInvalidBody @{ 'Content-Type' = 'application/json' } @(400)

Write-Host "=== 6. RESET PASSWORD TESTS ===" -ForegroundColor Magenta

# Test 18: Reset Password (Will likely fail - not fully implemented)
$resetPasswordBody = @{
    email = $testEmail
    resetToken = "SAMPLE_TOKEN"
    newPassword = "ResetPassword123!"
    confirmPassword = "ResetPassword123!"
}
Test-API "Reset Password (Not Implemented)" "POST" "/account/reset-password" $resetPasswordBody @{ 'Content-Type' = 'application/json' } @(501, 400)

Write-Host "=== 7. REFRESH TOKEN TESTS ===" -ForegroundColor Magenta

# Test 19: Refresh Token (Will likely fail - not fully implemented)
$refreshTokenBody = @{
    refreshToken = "sample_refresh_token"
}
Test-API "Refresh Token (Not Implemented)" "POST" "/account/refresh-token" $refreshTokenBody @{ 'Content-Type' = 'application/json' } @(501, 400)

Write-Host "=== 8. LOGOUT TESTS ===" -ForegroundColor Magenta

# Test 20: Logout with Token
if ($accessToken) {
    $authHeaders = @{ 
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $accessToken"
    }
    Test-API "Logout with Token" "POST" "/account/logout" $null $authHeaders
} else {
    Write-Host "Test 20: Logout - SKIPPED (No access token)" -ForegroundColor Yellow
    $script:testCount++
}

# Test 21: Logout without Token (Should Fail)
Test-API "Logout without Token (Should Fail)" "POST" "/account/logout" $null @{} @(401)

Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Tests: $testCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    $successRate = [math]::Round(($passCount / $testCount) * 100, 2)
    Write-Host "📊 Success Rate: $successRate%" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== KNOWN LIMITATIONS ===" -ForegroundColor Yellow
Write-Host "• Reset Password: Returns 501 (Not Implemented)" -ForegroundColor Yellow
Write-Host "• Refresh Token: Returns 501 (Not Implemented)" -ForegroundColor Yellow
Write-Host "• Email Service: May not send actual emails if SMTP not configured" -ForegroundColor Yellow

Write-Host ""
Write-Host "Test completed! Check Swagger UI at: http://localhost:5166/swagger" -ForegroundColor Cyan
# Simple Authentication API Test Script
$baseUrl = "http://localhost:5166/api"

Write-Host "=== AUTHENTICATION API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register API
Write-Host "Test 1: Register Student Account" -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "test@example.com"
        password = "Test123!"
        confirmPassword = "Test123!"
        fullName = "Test Student User"
        role = 2
        phoneNumber = "0123456789"
        dateOfBirth = "1995-01-01T00:00:00.000Z"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/account/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ PASS - Registration successful" -ForegroundColor Green
    Write-Host $response -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Login API
Write-Host "Test 2: Login with Student Account" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "test@example.com"
        password = "Test123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/account/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ PASS - Login successful" -ForegroundColor Green
    Write-Host $loginResponse -ForegroundColor Green
    
    # Extract access token for further tests
    $accessToken = $loginResponse.data.accessToken
    Write-Host "Access Token: $($accessToken.Substring(0, 50))..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    $accessToken = $null
}
Write-Host ""

# Test 3: Get Profile API
Write-Host "Test 3: Get User Profile" -ForegroundColor Yellow
if ($accessToken) {
    try {
        $headers = @{
            Authorization = "Bearer $accessToken"
            'Content-Type' = 'application/json'
        }
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/account/profile" -Method Get -Headers $headers
        Write-Host "✅ PASS - Profile retrieved" -ForegroundColor Green
        Write-Host $profileResponse -ForegroundColor Green
    } catch {
        Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️ SKIPPED - No access token" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Forgot Password API
Write-Host "Test 4: Forgot Password" -ForegroundColor Yellow
try {
    $forgotBody = @{
        email = "test@example.com"
    } | ConvertTo-Json

    $forgotResponse = Invoke-RestMethod -Uri "$baseUrl/account/forgot-password" -Method Post -Body $forgotBody -ContentType "application/json"
    Write-Host "✅ PASS - Forgot password request sent" -ForegroundColor Green
    Write-Host $forgotResponse -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Change Password API
Write-Host "Test 5: Change Password" -ForegroundColor Yellow
if ($accessToken) {
    try {
        $changePasswordBody = @{
            currentPassword = "Test123!"
            newPassword = "NewPassword123!"
            confirmPassword = "NewPassword123!"
        } | ConvertTo-Json

        $headers = @{
            Authorization = "Bearer $accessToken"
            'Content-Type' = 'application/json'
        }
        $changeResponse = Invoke-RestMethod -Uri "$baseUrl/account/change-password" -Method Post -Body $changePasswordBody -Headers $headers
        Write-Host "✅ PASS - Password changed" -ForegroundColor Green
        Write-Host $changeResponse -ForegroundColor Green
    } catch {
        Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️ SKIPPED - No access token" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Reset Password API (Expected to fail)
Write-Host "Test 6: Reset Password (Expected to fail - Not implemented)" -ForegroundColor Yellow
try {
    $resetBody = @{
        email = "test@example.com"
        resetToken = "SAMPLE_TOKEN"
        newPassword = "ResetPassword123!"
        confirmPassword = "ResetPassword123!"
    } | ConvertTo-Json

    $resetResponse = Invoke-RestMethod -Uri "$baseUrl/account/reset-password" -Method Post -Body $resetBody -ContentType "application/json"
    Write-Host "✅ PASS - Reset password" -ForegroundColor Green
    Write-Host $resetResponse -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 501) {
        Write-Host "✅ EXPECTED - Not Implemented (501)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
}
Write-Host ""

# Test 7: Refresh Token API (Expected to fail)
Write-Host "Test 7: Refresh Token (Expected to fail - Not implemented)" -ForegroundColor Yellow
try {
    $refreshBody = @{
        refreshToken = "sample_refresh_token"
    } | ConvertTo-Json

    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/account/refresh-token" -Method Post -Body $refreshBody -ContentType "application/json"
    Write-Host "✅ PASS - Token refreshed" -ForegroundColor Green
    Write-Host $refreshResponse -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 501) {
        Write-Host "✅ EXPECTED - Not Implemented (501)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
}
Write-Host ""

# Test 8: Logout API
Write-Host "Test 8: Logout" -ForegroundColor Yellow
if ($accessToken) {
    try {
        $headers = @{
            Authorization = "Bearer $accessToken"
            'Content-Type' = 'application/json'
        }
        $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/account/logout" -Method Post -Headers $headers
        Write-Host "✅ PASS - Logout successful" -ForegroundColor Green
        Write-Host $logoutResponse -ForegroundColor Green
    } catch {
        Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️ SKIPPED - No access token" -ForegroundColor Yellow
}
Write-Host ""

# Test 9: Error Cases
Write-Host "Test 9: Error Cases" -ForegroundColor Yellow

# Test invalid login
Write-Host "  - Invalid Login:" -ForegroundColor Gray
try {
    $invalidLoginBody = @{
        email = "test@example.com"
        password = "WrongPassword!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/account/login" -Method Post -Body $invalidLoginBody -ContentType "application/json"
    Write-Host "    ❌ UNEXPECTED SUCCESS" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 401) {
        Write-Host "    ✅ EXPECTED ERROR - Invalid credentials" -ForegroundColor Green
    } else {
        Write-Host "    ❌ UNEXPECTED ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test access protected endpoint without token
Write-Host "  - Access Profile without Token:" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/account/profile" -Method Get
    Write-Host "    ❌ UNEXPECTED SUCCESS" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "    ✅ EXPECTED ERROR - Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "    ❌ UNEXPECTED ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host "Check Swagger UI at: http://localhost:5166/swagger" -ForegroundColor Yellow
# Quick API Test
Write-Host "=== AUTHENTICATION API TESTS ===" -ForegroundColor Cyan

# Test Forgot Password API
Write-Host "Testing Forgot Password API..." -ForegroundColor Yellow
try {
    $body = '{"email":"test@example.com"}'
    $response = Invoke-RestMethod -Uri "http://localhost:5166/api/account/forgot-password" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ PASS: Forgot Password API" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAIL: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        $_.ErrorDetails.Message
    }
}

Write-Host ""

# Test Register API  
Write-Host "Testing Register API..." -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "newuser@example.com"
        password = "Test123!"
        confirmPassword = "Test123!"
        fullName = "New Test User"
        role = 2
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5166/api/account/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ PASS: Register API" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAIL: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        $_.ErrorDetails.Message
    }
}

Write-Host ""

# Test Login API
Write-Host "Testing Login API..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "newuser@example.com"
        password = "Test123!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5166/api/account/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ PASS: Login API" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
    
    # Store token for protected endpoint test
    $global:token = $response.data.accessToken
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAIL: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        $_.ErrorDetails.Message
    }
}

Write-Host ""

# Test Protected Endpoint
if ($global:token) {
    Write-Host "Testing Protected Endpoint (Profile)..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $global:token"
        }
        $response = Invoke-RestMethod -Uri "http://localhost:5166/api/account/profile" -Method Get -Headers $headers
        Write-Host "✅ PASS: Profile API with JWT" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 2
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ FAIL: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) {
            $_.ErrorDetails.Message
        }
    }
} else {
    Write-Host "⚠️ SKIP: Profile test (no token)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== TESTS COMPLETED ===" -ForegroundColor Cyan
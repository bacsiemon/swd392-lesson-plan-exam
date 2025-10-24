# AccountService JWT Documentation

## Overview

The `AccountService` now provides both account management functionality and JWT token parsing capabilities. The `GetCurrentUserId()` method has been moved from UserService to AccountService to consolidate user-related operations in a single service.

## Features

- ? Extract user ID from JWT tokens
- ? Support multiple claim types (NameIdentifier, sub, userId, id)
- ? Fallback mechanism to read directly from Authorization header
- ? Comprehensive error handling with descriptive messages
- ? Integration with ASP.NET Core dependency injection
- ? Custom `UnauthorizedException` for authentication failures
- ? Account management functionality (GetAccountsAsync)

## Files Modified

### Updated Files
- `LessonPlanExam.Services\Interfaces\IAccountService.cs` - Added GetCurrentUserId method
- `LessonPlanExam.Services\Services\AccountService.cs` - Added JWT functionality and GetCurrentUserId method
- `LessonPlanExam.Services\ServiceConfigurations.cs` - Removed UserService registration
- `LessonPlanExam.API\Controllers\TestController.cs` - Updated to use IAccountService instead of IUserService
- `LessonPlanExam.Services\Services\LessonPlanService.cs` - Updated to use IAccountService instead of IUserService

### Removed Files
- `LessonPlanExam.Services\Interfaces\IUserService.cs` - Functionality moved to IAccountService
- `LessonPlanExam.Services\Services\UserService.cs` - Functionality moved to AccountService

### Package Dependencies
- `System.IdentityModel.Tokens.Jwt` version 8.14.0 in LessonPlanExam.Services project

## Usage

### 1. Basic Usage in Controllers

```csharp
[ApiController]
[Route("api/[controller]")]
public class MyController : ControllerBase
{
    private readonly IAccountService _accountService;

    public MyController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet("my-data")]
    public async Task<IActionResult> GetMyData()
    {
        try
        {
            var currentUserId = _accountService.GetCurrentUserId();
            // Use currentUserId for business logic
            return Ok($"Current user ID: {currentUserId}");
        }
        catch (UnauthorizedException ex)
        {
            // Exception is automatically handled by ExceptionMiddleware
            // Returns 401 with proper error message
            throw; // Re-throw to let middleware handle it
        }
    }
}
```

### 2. Usage in Services

```csharp
public class MyBusinessService
{
    private readonly IAccountService _accountService;

    public MyBusinessService(IAccountService accountService)
    {
        _accountService = accountService;
    }

    public async Task CreateUserSpecificData(SomeRequest request)
    {
        var currentUserId = _accountService.GetCurrentUserId();
        
        // Create data associated with the current user
        var data = new SomeEntity
        {
            UserId = currentUserId,
            // ... other properties
        };
        
        // Save to database...
    }
}
```

### 3. Test Endpoint

A test endpoint is available at `/api/test/current-user` that demonstrates the functionality:

```http
GET /api/test/current-user
Authorization: Bearer {your-jwt-token}
```

## AccountService Methods

The AccountService now provides both account management and JWT functionality:

### Account Management
- `GetAccountsAsync(int page, int size)` - Retrieve paginated list of accounts

### JWT Token Management  
- `GetCurrentUserId()` - Extract user ID from JWT token in HTTP context

## Supported JWT Claim Types

The service looks for user ID in the following JWT claims (in order):
1. `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` (ClaimTypes.NameIdentifier)
2. `sub` (standard JWT subject claim)
3. `userId` (custom claim)
4. `id` (custom claim)

## Error Messages

When authentication fails, the service throws `UnauthorizedException` with these possible messages:

- `HTTP_CONTEXT_NOT_AVAILABLE` - HttpContext is not available
- `AUTHORIZATION_HEADER_MISSING` - No Authorization header in request
- `INVALID_AUTHORIZATION_HEADER_FORMAT` - Authorization header doesn't start with "Bearer "
- `JWT_TOKEN_MISSING` - Token is empty after "Bearer "
- `USER_ID_NOT_FOUND_IN_TOKEN` - No user ID claim found in token
- `INVALID_USER_ID_FORMAT_IN_TOKEN` - User ID claim is not a valid integer
- `INVALID_JWT_TOKEN` - Token is malformed or corrupted

## HTTP Response Format

When an `UnauthorizedException` is thrown, the middleware returns:

```json
{
    "statusCode": 401,
    "message": "AUTHORIZATION_HEADER_MISSING",
    "data": null,
    "additionalData": null,
    "errors": null
}
```

## Registration

The service is automatically registered in the DI container via `ServiceConfigurations.cs`:

```csharp
services.AddScoped<IAccountService, AccountService>();
services.AddHttpContextAccessor(); // Required for JWT functionality
```

## JWT Token Format

Your JWT token should include a user ID claim. Example payload:

```json
{
    "sub": "123",
    "iat": 1516239022,
    "exp": 1516242622,
    // ... other claims
}
```

Or:

```json
{
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "123",
    "iat": 1516239022,
    "exp": 1516242622,
    // ... other claims
}
```

## Benefits of Consolidation

Moving the JWT functionality to AccountService provides several benefits:

1. **Single Service**: All user/account-related operations are now in one service
2. **Reduced Dependencies**: Fewer service dependencies to inject
3. **Logical Grouping**: JWT token parsing is conceptually related to account management
4. **Simplified DI**: One less service registration in dependency injection

## Migration Notes

If you were previously using `IUserService`, update your code as follows:

```csharp
// Old way
private readonly IUserService _userService;
var userId = _userService.GetCurrentUserId();

// New way  
private readonly IAccountService _accountService;
var userId = _accountService.GetCurrentUserId();
```

## Notes

- The service requires `IHttpContextAccessor` to access the HTTP context
- JWT token validation (signature, expiration, etc.) should be handled by your authentication middleware
- This service only extracts the user ID from the token, it doesn't validate the token's signature
- If both claims and Authorization header contain user ID, claims take precedence
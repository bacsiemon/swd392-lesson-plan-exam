# FluentValidation Auto Validation Setup

This project includes a custom FluentValidation auto-validation implementation that automatically validates Request DTOs without using the deprecated `FluentValidation.AspNetCore` package.

## How It Works

The implementation consists of:

1. **ValidationActionFilter**: An action filter that automatically validates request DTOs
2. **ValidationExtensions**: Extension methods to register validators from assemblies
3. **Automatic Registration**: All validators implementing `IValidator<T>` are automatically registered

## Usage

### 1. Create a DTO with Validator

```csharp
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");
            
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
    }
}
```

### 2. Controller Usage

```csharp
[HttpPost("login")]
public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
{
    // Validation happens automatically via ValidationActionFilter
    // If validation fails, a 400 BadRequest with validation errors is returned
    // If we reach this point, the request is valid
    
    // Your business logic here...
    return Ok();
}
```

### 3. Validation Response Format

When validation fails, the API returns a standardized error response:

```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "data": null,
    "additionalData": null,
    "errors": [
        {
            "propertyName": "Email",
            "errorMessage": "Email is required.",
            "attemptedValue": null
        },
        {
            "propertyName": "Password",
            "errorMessage": "Password must be at least 6 characters long.",
            "attemptedValue": "123"
        }
    ]
}
```

## Setup Instructions

The auto-validation is already configured in this project. If you need to set it up in a new project:

1. Add FluentValidation package:
   ```xml
   <PackageReference Include="FluentValidation" Version="12.0.0" />
   <FrameworkReference Include="Microsoft.AspNetCore.App" />
   ```

2. Register the validation system in Program.cs:
   ```csharp
   var repositoriesAssembly = Assembly.GetAssembly(typeof(YourDTOClass))!;
   builder.Services.AddInfrastructureConfigurations(builder.Configuration, repositoriesAssembly);
   ```

3. Add the ValidationActionFilter to MVC:
   ```csharp
   services.AddControllers(options =>
   {
       options.Filters.Add<ValidationActionFilter>();
   });
   ```

## Features

- ? Automatic validation for all request DTOs
- ? Standardized error response format using BaseResponse
- ? Support for complex validation rules
- ? Automatic validator discovery and registration
- ? No dependency on deprecated FluentValidation.AspNetCore package
- ? Compatible with .NET 8

## Example Validators

The project includes several example validators:

- **LoginRequestValidator**: Basic email and password validation
- **RegisterRequestValidator**: Complex registration validation with password confirmation, phone format, etc.

You can create additional validators by following the same pattern.
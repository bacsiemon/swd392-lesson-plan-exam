## API

### Folder Structure
- `ApiConfigurations.cs`: Service Configuration settings for the API.
    - Some configurations may require to be configured in `Program.cs` 
- `appsettings.json`: Configuration file for the API.
- `Controllers` folder contains all controllers.

### Commenting
- `summary` only includes roles
- `param` section is used to describe parameters.
	- If it's a POST request, put parameter descriptions in the `remarks` section.
- `response` section is used for all possible responses. Each response code should include all possible messages
	- Example:
``` csharp
///<response code="400">Validation error. Possible messages:  
/// - EMAIL_REQUIRED  
/// - INVALID_EMAIL_FORMAT  
/// - PASSWORD_REQUIRED  
/// - PASSWORD_MIN_8_CHARACTERS  
/// - PASSWORD_MUST_CONTAIN_UPPERCASE_LOWERCASE_NUMBER_SPECIAL  
/// - CONFIRM_PASSWORD_MUST_MATCH  
/// - FIRST_NAME_REQUIRED  
/// - LAST_NAME_REQUIRED
/// </response>
```

## Services

### Folder Structure
- `Mapping` folder contains mappings between DTOs and Models. Example:
```csharp
  public static class AccountMappers
    {
        #region DTO to Entity

        #endregion

        #region Entity to DTO
        public static AccountResponse ToResponse(this Account entity)
        {
            return new AccountResponse
            {
                Id = entity.Id,
                Email = entity.Email,
                Role = entity.RoleEnum,
                FullName = entity.FullName,
                Phone = entity.Phone,
                DateOfBirth = entity.DateOfBirth,
                AvatarUrl = entity.AvatarUrl,
                IsActive = entity.IsActive,
                EmailVerified = entity.EmailVerified
            };
        }
        #endregion
    }
```
- `ServiceConfigurations.cs`: Service Configuration settings for the Services project.

## Repositories

### Folder Structure
- `DTOs` folder contains all Data Transfer Objects
- `Enums` folder contains all Enums
- `RepositoryConfigurations.cs`: Service Configuration settings for the Repositories project.


## Infrastructure

### Folder Structure
- `BaseClasses` folder contains base classes 
- `Helpers` folder contains helper classes
- `InfrastructureConfigurations.cs`: Service Configuration settings for the Infrastructure project.
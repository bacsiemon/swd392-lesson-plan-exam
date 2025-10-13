using App.Infrastructure.BaseClasses;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace App.Infrastructure.Validation.Examples
{
    /// <summary>
    /// Example demonstrating how to manually validate DTOs using the registered validators
    /// This is useful for unit testing or when you need to validate objects outside of API controllers
    /// </summary>
    public class ValidationExample
    {
        private readonly IServiceProvider _serviceProvider;

        public ValidationExample(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        /// <summary>
        /// Example of manual validation for any DTO type
        /// </summary>
        public async Task<BaseResponse> ValidateAsync<T>(T dto) where T : class
        {
            // Get the validator from DI container
            var validator = _serviceProvider.GetService<IValidator<T>>();
            
            if (validator != null)
            {
                var validationResult = await validator.ValidateAsync(dto);
                
                if (!validationResult.IsValid)
                {
                    return new BaseResponse
                    {
                        StatusCode = 400,
                        Message = "Validation failed",
                        Errors = validationResult.Errors.Select(e => new
                        {
                            PropertyName = e.PropertyName,
                            ErrorMessage = e.ErrorMessage,
                            AttemptedValue = e.AttemptedValue
                        }).ToList()
                    };
                }
            }

            return new BaseResponse
            {
                StatusCode = 200,
                Message = "Validation successful",
                Data = dto
            };
        }

        /// <summary>
        /// Example of getting a validator for a specific type
        /// </summary>
        public IValidator<T>? GetValidator<T>() where T : class
        {
            return _serviceProvider.GetService<IValidator<T>>();
        }
    }
}
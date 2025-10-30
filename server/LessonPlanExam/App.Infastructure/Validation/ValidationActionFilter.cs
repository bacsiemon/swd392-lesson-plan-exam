using App.Infrastructure.BaseClasses;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace App.Infrastructure.Validation
{
    public class ValidationActionFilter : IAsyncActionFilter
    {
        private readonly IServiceProvider _serviceProvider;

        public ValidationActionFilter(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            foreach (var argument in context.ActionArguments)
            {
                if (argument.Value != null)
                {
                    var validatorType = typeof(IValidator<>).MakeGenericType(argument.Value.GetType());
                    var validator = _serviceProvider.GetService(validatorType) as IValidator;

                    if (validator != null)
                    {
                        var validationResult = await validator.ValidateAsync(
                            new ValidationContext<object>(argument.Value));

                        if (!validationResult.IsValid)
                        {
                            var response = new BaseResponse
                            {
                                StatusCode = 400,
                                Message = "Validation failed",
                                Errors = validationResult.Errors.Select(e => new
                                {
                                    Name = e.PropertyName,
                                    Error = e.ErrorMessage
                                }).ToList()
                            };

                            context.Result = new BadRequestObjectResult(response);
                            return;
                        }
                    }
                }
            }

            await next();
        }
    }
}
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace App.Infrastructure.Validation
{
    public static class ValidationExtensions
    {
        public static IServiceCollection AddFluentValidationAutoValidation(this IServiceCollection services, params Assembly[] assemblies)
        {
            // Register all validators from the specified assemblies
            foreach (var assembly in assemblies)
            {
                var validatorTypes = assembly.GetTypes()
                    .Where(t => t.IsClass && !t.IsAbstract && 
                               t.GetInterfaces().Any(i => i.IsGenericType && 
                                                         i.GetGenericTypeDefinition() == typeof(IValidator<>)))
                    .ToList();

                foreach (var validatorType in validatorTypes)
                {
                    var interfaceType = validatorType.GetInterfaces()
                        .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IValidator<>));
                    
                    services.AddScoped(interfaceType, validatorType);
                }
            }

            // Register the validation action filter
            services.AddScoped<ValidationActionFilter>();

            return services;
        }
    }
}
using App.Infrastructure.Validation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace App.Infrastructure
{
    public static class InfrastructureConfigurations
    {
        public static IServiceCollection AddInfrastructureConfigurations(this IServiceCollection services, IConfiguration configuration, params Assembly[] validatorAssemblies)
        {
            // Add FluentValidation with auto validation
            services.AddFluentValidationAutoValidation(validatorAssemblies);

            return services;
        }
    }
}

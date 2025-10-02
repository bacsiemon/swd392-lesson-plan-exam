using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace App.Infrastructure
{
    public static class InfrastructureConfigurations
    {
        public static IServiceCollection AddInfrastructureConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            return services;
        }
    }
}

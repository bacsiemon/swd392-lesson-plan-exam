using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LessonPlanExam.Services
{
    public static class ServiceConfigurations
    {
        public static IServiceCollection AddServiceConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            return services;
        }
    }
}

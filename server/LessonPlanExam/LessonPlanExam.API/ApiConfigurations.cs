using App.Infrastructure.Validation;

namespace LessonPlanExam.API
{
    public static class ApiConfigurations
    {
        public static IServiceCollection AddApiConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            // Add MVC with validation filter
            services.AddControllers(options =>
            {
                options.Filters.Add<ValidationActionFilter>();
            });

            return services;
        }
    }
}

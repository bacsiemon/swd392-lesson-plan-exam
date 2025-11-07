using LessonPlanExam.Repositories.Models;
using LessonPlanExam.Repositories.UoW;
using LessonPlanExam.Repositories.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LessonPlanExam.Repositories.Repositories;

namespace LessonPlanExam.Repositories
{
    public static class RepositoryConfigurations
    {
        public static IServiceCollection AddRepositoryConfigurations(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext(configuration);
            services.AddDependencyInjection();
            return services;
        }

        public static void AddDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            string connectionString = configuration.GetConnectionString("AzureDBConnection");
#if DEBUG
            connectionString = configuration.GetConnectionString("LocalConnection");
#endif
            services.AddDbContext<LessonPlanExamDbContext>(options =>
            options.UseNpgsql(connectionString));
        }

        public static void AddDependencyInjection(this IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<Interfaces.IQuestionBankRepository, Repositories.QuestionBankRepository>();
            services.AddScoped<Interfaces.IQuestionRepository, Repositories.QuestionRepository>();
            services.AddScoped<Interfaces.IExamMatrixRepository, Repositories.ExamMatrixRepository>();
            services.AddScoped<Interfaces.IExamRepository, Repositories.ExamRepository>();
            services.AddScoped<Interfaces.IExamAttemptRepository, Repositories.ExamAttemptRepository>();
            services.AddScoped<Interfaces.IExamAttemptAnswerRepository, Repositories.ExamAttemptAnswerRepository>();
            services.AddScoped<Interfaces.IQuestionDifficultyRepository, Repositories.QuestionDifficultyRepository>();
        }
    }
}

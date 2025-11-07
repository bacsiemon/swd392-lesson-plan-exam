using LessonPlanExam.Services.Configuration;
using LessonPlanExam.Services.Interfaces;
using LessonPlanExam.Services.Services;
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
            services.Configure<FileUploadConfiguration>(configuration.GetSection(FileUploadConfiguration.SectionName));
            services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
            services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
            services.AddHttpContextAccessor(); // Required for AccountService JWT functionality
            services.AddDependencyInjection();
            return services;
        }

        public static void AddDependencyInjection(this IServiceCollection services)
        {
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IFileUploadService, FileUploadService>();
            services.AddScoped<ILessonPlanService, LessonPlanService>();
            services.AddScoped<ISlotPlanService, SlotPlanService>();
            services.AddScoped<IQuestionBankService, QuestionBankService>();
            services.AddScoped<IQuestionService, QuestionService>();
            services.AddScoped<IExamMatrixService, ExamMatrixService>();
            services.AddScoped<IExamService, ExamService>();
            services.AddScoped<IAttemptService, AttemptService>();
            services.AddScoped<IQuestionDifficultyService, QuestionDifficultyService>();
            // Removed IUserService registration as functionality moved to AccountService
        }
    }
}

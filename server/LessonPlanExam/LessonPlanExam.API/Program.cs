using App.Infrastructure;
using LessonPlanExam.API;
using LessonPlanExam.API.Middlewares;
using LessonPlanExam.Repositories;
using LessonPlanExam.Repositories.DTOs;
using LessonPlanExam.Services;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApiConfigurations(builder.Configuration);
builder.Services.AddServiceConfigurations(builder.Configuration);
builder.Services.AddRepositoryConfigurations(builder.Configuration);

// Get assemblies that contain validators
var apiAssembly = Assembly.GetExecutingAssembly(); // API assembly for API DTOs and validators
var repositoriesAssembly = Assembly.GetAssembly(typeof(ExampleRequest))!; // Repositories assembly
builder.Services.AddInfrastructureConfigurations(builder.Configuration, apiAssembly, repositoriesAssembly);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

var app = builder.Build();

// Configure the HTTP request pipeline.

// Add exception middleware first to catch all unhandled exceptions
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

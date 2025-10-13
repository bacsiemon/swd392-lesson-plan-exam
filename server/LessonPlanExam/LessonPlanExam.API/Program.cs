using App.Infrastructure;
using LessonPlanExam.API;
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
// Requires a class from the assembly
var repositoriesAssembly = Assembly.GetAssembly(typeof(ExampleRequest))!;
builder.Services.AddInfrastructureConfigurations(builder.Configuration, repositoriesAssembly);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

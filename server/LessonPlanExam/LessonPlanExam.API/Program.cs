using App.Infrastructure;
using LessonPlanExam.API;
using LessonPlanExam.API.Middlewares;
using LessonPlanExam.Repositories;
using LessonPlanExam.Repositories.DTOs;
using LessonPlanExam.Services;
using LessonPlanExam.Services.Configuration;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApiConfigurations(builder.Configuration);
builder.Services.AddServiceConfigurations(builder.Configuration);
builder.Services.AddRepositoryConfigurations(builder.Configuration);

// JWT Configuration
// TODO: Uncomment after installing Microsoft.AspNetCore.Authentication.JwtBearer package
/*
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
if (jwtSettings != null && !string.IsNullOrEmpty(jwtSettings.SecretKey))
{
    var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);
    
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Set to true in production
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });
}
*/

builder.Services.AddAuthorization();

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
    
    // Add JWT authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
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

// TODO: Uncomment after JWT configuration is enabled
// app.UseAuthentication(); // Add authentication middleware
app.UseAuthorization();

app.MapControllers();

app.Run();

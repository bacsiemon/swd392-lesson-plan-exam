# Dockerfile for Production Deployment
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["LessonPlanExam.API/LessonPlanExam.API.csproj", "LessonPlanExam.API/"]
COPY ["LessonPlanExam.Services/LessonPlanExam.Services.csproj", "LessonPlanExam.Services/"]
COPY ["LessonPlanExam.Repositories/LessonPlanExam.Repositories.csproj", "LessonPlanExam.Repositories/"]
COPY ["App.Infastructure/App.Infrastructure.csproj", "App.Infastructure/"]

# Restore dependencies
RUN dotnet restore "LessonPlanExam.API/LessonPlanExam.API.csproj"

# Copy source code
COPY . .
WORKDIR "/src/LessonPlanExam.API"

# Build application
RUN dotnet build "LessonPlanExam.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "LessonPlanExam.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "LessonPlanExam.API.dll"]
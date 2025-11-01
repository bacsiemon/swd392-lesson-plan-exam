# Production Deployment Script
# Run this script to deploy to production

Write-Host "=== LESSON PLAN EXAM - PRODUCTION DEPLOYMENT ===" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or running" -ForegroundColor Red
    exit 1
}

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production file not found" -ForegroundColor Red
    Write-Host "Please copy .env.production.example to .env.production and configure your settings" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Write-Host "📋 Loading production environment variables..." -ForegroundColor Yellow
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match "^([^#][^=]*)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], [EnvironmentVariableTarget]::Process)
    }
}

# Build and run containers
Write-Host "🏗️ Building and starting production containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

# Check if containers are running
Write-Host "🔍 Checking container status..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml ps

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml exec api dotnet ef database update

# Show logs
Write-Host "📋 Recent logs:" -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml logs --tail=50

Write-Host "✅ Production deployment completed!" -ForegroundColor Green
Write-Host "🌐 Application should be running at: http://localhost" -ForegroundColor Cyan
Write-Host "📊 API Documentation: http://localhost/swagger" -ForegroundColor Cyan
Write-Host "🗄️ Database: localhost:5432" -ForegroundColor Cyan

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your domain DNS to point to this server" -ForegroundColor White
Write-Host "2. Set up SSL certificates" -ForegroundColor White
Write-Host "3. Configure email settings with real SMTP" -ForegroundColor White
Write-Host "4. Test all authentication endpoints" -ForegroundColor White
Write-Host "5. Set up monitoring and logging" -ForegroundColor White
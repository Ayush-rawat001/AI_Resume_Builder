# Script to run all ResumeAI services on localhost

$services = @(
    "AuthService",
    "ResumeService",
    "SectionService",
    "TemplateService",
    "AIService",
    "ExportService",
    "JobSearchService",
    "ApiGateway"
)

Write-Host "Starting Backend Microservices..." -ForegroundColor Green
foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Cyan
    Start-Process -FilePath "dotnet" -ArgumentList "run --project .\$service\$service.csproj" -WindowStyle Normal
}

Write-Host "Starting Frontend UI..." -ForegroundColor Green
Set-Location .\resumeai-frontend\resumeai
Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Normal
Set-Location ..\..

Write-Host "All services started! The API Gateway is running on http://localhost:4000 and the UI is on http://localhost:5173 (or as configured in Vite)." -ForegroundColor Yellow
Write-Host "Please check the opened console windows for logs." -ForegroundColor Yellow

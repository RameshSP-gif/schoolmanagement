# Quick Start - Development Mode

Write-Host "🚀 Starting School Management System..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server/server.js"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm start"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Application Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Login: admin@school.com / admin123" -ForegroundColor Yellow

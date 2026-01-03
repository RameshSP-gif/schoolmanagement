# School Management System - E2E Setup & Run Script
# This script sets up and runs the complete application

Write-Host "🎓 School Management System - E2E Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "✓ Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Check .env file
Write-Host ""
Write-Host "🔧 Checking configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "  Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green
}

# Initialize SQLite database
Write-Host ""
Write-Host "🗄️  Initializing SQLite database..." -ForegroundColor Yellow
if (Test-Path "school_management.db") {
    Remove-Item "school_management.db" -Force
    Write-Host "  Removed old database" -ForegroundColor Gray
}
Write-Host "  Database will be auto-created on first server start" -ForegroundColor Gray
Write-Host "  ✓ Database ready" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Application..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start backend server
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node server/server.js
}

Start-Sleep -Seconds 3

# Check if backend started successfully
$backendRunning = Get-Job $backendJob.Id | Where-Object { $_.State -eq "Running" }
if ($backendRunning) {
    Write-Host "✓ Backend server running on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "✗ Backend server failed to start" -ForegroundColor Red
    Receive-Job $backendJob.Id
    exit 1
}

# Start frontend
Write-Host ""
Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\client"
    npm start
}

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ APPLICATION RUNNING!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "💚 Health:   http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Demo Accounts:" -ForegroundColor Yellow
Write-Host "   Admin:   admin@school.com   / admin123" -ForegroundColor White
Write-Host "   Teacher: teacher@school.com / teacher123" -ForegroundColor White
Write-Host "   Student: student@school.com / student123" -ForegroundColor White
Write-Host "   Parent:  parent@school.com  / parent123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host ""

# Keep script running and show logs
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob.Id -ErrorAction SilentlyContinue
    Stop-Job $frontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job $backendJob.Id -ErrorAction SilentlyContinue
    Remove-Job $frontendJob.Id -ErrorAction SilentlyContinue
    Write-Host "✓ All servers stopped" -ForegroundColor Green
}

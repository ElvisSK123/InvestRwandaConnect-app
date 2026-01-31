# Service Status Checker for InvestRwanda Connect
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Service Status Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if port is listening
function Test-Port {
    param($Port, $ServiceName)
    
    $result = netstat -ano | Select-String ":$Port.*LISTENING"
    
    if ($result) {
        Write-Host "[OK] $ServiceName" -ForegroundColor Green -NoNewline
        Write-Host " (Port $Port) - " -NoNewline
        Write-Host "RUNNING" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[X] $ServiceName" -ForegroundColor Red -NoNewline
        Write-Host " (Port $Port) - " -NoNewline
        Write-Host "NOT RUNNING" -ForegroundColor Red
        return $false
    }
}

# Check all services
$backendRunning = Test-Port -Port 5000 -ServiceName "Backend API      "
$adminPortalRunning = Test-Port -Port 5172 -ServiceName "Admin Portal     "
$frontendRunning = Test-Port -Port 5173 -ServiceName "Main Frontend    "
$databaseRunning = Test-Port -Port 5174 -ServiceName "PostgreSQL DB    "

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Overall status
$allRunning = $backendRunning -and $adminPortalRunning -and $frontendRunning -and $databaseRunning

if ($allRunning) {
    Write-Host "All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Yellow
    Write-Host "   Admin Portal:  http://localhost:5172" -ForegroundColor White
    Write-Host "   Main App:      http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend API:   http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "Admin Login:" -ForegroundColor Yellow
    Write-Host "   Email:         admin@investrwanda.com" -ForegroundColor White
    Write-Host "   Password:      Admin@123" -ForegroundColor White
} else {
    Write-Host "WARNING: Some services are not running!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start all services, run:" -ForegroundColor Yellow
    Write-Host "   .\run-in-terminals.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

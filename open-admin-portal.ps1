# Quick Access to Admin Portal
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           OPENING ADMIN PORTAL IN BROWSER                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if servers are running
Write-Host "Checking servers..." -ForegroundColor Yellow

$backendRunning = netstat -ano | findstr :5000
$frontendRunning = netstat -ano | findstr :5173

if (-not $backendRunning) {
    Write-Host "ERROR: Backend server is not running!" -ForegroundColor Red
    Write-Host "Start it with: cd server; npm start" -ForegroundColor Yellow
    exit 1
}

if (-not $frontendRunning) {
    Write-Host "ERROR: Frontend server is not running!" -ForegroundColor Red
    Write-Host "Start it with: cd client; npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "Servers are running!" -ForegroundColor Green
Write-Host "`nOpening Admin Portal in your browser...`n" -ForegroundColor Cyan

# Try multiple browsers
$urls = @(
    "http://localhost:5173/admin/portal",
    "http://127.0.0.1:5173/admin/portal"
)

foreach ($url in $urls) {
    Write-Host "Opening: $url" -ForegroundColor White
    Start-Process $url
    Start-Sleep -Seconds 1
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ADMIN PORTAL OPENED!                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "If browser didn't open automatically, copy and paste:" -ForegroundColor Yellow
Write-Host "http://localhost:5173/admin/portal" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT: You need to be logged in as admin!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Steps if you see 'Access Denied':" -ForegroundColor Yellow
Write-Host "1. Create admin user: .\setup-admin.ps1" -ForegroundColor Gray
Write-Host "2. Login at: http://localhost:5173/auth/login" -ForegroundColor Gray
Write-Host "3. Then visit: http://localhost:5173/admin/portal" -ForegroundColor Gray
Write-Host ""

Write-Host "Other useful links:" -ForegroundColor Cyan
Write-Host "- Home: http://localhost:5173" -ForegroundColor Gray
Write-Host "- Dashboard: http://localhost:5173/dashboard" -ForegroundColor Gray
Write-Host "- Login: http://localhost:5173/auth/login" -ForegroundColor Gray
Write-Host "- Register: http://localhost:5173/auth/register" -ForegroundColor Gray
Write-Host ""

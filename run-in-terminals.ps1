# InvestRwanda Connect - Run in Separate Terminal Windows

Write-Host "🚀 Starting InvestRwanda Connect in Separate Terminal Windows..." -ForegroundColor Green
Write-Host ""

$ProjectRoot = "C:\Users\Elvis\Desktop\InvestRwandaConnect-app"

# Terminal 1: Backend Server
Write-Host "📦 Opening Backend Server Terminal..." -ForegroundColor Cyan
Start-Process wt -ArgumentList "new-tab --title 'Backend Server' pwsh -NoExit -Command `"cd '$ProjectRoot\server'; Write-Host '🔧 Backend Server (Port 5000)' -ForegroundColor Green; Write-Host ''; npm start`""

Start-Sleep -Seconds 2

# Terminal 2: Frontend Client
Write-Host "🎨 Opening Frontend Client Terminal..." -ForegroundColor Cyan
Start-Process wt -ArgumentList "new-tab --title 'Frontend Client' pwsh -NoExit -Command `"cd '$ProjectRoot\client'; Write-Host '🎨 Frontend Client (Port 5173)' -ForegroundColor Green; Write-Host ''; npm run dev`""

Write-Host ""
Write-Host "✅ Application terminals opened!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access Points:" -ForegroundColor Yellow
Write-Host "   Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host "   Admin Portal: http://localhost:5173/admin/portal" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Use Ctrl+C in each terminal to stop the servers" -ForegroundColor Cyan
Write-Host ""

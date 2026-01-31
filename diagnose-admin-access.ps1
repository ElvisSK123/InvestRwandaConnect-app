# Diagnose Admin Portal Access Issues
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        ADMIN PORTAL ACCESS DIAGNOSTICS                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$issues = @()
$checks = 0

# Check 1: Backend Server
Write-Host "[1/6] Checking Backend Server..." -ForegroundColor Yellow
$backend = netstat -ano | findstr :5000
if ($backend) {
    Write-Host "  ✅ Backend is running on port 5000" -ForegroundColor Green
    $checks++
} else {
    Write-Host "  ❌ Backend is NOT running" -ForegroundColor Red
    $issues += "Backend server not running. Run: cd server; npm start"
}

# Check 2: Frontend Server
Write-Host "[2/6] Checking Frontend Server..." -ForegroundColor Yellow
$frontend = netstat -ano | findstr :5173
if ($frontend) {
    Write-Host "  ✅ Frontend is running on port 5173" -ForegroundColor Green
    $checks++
} else {
    Write-Host "  ❌ Frontend is NOT running" -ForegroundColor Red
    $issues += "Frontend server not running. Run: cd client; npm run dev"
}

# Check 3: Database Connection
Write-Host "[3/6] Checking Database..." -ForegroundColor Yellow
$db = netstat -ano | findstr :5174
if ($db) {
    Write-Host "  ✅ PostgreSQL is running on port 5174" -ForegroundColor Green
    $checks++
} else {
    Write-Host "  ⚠️  PostgreSQL might not be running on port 5174" -ForegroundColor Yellow
    $issues += "Database connection issue. Check if PostgreSQL is running"
}

# Check 4: Admin Route
Write-Host "[4/6] Checking Admin Portal Route..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/admin/portal" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✅ Admin Portal URL is accessible" -ForegroundColor Green
    $checks++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ⚠️  Admin Portal requires authentication (expected)" -ForegroundColor Yellow
        $checks++
    } else {
        Write-Host "  ❌ Cannot access Admin Portal" -ForegroundColor Red
        $issues += "Admin Portal URL not accessible"
    }
}

# Check 5: Backend Health
Write-Host "[5/6] Checking Backend API Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5
    Write-Host "  ✅ Backend API is healthy" -ForegroundColor Green
    $checks++
} catch {
    Write-Host "  ❌ Backend API is not responding" -ForegroundColor Red
    $issues += "Backend API not responding. Check backend console for errors"
}

# Check 6: Check for Admin Users
Write-Host "[6/6] Checking for Admin Users..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "kagaba"
    $adminCheck = psql -U postgres -p 5174 -d investrwanda -t -c "SELECT COUNT(*) FROM users WHERE role = 'admin';" 2>$null
    
    if ($adminCheck -and $adminCheck.Trim() -gt 0) {
        Write-Host "  ✅ Admin user(s) exist in database" -ForegroundColor Green
        $checks++
        
        # Show admin users
        Write-Host "`n  Admin Users:" -ForegroundColor Cyan
        $admins = psql -U postgres -p 5174 -d investrwanda -c "SELECT email, full_name FROM users WHERE role = 'admin';" 2>$null
        Write-Host $admins -ForegroundColor Gray
    } else {
        Write-Host "  ❌ NO admin users found in database" -ForegroundColor Red
        $issues += "No admin user exists. Run: .\setup-admin.ps1"
    }
} catch {
    Write-Host "  ⚠️  Cannot check database (psql not available)" -ForegroundColor Yellow
    $issues += "Cannot verify admin users. Check database manually"
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    DIAGNOSTIC SUMMARY                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Checks Passed: $checks/6`n" -ForegroundColor $(if ($checks -eq 6) { "Green" } else { "Yellow" })

if ($issues.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`nYour Admin Portal should be accessible at:" -ForegroundColor Cyan
    Write-Host "http://localhost:5173/admin/portal`n" -ForegroundColor White
    
    Write-Host "If you still can't access it:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're logged in as admin user" -ForegroundColor Gray
    Write-Host "2. Check browser console (F12) for errors" -ForegroundColor Gray
    Write-Host "3. Clear browser cache and try again" -ForegroundColor Gray
    Write-Host "4. Check if you have a valid JWT token in localStorage`n" -ForegroundColor Gray
    
} else {
    Write-Host "❌ ISSUES FOUND:`n" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  • $_" -ForegroundColor Yellow }
    Write-Host ""
}

# Common Solutions
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "COMMON SOLUTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Issue: Not logged in as admin" -ForegroundColor White
Write-Host "  → Run: .\setup-admin.ps1" -ForegroundColor Gray
Write-Host "  → Then login at: http://localhost:5173/auth/login" -ForegroundColor Gray
Write-Host ""
Write-Host "Issue: Servers not running" -ForegroundColor White
Write-Host "  → Run: .\run-in-terminals.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Issue: 'Access denied' message" -ForegroundColor White
Write-Host "  → Your account needs admin role" -ForegroundColor Gray
Write-Host "  → Run: .\setup-admin.ps1 (option 2)" -ForegroundColor Gray
Write-Host ""
Write-Host "Issue: Page redirects to login" -ForegroundColor White
Write-Host "  → Login first at: http://localhost:5173/auth/login" -ForegroundColor Gray
Write-Host "  → Use admin credentials" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

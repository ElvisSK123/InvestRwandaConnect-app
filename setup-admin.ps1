# Setup Admin User for InvestRwanda Connect
# This script helps you create or update an admin user

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           ADMIN USER SETUP - InvestRwanda Connect         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Choose an option:`n" -ForegroundColor Yellow
Write-Host "1. Register a new admin user through the UI (Recommended)" -ForegroundColor White
Write-Host "2. Update an existing user to admin role" -ForegroundColor White
Write-Host "3. Check if admin user exists" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n✅ OPTION 1: Register through UI" -ForegroundColor Green
        Write-Host "`nSteps:" -ForegroundColor Yellow
        Write-Host "1. Open: http://localhost:5173/auth/register" -ForegroundColor White
        Write-Host "2. Fill in the form with:" -ForegroundColor White
        Write-Host "   - Full Name: Admin User" -ForegroundColor Gray
        Write-Host "   - Email: admin@investrwanda.com" -ForegroundColor Gray
        Write-Host "   - Password: admin123 (or your choice)" -ForegroundColor Gray
        Write-Host "   - Role: Select 'Investor' (we'll change it next)" -ForegroundColor Gray
        Write-Host "3. After registration, run this script again and choose option 2" -ForegroundColor White
        Write-Host "`n💡 Opening browser..." -ForegroundColor Cyan
        Start-Process "http://localhost:5173/auth/register"
    }
    "2" {
        Write-Host "`n✅ OPTION 2: Update existing user to admin" -ForegroundColor Green
        $email = Read-Host "`nEnter the email of the user to make admin"
        
        Write-Host "`n📝 SQL Command to run:" -ForegroundColor Yellow
        Write-Host "UPDATE users SET role = 'admin' WHERE email = '$email';" -ForegroundColor White
        
        Write-Host "`n🔧 Run this in your database:" -ForegroundColor Cyan
        Write-Host "1. Connect to your database" -ForegroundColor Gray
        Write-Host "2. Execute the SQL command above" -ForegroundColor Gray
        Write-Host "`nOR press Enter to try running it now (requires psql)..." -ForegroundColor Yellow
        Read-Host
        
        try {
            $env:PGPASSWORD = "kagaba"
            $result = psql -U postgres -p 5174 -d investrwanda -c "UPDATE users SET role = 'admin' WHERE email = '$email'; SELECT * FROM users WHERE email = '$email';"
            Write-Host "`n✅ User updated successfully!" -ForegroundColor Green
            Write-Host $result
        } catch {
            Write-Host "`n⚠️  Could not connect to database automatically" -ForegroundColor Yellow
            Write-Host "Please run the SQL command manually in your database tool" -ForegroundColor Gray
        }
    }
    "3" {
        Write-Host "`n✅ OPTION 3: Check for admin users" -ForegroundColor Green
        try {
            $env:PGPASSWORD = "kagaba"
            Write-Host "`n🔍 Checking for admin users...`n" -ForegroundColor Cyan
            $result = psql -U postgres -p 5174 -d investrwanda -c "SELECT id, full_name, email, role, created_at FROM users WHERE role = 'admin';"
            
            if ($result -match "0 rows") {
                Write-Host "❌ No admin users found!" -ForegroundColor Red
                Write-Host "`n💡 Run this script again and choose option 1 or 2" -ForegroundColor Yellow
            } else {
                Write-Host $result
                Write-Host "`n✅ Admin user(s) found!" -ForegroundColor Green
            }
        } catch {
            Write-Host "`n⚠️  Could not connect to database" -ForegroundColor Yellow
            Write-Host "Make sure PostgreSQL is running on port 5174" -ForegroundColor Gray
        }
    }
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "QUICK TESTING CREDENTIALS:" -ForegroundColor Yellow
Write-Host "  Email: admin@investrwanda.com" -ForegroundColor White
Write-Host "  Password: admin123 (or what you set)" -ForegroundColor White
Write-Host "`nAdmin Portal: http://localhost:5173/admin/portal" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

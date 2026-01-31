@echo off
echo.
echo ================================================
echo    OPENING ADMIN PORTAL
echo ================================================
echo.

REM Open Admin Portal
start http://localhost:5173/admin/portal

echo Admin Portal opened in your browser!
echo.
echo URL: http://localhost:5173/admin/portal
echo.
echo IMPORTANT: You need to login as admin first!
echo.
echo If you see "Access Denied":
echo 1. Run: setup-admin.ps1
echo 2. Login at: http://localhost:5173/auth/login
echo 3. Then access Admin Portal
echo.
pause

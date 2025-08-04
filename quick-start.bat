@echo off
title UniConnect MVP - Quick Start
echo Starting UniConnect MVP...

REM Navigate to project directory
cd /d "%~dp0"

REM Start backend in background
start "Backend" cmd /k "cd backend && node server.js"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start frontend
start "Frontend" cmd /k "npm run dev"

REM Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo UniConnect MVP is starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Close the terminal windows to stop services.
pause

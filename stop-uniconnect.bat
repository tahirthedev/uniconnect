@echo off
title UniConnect MVP - Stop Services
echo.
echo ========================================
echo     Stopping UniConnect Services
echo ========================================
echo.

REM Kill all Node.js processes
echo Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

echo.
echo All UniConnect services have been stopped.
echo Ports 3000 and 5000 are now available.
echo.
pause

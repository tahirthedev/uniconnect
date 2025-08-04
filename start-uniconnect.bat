@echo off
title UniConnect MVP - Starting Services
echo.
echo ========================================
echo        UniConnect MVP Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

REM Navigate to project root
cd /d "%~dp0"

REM Check if node_modules exists in frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo Frontend dependencies installed successfully
    echo.
)

REM Check if node_modules exists in backend
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo Backend dependencies installed successfully
    echo.
)

echo Starting UniConnect services...
echo.

REM Start backend server in background
echo Starting backend server on port 5000...
start "UniConnect Backend" cmd /k "cd /d %~dp0backend && node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting frontend server on port 3000...
start "UniConnect Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo       UniConnect MVP Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Health:   http://localhost:5000/health
echo.
echo Both services are starting in separate windows.
echo Close those windows to stop the services.
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the application in default browser
start http://localhost:3000

echo.
echo UniConnect MVP is now running!
echo Close the terminal windows to stop the services.
echo.
pause

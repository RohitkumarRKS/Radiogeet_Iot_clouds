@echo off
title RadioGeet IoT Cloud Platform Launcher
echo ===================================================
echo   Starting RadioGeet IoT Cloud Platform...
echo ===================================================
echo.

:: 1. Check frontend dependencies
if not exist "%~dp0frontend\node_modules" (
    echo [*] Frontend dependencies not found. Installing now...
    cd /d "%~dp0frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend npm install failed!
        pause
        exit /b %errorlevel%
    )
)

:: 2. Check backend dependencies
if not exist "%~dp0backend\node_modules" (
    echo [*] Backend dependencies not found. Installing now...
    cd /d "%~dp0backend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend npm install failed!
        pause
        exit /b %errorlevel%
    )
)

:: 3. Build frontend
echo [1/2] Building Frontend UI...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %errorlevel%
)

:: 4. Launch backend
echo.
echo [2/2] Launching Backend Server, WebSocket ^& MQTT Broker (Port 2004 ^& 1883)...
cd /d "%~dp0backend"

:: Automatically open browser
start "" "http://localhost:2004"

echo.
echo ===================================================
echo   RadioGeet IoT Cloud is running at http://localhost:2004
echo   MQTT Broker listening on port 1883
echo ===================================================
echo.

call npm start


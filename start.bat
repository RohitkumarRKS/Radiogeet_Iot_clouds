@echo off
title CloudBoard IIoT Platform Launcher
echo ===================================================
echo   Starting CloudBoard IIoT Platform...
echo ===================================================
echo.
echo [1/2] Building Frontend UI...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Launching Backend Server, WebSocket ^& MQTT Broker (Port 2004 ^& 1883)...
cd /d "%~dp0backend"

:: Automatically open browser
start "" "http://localhost:2004"

echo.
echo ===================================================
echo   CloudBoard is running at http://localhost:2004
echo   MQTT Broker listening on port 1883
echo ===================================================
echo.

call npm start

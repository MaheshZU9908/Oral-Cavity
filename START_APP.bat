@echo off
title PathoAI - Starting...

:: ── Self-elevate to Administrator ─────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: ── Set project directory ─────────────────────────────────────────────────────
set "DIR=c:\Users\mm211\OneDrive\check it out\OneDrive\Desktop\Mike"
cd /d "%DIR%"

cls
echo ============================================================
echo    PathoAI - Clinical AI Decision-Support System
echo ============================================================
echo.
echo [1/3] Clearing old processes on ports 80, 5000, 8000...

powershell -NoProfile -Command ^
  "netstat -ano | Select-String '(:80 |:5000|:8000)' | ForEach-Object { $pid = ($_ -split '\s+')[-1]; if ($pid -match '^\d+$' -and $pid -ne '0') { try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {} } }"

timeout /t 2 /nobreak >nul
echo    Done.
echo.

echo [2/3] Starting Backend (port 5000)...
start "PathoAI Backend" cmd /k "cd /d "%DIR%" && npm run dev:backend"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend (port 80) + AI Service (port 8000)...
start "PathoAI Frontend" cmd /k "cd /d "%DIR%" && npm run dev:frontend"
start "PathoAI AI Service" cmd /k "cd /d "%DIR%" && npm run dev:ai"
timeout /t 6 /nobreak >nul

echo.
echo ============================================================
echo    All services starting up...
echo    Opening browser in 5 seconds...
echo ============================================================
echo.
echo    Frontend  ->  http://localhost
echo    Backend   ->  http://localhost:5000
echo    AI Model  ->  http://localhost:8000
echo.
echo    Login:  doctor@hospital.org  /  Password123!
echo.
echo ============================================================
timeout /t 5 /nobreak >nul

start "" "http://localhost"

echo.
echo    App is running! You can close this window.
echo    To STOP the app, run STOP_APP.bat
pause

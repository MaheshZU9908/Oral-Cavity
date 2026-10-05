@echo off
title PathoAI - Stopping...

:: ── Self-elevate to Administrator ─────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cls
echo ============================================================
echo    PathoAI - Stopping All Services
echo ============================================================
echo.

echo Killing processes on ports 80, 5000, 8000...

powershell -NoProfile -Command ^
  "netstat -ano | Select-String '(:80 |:5000|:8000)' | ForEach-Object { $pid = ($_ -split '\s+')[-1]; if ($pid -match '^\d+$' -and $pid -ne '0') { try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue; Write-Host ('Killed PID ' + $pid) } catch {} } }"

echo.
echo Closing PathoAI terminal windows...
taskkill /FI "WINDOWTITLE eq PathoAI*" /F >nul 2>&1

echo.
echo ============================================================
echo    All PathoAI services stopped successfully.
echo    Run START_APP.bat to start again.
echo ============================================================
echo.
pause

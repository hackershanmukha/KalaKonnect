@echo off
echo ========================================================
echo Launching KalaConnect AI Platform (Backend + Frontend)
echo ========================================================
start "KalaConnect AI - FastAPI Backend (Port 8000)" cmd /k "run_backend.bat"
timeout /t 3 /nobreak >nul
start "KalaConnect AI - Next.js Frontend (Port 3000)" cmd /k "run_frontend.bat"
echo.
echo Both servers have been launched in separate terminal windows!
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo - Web Marketplace: http://localhost:3000
echo ========================================================


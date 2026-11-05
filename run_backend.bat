@echo off
echo ========================================================
echo Starting KalaConnect AI - FastAPI Backend Server
echo API will be accessible at: http://127.0.0.1:8000
echo Swagger Documentation at: http://127.0.0.1:8000/docs
echo ========================================================
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause


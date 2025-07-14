# Backend Development Script
if (!(Test-Path venv)) { python -m venv venv }
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000

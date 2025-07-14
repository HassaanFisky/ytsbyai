# YTS by AI - Windows Setup Script
Write-Host "🚀 Setting up YTS by AI - Windows Development Environment" -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Check-Requirements {
    Write-Status "Checking system requirements..."
    
    # Check Python
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Error "Python is required but not installed"
        exit 1
    }
    
    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is required but not installed"
        exit 1
    }
    
    # Check npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is required but not installed"
        exit 1
    }
    
    Write-Success "System requirements met"
}

# Setup Backend
function Setup-Backend {
    Write-Status "Setting up Backend (FastAPI)..."
    
    Set-Location backend
    
    # Create virtual environment
    python -m venv venv
    
    # Activate virtual environment
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    .\venv\Scripts\Activate.ps1
    
    # Upgrade pip
    python -m pip install --upgrade pip
    
    # Install dependencies (use minimal requirements if on Python 3.13)
    $pythonVersion = (python --version)
    if ($pythonVersion -like "*3.13*") {
        if (Test-Path "requirements-minimal.txt") {
            Write-Warning "Detected Python 3.13, using requirements-minimal.txt to avoid pydantic-core issues."
            pip install -r requirements-minimal.txt
        } else {
            pip install -r requirements.txt
        }
    } else {
        pip install -r requirements.txt
    }
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path .env)) {
        Copy-Item ..\\.env.example .env
        Write-Warning "Created .env file. Please update with your API keys."
    }
    
    # Create dev script
    @"
# Backend Development Script
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@ | Out-File -FilePath "dev.ps1" -Encoding UTF8
    
    Set-Location ..
    Write-Success "Backend setup complete"
}

# Setup Frontend
function Setup-Frontend {
    Write-Status "Setting up Frontend (Next.js)..."
    
    Set-Location frontend
    
    # Install dependencies
    npm install
    
    # Create .env.local file if it doesn't exist
    if (-not (Test-Path .env.local)) {
        Copy-Item ..\\.env.example .env.local
        Write-Warning "Created .env.local file. Please update with your API keys."
    }
    
    # Create dev script
    @"
# Frontend Development Script
cd frontend
npm run dev
"@ | Out-File -FilePath "dev.ps1" -Encoding UTF8
    
    Set-Location ..
    Write-Success "Frontend setup complete"
}

# Setup Mobile
function Setup-Mobile {
    Write-Status "Setting up Mobile App (Expo)..."
    
    Set-Location mobile
    
    # Install dependencies
    npm install
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path .env)) {
        Copy-Item ..\\.env.example .env
        Write-Warning "Created .env file. Please update with your API keys."
    }
    
    # Create dev script
    @"
# Mobile Development Script
cd mobile
npx expo start
"@ | Out-File -FilePath "dev.ps1" -Encoding UTF8
    
    Set-Location ..
    Write-Success "Mobile app setup complete"
}

# Create development scripts
function Create-DevScripts {
    Write-Status "Creating development scripts..."
    
    # Backend dev script
    @"
# Backend Development Script
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@ | Out-File -FilePath "backend\dev.ps1" -Encoding UTF8
    
    # Frontend dev script
    @"
# Frontend Development Script
cd frontend
npm run dev
"@ | Out-File -FilePath "frontend\dev.ps1" -Encoding UTF8
    
    # Mobile dev script
    @"
# Mobile Development Script
cd mobile
npx expo start
"@ | Out-File -FilePath "mobile\dev.ps1" -Encoding UTF8
    
    Write-Success "Development scripts created"
}

# Main setup function
function Main {
    Write-Status "Starting YTS by AI Windows setup..."
    
    Check-Requirements
    Setup-Backend
    Setup-Frontend
    Setup-Mobile
    Create-DevScripts
    
    Write-Host ""
    Write-Success "🎉 YTS by AI Windows setup complete!"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update environment variables in:" -ForegroundColor White
    Write-Host "   - backend/.env" -ForegroundColor White
    Write-Host "   - frontend/.env.local" -ForegroundColor White
    Write-Host "   - mobile/.env" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start development servers:" -ForegroundColor White
    Write-Host "   - Backend: .\backend\dev.ps1" -ForegroundColor Cyan
    Write-Host "   - Frontend: .\frontend\dev.ps1" -ForegroundColor Cyan
    Write-Host "   - Mobile: .\mobile\dev.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Warning "Don't forget to set up your API keys!"
}

# Run main function
Main 
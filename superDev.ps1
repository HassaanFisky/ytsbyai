# YTS by AI - Super Development Script
# Professional SaaS Development Environment
Write-Host "🚀 YTS by AI - Super Development Mode" -ForegroundColor Cyan
Write-Host "Starting all development servers..." -ForegroundColor Yellow

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

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($process) {
            $processId = $process.OwningProcess
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Warning "Killed process on port $Port"
        }
    }
    catch {
        Write-Warning "Could not kill process on port $Port"
    }
}

# Phase 1: Frontend Setup
Write-Status "Phase 1: Setting up Frontend..."
Set-Location frontend

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Status "Installing frontend dependencies..."
    npm install
}

# Kill any process on port 3000 (Next.js default)
if (Test-Port 3000) {
    Write-Warning "Port 3000 is in use. Killing existing process..."
    Stop-ProcessOnPort 3000
}

# Start frontend in background
Write-Status "Starting frontend development server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Minimized
Write-Success "Frontend started on http://localhost:3000"

# Phase 2: Backend Setup
Write-Status "Phase 2: Setting up Backend..."
Set-Location ../backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Status "Creating Python virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Status "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Install/upgrade dependencies
Write-Status "Installing backend dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Kill any process on port 8000 (FastAPI default)
if (Test-Port 8000) {
    Write-Warning "Port 8000 is in use. Killing existing process..."
    Stop-ProcessOnPort 8000
}

# Start backend in background
Write-Status "Starting backend development server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Minimized
Write-Success "Backend started on http://localhost:8000"

# Phase 3: Mobile Setup
Write-Status "Phase 3: Setting up Mobile..."
Set-Location ../mobile

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Status "Installing mobile dependencies..."
    npm install
}

# Kill any process on port 8081 (Expo default)
if (Test-Port 8081) {
    Write-Warning "Port 8081 is in use. Killing existing process..."
    Stop-ProcessOnPort 8081
}

# Start mobile in background
Write-Status "Starting mobile development server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; .\dev.ps1" -WindowStyle Minimized
Write-Success "Mobile started on exp://127.0.0.1:8081"

# Return to root directory
Set-Location ..

# Display status
Write-Host ""
Write-Success "🎉 All development servers are running!"
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📱 Mobile:   exp://127.0.0.1:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Frontend: Open in browser for web development" -ForegroundColor White
Write-Host "   - Backend:  API documentation at http://localhost:8000/docs" -ForegroundColor White
Write-Host "   - Mobile:   Scan QR code with Expo Go app" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop all servers: Close the PowerShell windows or run 'taskkill /f /im node.exe'" -ForegroundColor Red
Write-Host "" 
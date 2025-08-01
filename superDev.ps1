# YTS by AI - Development Startup Script (Windows PowerShell)
# This script starts all development servers for the YTS by AI project

Write-Host "🚀 Starting YTS by AI development environment..." -ForegroundColor Green

# Function to check if a process is running
function Test-ProcessRunning {
    param([string]$ProcessName)
    return Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
}

# Function to start backend
function Start-Backend {
    Write-Host "Starting backend server..." -ForegroundColor Blue
    
    if (Test-Path "backend\venv\Scripts\Activate.ps1") {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python main.py" -WindowStyle Normal
        Write-Host "✅ Backend started on http://localhost:8000" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend virtual environment not found. Run setup-complete.sh first." -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting frontend server..." -ForegroundColor Blue
    
    if (Test-Path "frontend\package.json") {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal
        Write-Host "✅ Frontend started on http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend package.json not found." -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to start mobile (optional)
function Start-Mobile {
    Write-Host "Starting mobile development server..." -ForegroundColor Blue
    
    if (Test-Path "mobile\package.json") {
        # Check if Expo CLI is installed
        try {
            $expoVersion = expo --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; expo start --web" -WindowStyle Normal
                Write-Host "✅ Mobile started on http://localhost:19006" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "⚠️  Expo CLI not found. Install with: npm install -g @expo/cli" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Mobile package.json not found. Skipping mobile." -ForegroundColor Yellow
    }
    return $false
}

# Function to check databases
function Test-Databases {
    Write-Host "Checking database connections..." -ForegroundColor Blue
    
    # Check Redis
    try {
        $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet
        if ($redisTest) {
            Write-Host "✅ Redis is running on localhost:6379" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Redis not running. Start with: docker run -d --name ytsbyai-redis -p 6379:6379 redis:alpine" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Redis not running. Start with: docker run -d --name ytsbyai-redis -p 6379:6379 redis:alpine" -ForegroundColor Yellow
    }
    
    # Check Neo4j
    try {
        $neo4jTest = Test-NetConnection -ComputerName localhost -Port 7687 -InformationLevel Quiet
        if ($neo4jTest) {
            Write-Host "✅ Neo4j is running on localhost:7687" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Neo4j not running. Start with: docker run -d --name ytsbyai-neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Neo4j not running. Start with: docker run -d --name ytsbyai-neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest" -ForegroundColor Yellow
    }
}

# Function to display URLs
function Show-URLs {
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend API:  http://localhost:8000" -ForegroundColor White
    Write-Host "  Admin Panel:  http://localhost:3000/admin/analytics" -ForegroundColor White
    Write-Host "  Demo Portal:  http://localhost:3000/demo" -ForegroundColor White
    Write-Host "  API Docs:     http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  Neo4j Browser: http://localhost:7474" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
    Write-Host "  Test Setup:   .\test-setup.ps1" -ForegroundColor White
    Write-Host "  Deploy:       .\deploy.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""
}

# Main execution
try {
    # Check if we're in the right directory
    if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
        Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
        exit 1
    }
    
    # Check environment file
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  .env file not found. Please run setup-complete.sh first." -ForegroundColor Yellow
    }
    
    # Test databases
    Test-Databases
    
    # Start servers
    $backendStarted = Start-Backend
    $frontendStarted = Start-Frontend
    $mobileStarted = Start-Mobile
    
    # Display URLs
    Show-URLs
    
    # Wait for user input to stop
    Write-Host "Press any key to stop all servers..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
} catch {
    Write-Host "❌ Error starting development environment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Write-Host "🛑 Shutting down development servers..." -ForegroundColor Yellow
    
    # Stop any running processes
    $processes = @("node", "python", "expo")
    foreach ($process in $processes) {
        $running = Get-Process -Name $process -ErrorAction SilentlyContinue
        if ($running) {
            Write-Host "Stopping $process processes..." -ForegroundColor Blue
            Stop-Process -Name $process -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "✅ Development servers stopped" -ForegroundColor Green
} 
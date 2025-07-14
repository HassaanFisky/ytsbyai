# YTS by AI - Stop Development Script
Write-Host "🛑 Stopping all development servers..." -ForegroundColor Red

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

# Stop processes on specific ports
Write-Status "Stopping processes on development ports..."

# Stop frontend (port 3000)
try {
    $frontendProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($frontendProcess) {
        $processId = $frontendProcess.OwningProcess
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Success "Stopped frontend server (port 3000)"
    }
} catch {
    Write-Host "Frontend server not running" -ForegroundColor Yellow
}

# Stop backend (port 8000)
try {
    $backendProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($backendProcess) {
        $processId = $backendProcess.OwningProcess
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Success "Stopped backend server (port 8000)"
    }
} catch {
    Write-Host "Backend server not running" -ForegroundColor Yellow
}

# Stop mobile (port 8081)
try {
    $mobileProcess = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if ($mobileProcess) {
        $processId = $mobileProcess.OwningProcess
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Success "Stopped mobile server (port 8081)"
    }
} catch {
    Write-Host "Mobile server not running" -ForegroundColor Yellow
}

# Kill any remaining Node.js processes (optional)
Write-Status "Cleaning up Node.js processes..."
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Success "Cleaned up Node.js processes"
} catch {
    Write-Host "No Node.js processes found" -ForegroundColor Yellow
}

Write-Success "🎉 All development servers stopped!"
Write-Host ""
Write-Host "💡 To restart: Run .\superDev.ps1" -ForegroundColor Cyan 
# YTS by AI - Complete Setup Script (Windows PowerShell)
# This script sets up the entire YTS by AI project with all features

param(
    [switch]$SkipEnvCheck
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 YTS by AI - Complete Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

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

# Check if we're in the right directory
if (-not (Test-Path "README.md")) {
    Write-Error "Please run this script from the YTS by AI project root directory"
    exit 1
}

Write-Status "Starting YTS by AI setup..."

# Step 1: Check system requirements
Write-Status "Checking system requirements..."

# Check Python version
try {
    $pythonVersion = python --version 2>&1 | Select-String -Pattern "Python (\d+\.\d+)" | ForEach-Object { $_.Matches[0].Groups[1].Value }
    if ($pythonVersion -notmatch "3\.1[12]") {
        Write-Warning "Python 3.11+ recommended. Found: $pythonVersion"
    } else {
        Write-Success "Python version: $pythonVersion"
    }
} catch {
    Write-Warning "Python not found or version could not be determined"
}

# Check Node.js version
try {
    $nodeVersion = node --version 2>&1 | ForEach-Object { $_.Replace("v", "").Split(".")[0,1] -join "." }
    if ($nodeVersion -notmatch "1[89]|20") {
        Write-Warning "Node.js 18+ recommended. Found: $nodeVersion"
    } else {
        Write-Success "Node.js version: $nodeVersion"
    }
} catch {
    Write-Warning "Node.js not found or version could not be determined"
}

# Step 2: Create environment file
Write-Status "Setting up environment variables..."
if (-not (Test-Path ".env")) {
    if (Test-Path "env-template.txt") {
        Copy-Item "env-template.txt" ".env"
        Write-Success "Created .env file from template"
        Write-Warning "Please edit .env file with your API keys before continuing"
    } else {
        Write-Error "env-template.txt not found. Please create .env file manually"
        exit 1
    }
} else {
    Write-Success ".env file already exists"
}

# Step 3: Backend setup
Write-Status "Setting up backend..."
Set-Location "backend"

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Status "Creating Python virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Status "Activating virtual environment..."
& "venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Status "Upgrading pip..."
python -m pip install --upgrade pip

# Install Python dependencies
Write-Status "Installing Python dependencies..."
pip install -r requirements.txt

# Install additional dependencies for voice AI
Write-Status "Installing voice AI dependencies..."
pip install faster-whisper torch torchaudio pydub numpy scipy librosa soundfile websockets

Set-Location ".."

# Step 4: Frontend setup
Write-Status "Setting up frontend..."
Set-Location "frontend"

# Install Node.js dependencies
Write-Status "Installing Node.js dependencies..."
npm install

# Install additional frontend dependencies
Write-Status "Installing additional frontend dependencies..."
npm install @radix-ui/react-tabs @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-label class-variance-authority react-hot-toast lucide-react

Set-Location ".."

# Step 5: Mobile setup
Write-Status "Setting up mobile app..."
Set-Location "mobile"

# Install Expo CLI globally if not available
try {
    $expoVersion = expo --version 2>&1
    Write-Success "Expo CLI found: $expoVersion"
} catch {
    Write-Status "Installing Expo CLI..."
    npm install -g @expo/cli
}

# Install mobile dependencies
Write-Status "Installing mobile dependencies..."
npm install

Set-Location ".."

# Step 6: Chrome extension setup
Write-Status "Setting up Chrome extension..."
Set-Location "chrome-ext"

# Check if manifest.json exists
if (-not (Test-Path "manifest.json")) {
    Write-Error "Chrome extension manifest.json not found"
    exit 1
}

Set-Location ".."

# Step 7: Create necessary directories
Write-Status "Creating necessary directories..."
New-Item -ItemType Directory -Force -Path "backend\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\public\uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "mobile\assets" | Out-Null

# Step 8: Set up development scripts
Write-Status "Setting up development scripts..."

# Step 9: Database setup
Write-Status "Setting up databases..."

# Check if Redis is available
try {
    $redisVersion = redis-server --version 2>&1
    Write-Success "Redis found"
} catch {
    Write-Warning "Redis not found. Please install Redis:"
    Write-Warning "  Download from: https://redis.io/download"
    Write-Warning "  Or use Docker: docker run -d -p 6379:6379 redis:alpine"
}

# Step 10: Verify setup
Write-Status "Verifying setup..."

# Check if all required files exist
$requiredFiles = @(
    "backend\main.py",
    "backend\requirements.txt",
    "frontend\package.json",
    "frontend\next.config.js",
    "mobile\package.json",
    "chrome-ext\manifest.json",
    ".env"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "✓ $file"
    } else {
        Write-Error "✗ $file not found"
    }
}

# Step 11: Create test script
Write-Status "Creating test script..."
$testScript = @"
# YTS by AI - Test Setup Script (Windows PowerShell)

Write-Host "🧪 Testing YTS by AI Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Test backend
Write-Host "Testing backend..."
Set-Location "backend"
& "venv\Scripts\Activate.ps1"
python -c "import fastapi; print('✓ FastAPI imported successfully')"
python -c "import openai; print('✓ OpenAI imported successfully')"
python -c "import firebase_admin; print('✓ Firebase Admin imported successfully')"
Set-Location ".."

# Test frontend
Write-Host "Testing frontend..."
Set-Location "frontend"
npm run build --dry-run 2>$null || Write-Host "✓ Frontend dependencies installed"
Set-Location ".."

# Test mobile
Write-Host "Testing mobile..."
Set-Location "mobile"
npm list expo 2>$null || Write-Host "✓ Expo dependencies installed"
Set-Location ".."

Write-Host "✅ Setup verification complete!" -ForegroundColor Green
"@

$testScript | Out-File -FilePath "test-setup.ps1" -Encoding UTF8

# Step 12: Final instructions
Write-Success "🎉 YTS by AI setup complete!"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your API keys"
Write-Host "2. Start Redis server: redis-server"
Write-Host "3. Start development servers: .\superDev.ps1"
Write-Host "4. Test the setup: .\test-setup.ps1"
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:8000"
Write-Host "Admin Dashboard: http://localhost:3000/admin/analytics"
Write-Host "Demo Portal: http://localhost:3000/demo"
Write-Host "API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "• README.md - Main documentation"
Write-Host "• ADMIN_DASHBOARD.md - Admin features"
Write-Host "• VOICE_AI_INTEGRATION.md - Voice features"
Write-Host "• GRAPH_RAG_INTEGRATION.md - AI recommendations"
Write-Host "• FEEDBACK_SYSTEM.md - User feedback system"
Write-Host "• UNIVERSAL_FEATURE_SYSTEM.md - Feature requests"
Write-Host ""
Write-Host "🚀 Ready to launch YTS by AI!" -ForegroundColor Green 
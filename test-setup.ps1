# YTS by AI - Test Setup Script (Windows PowerShell)
# This script tests the YTS by AI setup to ensure everything is working

Write-Host "🧪 Testing YTS by AI setup..." -ForegroundColor Green

# Function to test backend
function Test-Backend {
    Write-Host "Testing backend..." -ForegroundColor Blue
    
    if (Test-Path "backend\venv\Scripts\Activate.ps1") {
        try {
            # Activate virtual environment and test imports
            $env:VIRTUAL_ENV = "backend\venv"
            $env:PATH = "backend\venv\Scripts;$env:PATH"
            
            # Test FastAPI import
            python -c "import fastapi; print('✅ FastAPI imported successfully')" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ FastAPI imported successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ FastAPI import failed" -ForegroundColor Red
                return $false
            }
            
            # Test settings import
            python -c "from app.core.config import settings; print('✅ Settings loaded successfully')" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Settings loaded successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ Settings import failed" -ForegroundColor Red
                return $false
            }
            
            return $true
        } catch {
            Write-Host "❌ Backend test failed: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Backend virtual environment not found" -ForegroundColor Red
        return $false
    }
}

# Function to test frontend
function Test-Frontend {
    Write-Host "Testing frontend..." -ForegroundColor Blue
    
    if (Test-Path "frontend\package.json") {
        try {
            # Test TypeScript compilation
            Set-Location frontend
            npm run type-check 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Frontend type check passed" -ForegroundColor Green
            } else {
                Write-Host "❌ Frontend type check failed" -ForegroundColor Red
                Set-Location ..
                return $false
            }
            Set-Location ..
            return $true
        } catch {
            Write-Host "❌ Frontend test failed: $($_.Exception.Message)" -ForegroundColor Red
            Set-Location ..
            return $false
        }
    } else {
        Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
        return $false
    }
}

# Function to test environment
function Test-Environment {
    Write-Host "Testing environment configuration..." -ForegroundColor Blue
    
    if (Test-Path ".env") {
        Write-Host "✅ Environment file exists" -ForegroundColor Green
        
        # Check for required variables
        $envContent = Get-Content ".env"
        $requiredVars = @(
            "OPENAI_API_KEY",
            "FIREBASE_API_KEY", 
            "STRIPE_SECRET_KEY",
            "PINECONE_API_KEY",
            "NEO4J_URI"
        )
        
        $missingVars = @()
        foreach ($var in $requiredVars) {
            if ($envContent -notmatch "^$var=") {
                $missingVars += $var
            }
        }
        
        if ($missingVars.Count -eq 0) {
            Write-Host "✅ All required environment variables found" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Yellow
        }
        
        return $true
    } else {
        Write-Host "❌ Environment file missing" -ForegroundColor Red
        return $false
    }
}

# Function to test databases
function Test-Databases {
    Write-Host "Testing database connections..." -ForegroundColor Blue
    
    $allGood = $true
    
    # Test Redis
    try {
        $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet
        if ($redisTest) {
            Write-Host "✅ Redis is running on localhost:6379" -ForegroundColor Green
        } else {
            Write-Host "❌ Redis not running on localhost:6379" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ Redis not running on localhost:6379" -ForegroundColor Red
        $allGood = $false
    }
    
    # Test Neo4j
    try {
        $neo4jTest = Test-NetConnection -ComputerName localhost -Port 7687 -InformationLevel Quiet
        if ($neo4jTest) {
            Write-Host "✅ Neo4j is running on localhost:7687" -ForegroundColor Green
        } else {
            Write-Host "❌ Neo4j not running on localhost:7687" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ Neo4j not running on localhost:7687" -ForegroundColor Red
        $allGood = $false
    }
    
    return $allGood
}

# Function to test dependencies
function Test-Dependencies {
    Write-Host "Testing dependencies..." -ForegroundColor Blue
    
    $allGood = $true
    
    # Test Python
    try {
        $pythonVersion = python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Python not found" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ Python not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Test Node.js
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Node.js not found" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Test npm
    try {
        $npmVersion = npm --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ npm not found" -ForegroundColor Red
            $allGood = $false
        }
    } catch {
        Write-Host "❌ npm not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Test Docker (optional)
    try {
        $dockerVersion = docker --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Docker not found (optional)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Docker not found (optional)" -ForegroundColor Yellow
    }
    
    return $allGood
}

# Function to test file structure
function Test-FileStructure {
    Write-Host "Testing file structure..." -ForegroundColor Blue
    
    $requiredDirs = @("backend", "frontend", "mobile", "chrome-ext")
    $requiredFiles = @("README.md", "env-template.txt", "docker-compose.yml")
    
    $allGood = $true
    
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Host "✅ Directory: $dir" -ForegroundColor Green
        } else {
            Write-Host "❌ Directory missing: $dir" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "✅ File: $file" -ForegroundColor Green
        } else {
            Write-Host "❌ File missing: $file" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    return $allGood
}

# Main execution
try {
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "YTS by AI - Setup Test Results" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    
    $tests = @{
        "Dependencies" = Test-Dependencies
        "File Structure" = Test-FileStructure
        "Environment" = Test-Environment
        "Backend" = Test-Backend
        "Frontend" = Test-Frontend
        "Databases" = Test-Databases
    }
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Test Summary" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    
    $passedTests = 0
    $totalTests = $tests.Count
    
    foreach ($test in $tests.GetEnumerator()) {
        if ($test.Value) {
            Write-Host "✅ $($test.Key): PASSED" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "❌ $($test.Key): FAILED" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Results: $passedTests/$totalTests tests passed" -ForegroundColor Cyan
    
    if ($passedTests -eq $totalTests) {
        Write-Host "🎉 All tests passed! Your setup is ready." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Start development: .\superDev.ps1" -ForegroundColor White
        Write-Host "2. Access frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "3. Access backend: http://localhost:8000" -ForegroundColor White
    } else {
        Write-Host "⚠️  Some tests failed. Please fix the issues above." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Common fixes:" -ForegroundColor Yellow
        Write-Host "1. Run setup: .\setup-complete.sh" -ForegroundColor White
        Write-Host "2. Start databases: docker-compose up -d" -ForegroundColor White
        Write-Host "3. Check environment variables in .env" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 
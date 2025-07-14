# Check if required tools are installed (approved verb + better exit handling)
function Test-DeploymentTools {
    Write-Status "Checking deployment tools..."

    $tools = @('git', 'node', 'python', 'npm', 'yarn')
    $missingTools = @()

    foreach ($tool in $tools) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            $missingTools += $tool
        }
    }

    if ($missingTools.Count -eq 0) {
        Write-Success "✅ All required deployment tools are available."
        return $true
    } else {
        Write-Error "❌ Missing Tools: $($missingTools -join ', ')"
        Write-Host "Please install the missing tools and try again." -ForegroundColor Yellow
        return $false
    }
}

# Main deployment function with controlled exit on missing tools
function Main {
    Write-Status "Starting YTS by AI deployment..."

    try {
        if (-not (Test-DeploymentTools)) {
            throw "Required deployment tools missing. Fix and rerun."
        }

        Set-EnvironmentVariables

        Write-Host ""
        Write-Status "Deploying components..."

        Start-BackendDeployment
        Start-FrontendDeployment
        Start-MobileDeployment
        New-ChromeExtensionPackage

        Write-Host ""
        Write-Success "🎉 Deployment process completed!"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update environment variables with production values" -ForegroundColor White
        Write-Host "2. Deploy backend to Render" -ForegroundColor White
        Write-Host "3. Deploy frontend to Vercel" -ForegroundColor White
        Write-Host "4. Build and submit mobile app to stores" -ForegroundColor White
        Write-Host "5. Submit Chrome extension to Web Store" -ForegroundColor White
        Write-Host ""
        Write-Host "Production URLs will be:" -ForegroundColor Yellow
        Write-Host "- Frontend: https://ytsbyai.vercel.app" -ForegroundColor White
        Write-Host "- Backend: https://your-backend-url.onrender.com" -ForegroundColor White
        Write-Host "- Mobile: Available on App Store & Google Play" -ForegroundColor White
        Write-Host "- Chrome Extension: Available on Chrome Web Store" -ForegroundColor White
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main

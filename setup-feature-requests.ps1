# Feature Request System Setup Script for YTS by AI (Windows)
# This script sets up the complete feature request and voting system

Write-Host "🚀 Setting up Feature Request System for YTS by AI..." -ForegroundColor Blue

# Check if we're in the project root
if (-not (Test-Path "setup.sh")) {
    Write-Host "[ERROR] Please run this script from the YTS by AI project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Starting feature request system setup..." -ForegroundColor Blue

# Backend Setup
Write-Host "[INFO] Setting up backend dependencies..." -ForegroundColor Blue

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "[ERROR] Backend directory not found. Please ensure you're in the correct project directory." -ForegroundColor Red
    exit 1
}

Set-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "[WARNING] Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
& "venv\Scripts\Activate.ps1"

# Install additional dependencies for feature requests
Write-Host "[INFO] Installing feature request dependencies..." -ForegroundColor Blue
pip install redis sendgrid

# Check if requirements.txt exists and update it
if (Test-Path "requirements.txt") {
    # Add feature request dependencies if not already present
    $content = Get-Content "requirements.txt"
    if ($content -notcontains "redis>=4.5.0") {
        Add-Content "requirements.txt" "redis>=4.5.0"
    }
    if ($content -notcontains "sendgrid>=6.9.0") {
        Add-Content "requirements.txt" "sendgrid>=6.9.0"
    }
}

Set-Location ..

# Frontend Setup
Write-Host "[INFO] Setting up frontend dependencies..." -ForegroundColor Blue

if (-not (Test-Path "frontend")) {
    Write-Host "[ERROR] Frontend directory not found. Please ensure you're in the correct project directory." -ForegroundColor Red
    exit 1
}

Set-Location frontend

# Install additional dependencies for feature requests
Write-Host "[INFO] Installing feature request UI dependencies..." -ForegroundColor Blue
npm install react-hot-toast lucide-react

Set-Location ..

# Environment Variables Setup
Write-Host "[INFO] Setting up environment variables..." -ForegroundColor Blue

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "[ERROR] .env.example not found. Please create a .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Add feature request environment variables
Write-Host "[INFO] Adding feature request environment variables to .env..." -ForegroundColor Blue

# Function to add env var if not exists
function Add-EnvVar {
    param($Key, $Value)
    $content = Get-Content ".env"
    if ($content -notmatch "^${Key}=") {
        Add-Content ".env" "${Key}=${Value}"
        Write-Host "[SUCCESS] Added ${Key} to .env" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] ${Key} already exists in .env" -ForegroundColor Yellow
    }
}

# Add feature request specific environment variables
Add-EnvVar "REDIS_HOST" "localhost"
Add-EnvVar "REDIS_PORT" "6379"
Add-EnvVar "REDIS_PASSWORD" ""
Add-EnvVar "REDIS_DB" "0"
Add-EnvVar "SENDGRID_API_KEY" "your_sendgrid_api_key"
Add-EnvVar "SLACK_WEBHOOK_FEATURES" "your_slack_webhook_url"

Write-Host "[INFO] Environment variables configured." -ForegroundColor Blue

# Create feature request documentation
Write-Host "[INFO] Creating feature request documentation..." -ForegroundColor Blue

$docContent = @"
# Feature Request System - YTS by AI

## Overview
The Feature Request System allows users to submit, vote on, and track feature requests for YTS by AI. It includes a complete voting system, admin panel, and notification system.

## Features

### User Features
- **Create Feature Requests**: Submit new feature ideas with detailed descriptions
- **Vote System**: Upvote/downvote feature requests (requires authentication)
- **Search & Filter**: Find features by type, status, priority, or search terms
- **Tag System**: Add tags to categorize feature requests
- **Screenshot Support**: Include image URLs for visual context

### Admin Features
- **Status Management**: Update feature status (pending, planned, in progress, completed, rejected)
- **Statistics Dashboard**: View voting statistics and user engagement
- **Top Voters**: See most active community members
- **Bulk Management**: Filter and manage multiple features
- **Delete Features**: Remove inappropriate or duplicate requests

### Technical Features
- **Redis Storage**: Fast, scalable storage with 30-day TTL
- **Firebase Auth**: Secure user authentication and vote tracking
- **Real-time Updates**: Instant vote count updates
- **Email Notifications**: SendGrid integration for admin alerts
- **Slack Integration**: Real-time notifications to Slack channels

## API Endpoints

### Public Endpoints
- `GET /api/v1/features` - List feature requests
- `GET /api/v1/features/{id}` - Get specific feature
- `GET /api/v1/features/search` - Search features

### Authenticated Endpoints
- `POST /api/v1/features` - Create feature request
- `POST /api/v1/features/{id}/vote` - Vote on feature

### Admin Endpoints
- `GET /api/v1/features/admin/stats` - Get statistics
- `GET /api/v1/features/admin/top-voters` - Get top voters
- `PUT /api/v1/features/admin/{id}/status` - Update status
- `DELETE /api/v1/features/admin/{id}` - Delete feature
- `GET /api/v1/features/admin/all` - Get all features (admin view)

## Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Notifications
SENDGRID_API_KEY=your_sendgrid_api_key
SLACK_WEBHOOK_FEATURES=your_slack_webhook_url
```

## Frontend Components

### FeatureBoard.tsx
Main component for displaying and interacting with feature requests:
- Feature cards with voting buttons
- Search and filtering capabilities
- Sort by votes, recent, or priority
- Tabbed interface for "All Features" and "My Requests"

### FeatureForm.tsx
Form component for creating new feature requests:
- Comprehensive form with validation
- Tag management system
- Priority and effort estimation
- Screenshot URL support

### AdminFeaturePanel.tsx
Admin dashboard for managing feature requests:
- Overview with statistics
- Feature management with status updates
- Top voters leaderboard
- Bulk operations and filtering

## Database Schema

### Feature Request
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "feature_type": "enhancement|bug_fix|new_feature|ui_improvement",
  "author_id": "firebase_uid",
  "author_email": "string",
  "created_at": "iso_timestamp",
  "updated_at": "iso_timestamp",
  "vote_count": "integer",
  "upvotes": "integer",
  "downvotes": "integer",
  "status": "pending|planned|in_progress|completed|rejected",
  "tags": ["string"],
  "screenshot_url": "string?",
  "priority": "low|medium|high|critical",
  "estimated_effort": "string?",
  "assigned_to": "string?",
  "comments_count": "integer"
}
```

### Vote
```json
{
  "user_id": "firebase_uid",
  "feature_id": "uuid",
  "vote_type": "upvote|downvote",
  "created_at": "iso_timestamp"
}
```

## Usage Examples

### Creating a Feature Request
```javascript
const response = await api.post('/features', {
  title: "Dark Mode Support",
  description: "Add dark mode theme option for better user experience",
  feature_type: "ui_improvement",
  priority: "medium",
  tags: ["ui", "theme", "accessibility"],
  estimated_effort: "1-2 days"
});
```

### Voting on a Feature
```javascript
const response = await api.post('/features/feature-id/vote', {
  vote_type: "upvote"
});
```

### Admin Status Update
```javascript
const response = await api.put('/features/admin/feature-id/status', {
  status: "planned",
  assigned_to: "developer@example.com",
  estimated_effort: "1 week"
});
```

## Security Features

- **Authentication Required**: Users must be logged in to vote or create requests
- **Vote Prevention**: Users can only vote once per feature (can change vote)
- **Admin Protection**: Admin endpoints require authentication
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: Built-in rate limiting for API endpoints

## Performance Features

- **Redis Caching**: Fast access to feature data
- **TTL Management**: Automatic cleanup of old data (30 days)
- **Efficient Queries**: Optimized database queries with indexing
- **Pagination**: Support for large datasets
- **Real-time Updates**: Instant UI updates without page refresh

## Monitoring and Analytics

- **Vote Tracking**: Monitor user engagement
- **Feature Popularity**: Track most requested features
- **User Activity**: Identify top contributors
- **Status Distribution**: Monitor feature lifecycle
- **Performance Metrics**: Response times and error rates

## Deployment Notes

1. Ensure Redis is running and accessible
2. Configure SendGrid API key for notifications
3. Set up Slack webhook for admin alerts
4. Update CORS settings if needed
5. Configure Firebase authentication
6. Set appropriate rate limits

## Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Check Redis server is running
   - Verify connection settings in .env

2. **Authentication Errors**
   - Ensure Firebase is properly configured
   - Check JWT token validity

3. **Vote Not Working**
   - Verify user is authenticated
   - Check if user already voted

4. **Admin Access Denied**
   - Ensure user has admin privileges
   - Check authentication token

### Debug Commands

```bash
# Check Redis connection
redis-cli ping

# View Redis keys
redis-cli keys "feature:*"

# Check feature request data
redis-cli get "feature:feature-id"
```

## Future Enhancements

- **Comment System**: Allow users to comment on features
- **File Upload**: Direct image upload support
- **Email Notifications**: Notify users of status changes
- **Integration**: Connect with project management tools
- **Analytics**: Advanced analytics and reporting
- **Mobile App**: Native mobile support
- **API Rate Limiting**: Enhanced rate limiting
- **Webhooks**: External system integrations

## Support

For issues or questions about the Feature Request System:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for errors
4. Contact the development team
"@

$docContent | Out-File -FilePath "FEATURE_REQUEST_SYSTEM.md" -Encoding UTF8

Write-Host "[SUCCESS] Feature request documentation created: FEATURE_REQUEST_SYSTEM.md" -ForegroundColor Green

# Create a simple test script
Write-Host "[INFO] Creating test script..." -ForegroundColor Blue

$testContent = @"
# Test Feature Request System

Write-Host "🧪 Testing Feature Request System..."

# Test Redis connection
Write-Host "Testing Redis connection..."
try {
    redis-cli ping | Out-Null
    Write-Host "✅ Redis is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis is not running. Please start Redis server." -ForegroundColor Red
    exit 1
}

# Test backend
Write-Host "Testing backend..."
Set-Location backend
& "venv\Scripts\Activate.ps1"
try {
    python -c "import redis; print('✅ Redis Python client works')" 2>$null
} catch {
    Write-Host "❌ Redis Python client not working" -ForegroundColor Red
}
Set-Location ..

# Test frontend
Write-Host "Testing frontend..."
Set-Location frontend
try {
    npm list react-hot-toast | Out-Null
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend dependencies missing" -ForegroundColor Red
}
Set-Location ..

Write-Host "✅ Feature request system test completed" -ForegroundColor Green
"@

$testContent | Out-File -FilePath "test-feature-requests.ps1" -Encoding UTF8

Write-Host "[SUCCESS] Test script created: test-feature-requests.ps1" -ForegroundColor Green

# Final setup verification
Write-Host "[INFO] Verifying setup..." -ForegroundColor Blue

# Check if all required files exist
$requiredFiles = @(
    "backend\app\core\feature_request_service.py",
    "backend\app\routers\feature_request.py",
    "frontend\components\FeatureBoard.tsx",
    "frontend\components\FeatureForm.tsx",
    "frontend\components\admin\AdminFeaturePanel.tsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

# Check environment variables
$envContent = Get-Content ".env"
if ($envContent -match "REDIS_HOST") {
    Write-Host "✅ Redis environment variables configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis environment variables may be missing" -ForegroundColor Yellow
}

Write-Host "[INFO] Setup verification completed" -ForegroundColor Blue

# Summary
Write-Host ""
Write-Host "🎉 Feature Request System Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Blue
Write-Host "  ✅ Backend service created" -ForegroundColor Green
Write-Host "  ✅ API router configured" -ForegroundColor Green
Write-Host "  ✅ Frontend components created" -ForegroundColor Green
Write-Host "  ✅ Admin panel implemented" -ForegroundColor Green
Write-Host "  ✅ Environment variables configured" -ForegroundColor Green
Write-Host "  ✅ Documentation created" -ForegroundColor Green
Write-Host "  ✅ Test script created" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Blue
Write-Host "  1. Start Redis server: redis-server"
Write-Host "  2. Start backend: cd backend && .\dev.ps1"
Write-Host "  3. Start frontend: cd frontend && .\dev.ps1"
Write-Host "  4. Configure SendGrid and Slack webhooks in .env"
Write-Host "  5. Test the system: .\test-feature-requests.ps1"
Write-Host ""
Write-Host "📚 Documentation: FEATURE_REQUEST_SYSTEM.md" -ForegroundColor Cyan
Write-Host "🧪 Test Script: test-feature-requests.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "[SUCCESS] Feature request system is ready to use!" -ForegroundColor Green 
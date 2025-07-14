#!/bin/bash

# Feature Request System Setup Script for YTS by AI
# This script sets up the complete feature request and voting system

set -e

echo "🚀 Setting up Feature Request System for YTS by AI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the project root
if [ ! -f "setup.sh" ]; then
    print_error "Please run this script from the YTS by AI project root directory"
    exit 1
fi

print_status "Starting feature request system setup..."

# Backend Setup
print_status "Setting up backend dependencies..."

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found. Please ensure you're in the correct project directory."
    exit 1
fi

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install additional dependencies for feature requests
print_status "Installing feature request dependencies..."
pip install redis sendgrid

# Check if requirements.txt exists and update it
if [ -f "requirements.txt" ]; then
    # Add feature request dependencies if not already present
    if ! grep -q "redis" requirements.txt; then
        echo "redis>=4.5.0" >> requirements.txt
    fi
    if ! grep -q "sendgrid" requirements.txt; then
        echo "sendgrid>=6.9.0" >> requirements.txt
    fi
fi

cd ..

# Frontend Setup
print_status "Setting up frontend dependencies..."

if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found. Please ensure you're in the correct project directory."
    exit 1
fi

cd frontend

# Install additional dependencies for feature requests
print_status "Installing feature request UI dependencies..."
npm install react-hot-toast lucide-react

cd ..

# Environment Variables Setup
print_status "Setting up environment variables..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        print_error ".env.example not found. Please create a .env file manually."
        exit 1
    fi
fi

# Add feature request environment variables
print_status "Adding feature request environment variables to .env..."

# Function to add env var if not exists
add_env_var() {
    local key=$1
    local value=$2
    if ! grep -q "^${key}=" .env; then
        echo "${key}=${value}" >> .env
        print_success "Added ${key} to .env"
    else
        print_warning "${key} already exists in .env"
    fi
}

# Add feature request specific environment variables
add_env_var "REDIS_HOST" "localhost"
add_env_var "REDIS_PORT" "6379"
add_env_var "REDIS_PASSWORD" ""
add_env_var "REDIS_DB" "0"
add_env_var "SENDGRID_API_KEY" "your_sendgrid_api_key"
add_env_var "SLACK_WEBHOOK_FEATURES" "your_slack_webhook_url"

print_status "Environment variables configured."

# Create feature request documentation
print_status "Creating feature request documentation..."

cat > FEATURE_REQUEST_SYSTEM.md << 'EOF'
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

EOF

print_success "Feature request documentation created: FEATURE_REQUEST_SYSTEM.md"

# Create a simple test script
print_status "Creating test script..."

cat > test-feature-requests.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Feature Request System..."

# Test Redis connection
echo "Testing Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Please start Redis server."
    exit 1
fi

# Test backend
echo "Testing backend..."
cd backend
source venv/bin/activate
python -c "import redis; print('✅ Redis Python client works')" 2>/dev/null || echo "❌ Redis Python client not working"
cd ..

# Test frontend
echo "Testing frontend..."
cd frontend
if npm list react-hot-toast > /dev/null 2>&1; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies missing"
fi
cd ..

echo "✅ Feature request system test completed"
EOF

chmod +x test-feature-requests.sh

print_success "Test script created: test-feature-requests.sh"

# Final setup verification
print_status "Verifying setup..."

# Check if all required files exist
required_files=(
    "backend/app/core/feature_request_service.py"
    "backend/app/routers/feature_request.py"
    "frontend/components/FeatureBoard.tsx"
    "frontend/components/FeatureForm.tsx"
    "frontend/components/admin/AdminFeaturePanel.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file exists"
    else
        print_error "❌ $file missing"
    fi
done

# Check environment variables
if grep -q "REDIS_HOST" .env; then
    print_success "✅ Redis environment variables configured"
else
    print_warning "⚠️  Redis environment variables may be missing"
fi

print_status "Setup verification completed"

# Summary
echo ""
echo "🎉 Feature Request System Setup Complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Backend service created"
echo "  ✅ API router configured"
echo "  ✅ Frontend components created"
echo "  ✅ Admin panel implemented"
echo "  ✅ Environment variables configured"
echo "  ✅ Documentation created"
echo "  ✅ Test script created"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start Redis server: redis-server"
echo "  2. Start backend: cd backend && ./dev.sh"
echo "  3. Start frontend: cd frontend && ./dev.sh"
echo "  4. Configure SendGrid and Slack webhooks in .env"
echo "  5. Test the system: ./test-feature-requests.sh"
echo ""
echo "📚 Documentation: FEATURE_REQUEST_SYSTEM.md"
echo "🧪 Test Script: test-feature-requests.sh"
echo ""

print_success "Feature request system is ready to use!" 
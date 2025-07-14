# Smart Notifications and Alerts System

A comprehensive real-time alerts system for the YTS by AI Admin Dashboard with email notifications, Slack integration, and beautiful frontend components.

## 🏗️ Architecture

### Backend Components

1. **Alerts Service** (`backend/app/core/alerts_service.py`)
   - Redis-based alert storage with auto-expiration
   - SendGrid email integration
   - Slack webhook support
   - Threshold monitoring and automatic alert generation
   - HTML email templates with color coding

2. **Alerts Router** (`backend/app/routers/alerts.py`)
   - Protected endpoints with rate limiting
   - CRUD operations for alerts
   - Test alert functionality
   - Alert statistics and management

### Frontend Components

1. **Admin Alert Banner** (`frontend/components/admin/AdminAlertBanner.tsx`)
   - Real-time alert display with auto-refresh
   - Color-coded alert levels (success, warning, danger, info)
   - Dismiss functionality
   - Test alert creation
   - Beautiful responsive design

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Install additional dependencies
cd backend
pip install httpx

# Set environment variables
cp .env.example .env
```

Add to `.env`:
```env
# Alert System Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=alerts@ytsbyai.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. Frontend Setup

```bash
# Dependencies are already included in package.json
cd frontend
npm install
```

### 3. SendGrid Configuration

1. **Create SendGrid Account** at [sendgrid.com](https://sendgrid.com)
2. **Generate API Key** in SendGrid Dashboard
3. **Verify Sender Email** (alerts@ytsbyai.com)
4. **Add to environment variables**

### 4. Slack Integration (Optional)

1. **Create Slack App** in your workspace
2. **Add Incoming Webhooks** integration
3. **Copy webhook URL** to environment variables

## 📊 API Endpoints

### Protected Alert Endpoints

All endpoints require Firebase authentication and admin privileges:

```typescript
// Headers required for all alert requests
{
  'Authorization': 'Bearer <firebase_id_token>',
  'Content-Type': 'application/json'
}
```

#### GET `/api/v1/admin/alerts`
Returns all active alerts:

```json
{
  "alerts": [
    {
      "id": "high_usage_20240101_120000",
      "alert_type": "high_usage",
      "level": "warning",
      "title": "High Demo Portal Usage",
      "message": "Active sessions (150) exceeded threshold of 100 per hour",
      "data": {
        "active_sessions": 150,
        "threshold": 100
      },
      "created_at": "2024-01-01T12:00:00Z",
      "expires_at": "2024-01-02T12:00:00Z",
      "is_dismissed": false
    }
  ],
  "total_count": 5,
  "active_count": 3
}
```

#### POST `/api/v1/admin/alerts/test`
Creates a test alert:

```json
{
  "success": true,
  "alert": {
    "id": "system_error_20240101_120000",
    "alert_type": "system_error",
    "level": "info",
    "title": "Test Alert",
    "message": "This is a test alert to verify the notification system is working correctly.",
    "data": {
      "test": true,
      "timestamp": "2024-01-01T12:00:00Z"
    },
    "created_at": "2024-01-01T12:00:00Z",
    "expires_at": "2024-01-02T12:00:00Z",
    "is_dismissed": false
  },
  "message": "Test alert created successfully"
}
```

#### DELETE `/api/v1/admin/alerts/{alert_id}`
Dismisses an alert:

```json
{
  "success": true,
  "message": "Alert dismissed successfully"
}
```

#### POST `/api/v1/admin/alerts/clear-expired`
Clears expired alerts:

```json
{
  "success": true,
  "message": "Cleared 3 expired alerts",
  "cleared_count": 3
}
```

#### GET `/api/v1/admin/alerts/stats`
Returns alert statistics:

```json
{
  "total_alerts": 10,
  "active_alerts": 7,
  "dismissed_alerts": 3,
  "level_distribution": {
    "warning": 4,
    "danger": 2,
    "info": 1
  },
  "type_distribution": {
    "high_usage": 3,
    "quota_abuse": 2,
    "conversion_spike": 1,
    "system_error": 1
  }
}
```

## 🎨 Frontend Features

### Alert Banner Component
- **Real-time Updates** with 2-minute auto-refresh
- **Color-coded Levels**:
  - 🟢 Success (green)
  - 🟡 Warning (yellow)
  - 🔴 Danger (red)
  - 🔵 Info (blue)
- **Dismiss Functionality** with one-click removal
- **Test Alert Button** for system verification
- **Responsive Design** for all devices

### Alert Types
- **High Usage** - When sessions exceed thresholds
- **Quota Abuse** - When users exceed usage limits
- **Conversion Spike** - When conversions increase rapidly
- **System Error** - For system issues and tests
- **Security Threat** - For security-related alerts
- **Performance Issue** - For performance problems

### Alert Levels
- **Success** - Positive events (conversions, etc.)
- **Warning** - Attention needed but not critical
- **Danger** - Critical issues requiring immediate action
- **Info** - Informational messages

## 🔒 Security Features

### Authentication
- **Firebase Admin SDK** for secure token verification
- **Admin-only access** with email whitelist
- **Rate limiting** on all endpoints

### Data Protection
- **Alert expiration** after 24 hours
- **No sensitive data** in alert messages
- **Secure email delivery** via SendGrid
- **Encrypted webhook** for Slack integration

## 📧 Email Notifications

### SendGrid Integration
- **Professional HTML templates** with color coding
- **Responsive design** for all email clients
- **Action buttons** linking to admin dashboard
- **Detailed alert information** with timestamps

### Email Template Features
- **Color-coded headers** based on alert level
- **Alert details** with type, level, and timestamp
- **Action required** section with dashboard link
- **Professional branding** with YTS by AI styling

## 🔔 Slack Integration

### Webhook Configuration
- **Real-time notifications** to Slack channels
- **Emoji indicators** for different alert levels
- **Rich message formatting** with attachments
- **Channel-specific** alert routing

### Slack Message Format
```
🚨 High Demo Portal Usage
Active sessions (150) exceeded threshold of 100 per hour
Type: high_usage | Time: 12:00:00 UTC
```

## ⚙️ Configuration

### Threshold Settings
Configure in `backend/app/core/alerts_service.py`:

```python
self.thresholds = {
    "high_usage": {
        "sessions_per_hour": 100,
        "conversions_per_minute": 10,
        "quota_exceeded_per_hour": 50
    },
    "quota_abuse": {
        "summary_quota_exceeded": 80,
        "transcription_quota_exceeded": 60
    },
    "security": {
        "failed_auth_attempts": 20,
        "suspicious_ips": 5
    }
}
```

### Environment Variables
```env
# Required
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=alerts@ytsbyai.com

# Optional
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Auto-refresh Settings
Configure in `frontend/components/admin/AdminAlertBanner.tsx`:

```typescript
// Auto-refresh every 2 minutes
const interval = setInterval(fetchAlerts, 2 * 60 * 1000);
```

## 🚀 Deployment

### Backend Deployment
```bash
# Render deployment
cd backend
render deploy

# Environment variables
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=alerts@ytsbyai.com
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### Frontend Deployment
```bash
# Vercel deployment
cd frontend
vercel --prod

# Environment variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

### Docker Deployment
```bash
# Build and run with docker-compose
docker-compose up -d

# Environment variables in docker-compose.yml
environment:
  - SENDGRID_API_KEY=${SENDGRID_API_KEY}
  - ALERT_EMAIL=${ALERT_EMAIL}
  - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
```

## 📈 Monitoring & Analytics

### Alert Tracking
- **Real-time monitoring** of demo portal usage
- **Automatic threshold detection** and alert generation
- **Email delivery tracking** via SendGrid
- **Slack message delivery** confirmation

### Performance Optimization
- **Redis caching** for fast alert retrieval
- **Auto-expiration** to prevent data bloat
- **Rate limiting** to prevent abuse
- **Parallel processing** for multiple notifications

### Error Handling
- **Graceful degradation** for missing services
- **Retry logic** for failed email sends
- **Comprehensive logging** for debugging
- **User-friendly error messages**

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/test_alerts.py
pytest tests/test_alerts_service.py
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:alerts
```

### Manual Testing
1. **Create test alert** via API endpoint
2. **Verify email delivery** in inbox
3. **Check Slack notification** in channel
4. **Test dismiss functionality** in UI
5. **Verify auto-refresh** behavior

## 🎯 Usage Examples

### Creating Custom Alerts
```python
# In your application code
from app.core.alerts_service import alerts_service, AlertType, AlertLevel

# Create a custom alert
await alerts_service.create_alert(
    AlertType.SYSTEM_ERROR,
    AlertLevel.WARNING,
    "Custom Alert Title",
    "This is a custom alert message",
    {"custom_data": "value"},
    send_email=True,
    send_slack=True
)
```

### Monitoring Usage Thresholds
```python
# Check demo stats and create alerts
demo_stats = await admin_analytics.get_demo_stats()
alerts = await alerts_service.check_usage_thresholds(demo_stats)

# Process any generated alerts
for alert in alerts:
    print(f"Alert created: {alert.title}")
```

### Frontend Integration
```typescript
// Fetch alerts in your component
const response = await fetch('/api/v1/admin/alerts', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
setAlerts(data.alerts);
```

## 🚨 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Verify SendGrid API key
   - Check sender email verification
   - Review SendGrid logs

2. **Slack Notifications Not Working**
   - Verify webhook URL
   - Check Slack app permissions
   - Test webhook manually

3. **Alerts Not Appearing**
   - Check Redis connection
   - Verify authentication
   - Review API responses

4. **Frontend Not Updating**
   - Check Firebase authentication
   - Verify API endpoint responses
   - Review browser console errors

### Debug Commands
```bash
# Check Redis alerts
redis-cli lrange admin:alerts 0 -1

# Test SendGrid API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"alerts@ytsbyai.com"},"content":[{"type":"text/plain","value":"Test"}]}'

# Test Slack webhook
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message"}'
```

## 📚 Additional Resources

- [SendGrid API Documentation](https://sendgrid.com/docs/api-reference/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Redis List Operations](https://redis.io/commands#list)
- [FastAPI Rate Limiting](https://fastapi.tiangolo.com/tutorial/security/)

---

**Production Ready**: This alerts system is fully production-ready with comprehensive monitoring, email notifications, Slack integration, and beautiful frontend components. 
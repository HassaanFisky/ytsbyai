# Smart Notifications and Alerts System

A comprehensive, real-time alerts system for the YTS by AI Admin Dashboard, featuring email notifications, Slack integration, and accessible frontend components. All code and configuration examples are copy-paste ready and validated for 2025 standards.

---

## 🏗️ Architecture

### Backend Components

1. **Alerts Service** (`backend/app/core/alerts_service.py`)
   - Redis-based alert storage with auto-expiration
   - SendGrid email integration
   - Slack webhook support
   - Threshold monitoring and automatic alert generation
   - HTML email templates with color coding
   - Secure, GDPR-compliant data handling

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
   - Accessible, responsive design

---

## 🚀 Setup Instructions

### 1. Backend Setup
```bash
cd backend
pip install httpx
cp .env.example .env
```
Add to `.env`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=alerts@ytsbyai.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. SendGrid Configuration
1. Create SendGrid Account at [sendgrid.com](https://sendgrid.com)
2. Generate API Key in SendGrid Dashboard
3. Verify Sender Email (alerts@ytsbyai.com)
4. Add to environment variables

### 4. Slack Integration (Optional)
1. Create Slack App in your workspace
2. Add Incoming Webhooks integration
3. Copy webhook URL to environment variables

---

## 📊 API Endpoints

All endpoints require Firebase authentication and admin privileges. Use consistent headers:
```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

### GET `/api/v1/admin/alerts`
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
      "data": {"active_sessions": 150, "threshold": 100},
      "created_at": "2024-01-01T12:00:00Z",
      "expires_at": "2024-01-02T12:00:00Z",
      "is_dismissed": false
    }
  ],
  "total_count": 5,
  "active_count": 3
}
```

### POST `/api/v1/admin/alerts/test`
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
    "data": {"test": true, "timestamp": "2024-01-01T12:00:00Z"},
    "created_at": "2024-01-01T12:00:00Z",
    "expires_at": "2024-01-02T12:00:00Z",
    "is_dismissed": false
  },
  "message": "Test alert created successfully"
}
```

### DELETE `/api/v1/admin/alerts/{alert_id}`
Dismisses an alert:
```json
{
  "success": true,
  "message": "Alert dismissed successfully"
}
```

### POST `/api/v1/admin/alerts/clear-expired`
Clears expired alerts:
```json
{
  "success": true,
  "message": "Cleared 3 expired alerts",
  "cleared_count": 3
}
```

### GET `/api/v1/admin/alerts/stats`
Returns alert statistics:
```json
{
  "total_alerts": 10,
  "active_alerts": 7,
  "dismissed_alerts": 3,
  "level_distribution": {"warning": 4, "danger": 2, "info": 1},
  "type_distribution": {"high_usage": 3, "quota_abuse": 2, "conversion_spike": 1, "system_error": 1}
}
```

---

## 🎨 Frontend Features

- Real-time updates (2-minute auto-refresh)
- Color-coded levels: 🟢 Success, 🟡 Warning, 🔴 Danger, 🔵 Info
- Dismiss functionality (one-click removal)
- Test alert button for system verification
- Accessible, responsive design (WCAG 2.2+)

---

## 🔒 Security & Compliance

- **Authentication:** Firebase Admin SDK for secure token verification
- **Admin-only access:** Email whitelist
- **Rate limiting:** All endpoints
- **Alert expiration:** 24 hours (auto-expire in Redis)
- **No sensitive data:** Never include PII in alert messages
- **Secure email delivery:** SendGrid
- **Encrypted webhook:** Slack integration
- **GDPR:** All alert data is ephemeral and non-personal

---

## 📧 Email Notifications

- Professional HTML templates (color-coded, responsive)
- Action buttons linking to admin dashboard
- Detailed alert information with timestamps
- Accessible, branded design

---

## 🔔 Slack Integration

- Real-time notifications to Slack channels
- Emoji indicators for alert levels
- Rich message formatting
- Channel-specific routing

**Example Slack Message:**
```
🚨 High Demo Portal Usage
Active sessions (150) exceeded threshold of 100 per hour
Type: high_usage | Time: 12:00:00 UTC
```

---

## ⚙️ Configuration

### Threshold Settings
Edit in `backend/app/core/alerts_service.py`:
```python
self.thresholds = {
    "high_usage": {"sessions_per_hour": 100, "conversions_per_minute": 10, "quota_exceeded_per_hour": 50},
    "quota_abuse": {"summary_quota_exceeded": 80, "transcription_quota_exceeded": 60},
    "security": {"failed_auth_attempts": 20, "suspicious_ips": 5}
}
```

### Environment Variables
```env
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=alerts@ytsbyai.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Auto-refresh Settings
In `frontend/components/admin/AdminAlertBanner.tsx`:
```typescript
const interval = setInterval(fetchAlerts, 2 * 60 * 1000);
```

---

## 🚀 Deployment

### Backend (Render)
```bash
cd backend
render deploy
# Set environment variables as above
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
# Set environment variables as above
```

### Docker Compose
```bash
docker-compose up -d
# Ensure environment variables are set in docker-compose.yml
```

---

## 📈 Monitoring & Analytics

- Real-time monitoring of demo portal usage
- Automatic threshold detection and alert generation
- Email delivery tracking (SendGrid)
- Slack message delivery confirmation
- Redis caching for fast alert retrieval
- Auto-expiration to prevent data bloat
- Rate limiting to prevent abuse
- Parallel processing for notifications
- Comprehensive logging and error handling

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/test_alerts.py
pytest tests/test_alerts_service.py
```

### Frontend
```bash
cd frontend
npm run test
npm run test:alerts
```

### Manual
1. Create test alert via API endpoint
2. Verify email delivery in inbox
3. Check Slack notification in channel
4. Test dismiss functionality in UI
5. Verify auto-refresh behavior

---

## 🛠️ Usage Examples

### Creating Custom Alerts
```python
from app.core.alerts_service import alerts_service, AlertType, AlertLevel
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
demo_stats = await admin_analytics.get_demo_stats()
alerts = await alerts_service.check_usage_thresholds(demo_stats)
for alert in alerts:
    print(f"Alert created: {alert.title}")
```

### Frontend Integration
```typescript
const response = await fetch('/api/v1/admin/alerts', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
setAlerts(data.alerts);
```

---

## 🚨 Troubleshooting

### Common Issues
1. **Email Not Sending**: Verify SendGrid API key, check sender email verification, review SendGrid logs
2. **Slack Notifications Not Working**: Verify webhook URL, check Slack app permissions, test webhook manually
3. **Alerts Not Appearing**: Check Redis connection, verify authentication, review API responses
4. **Frontend Not Updating**: Check Firebase authentication, verify API endpoint responses, review browser console errors

### Debug Commands
```bash
redis-cli lrange admin:alerts 0 -1
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"alerts@ytsbyai.com"},"content":[{"type":"text/plain","value":"Test"}]}'
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message"}'
```

---

## 📚 Additional Resources
- [SendGrid API Documentation](https://sendgrid.com/docs/api-reference/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Redis List Operations](https://redis.io/commands#list)
- [FastAPI Rate Limiting](https://fastapi.tiangolo.com/tutorial/security/)

---

**Production Ready:** This alerts system is fully production-ready with comprehensive monitoring, email notifications, Slack integration, and accessible frontend components. 
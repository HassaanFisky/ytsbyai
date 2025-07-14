# Feedback and Bug Report System

A comprehensive feedback and bug report system for YTS by AI with Firebase auth, Slack/email notifications, and beautiful frontend components.

## 🏗️ Architecture

### Backend Components

1. **Feedback Service** (`backend/app/core/feedback_service.py`)
   - Redis-based feedback storage with 30-day expiration
   - SendGrid email integration with HTML templates
   - Slack webhook support with emoji indicators
   - Firebase auth integration (optional user email/UID)
   - Anonymous feedback support for public users

2. **Feedback Router** (`backend/app/routers/feedback.py`)
   - Public endpoint for creating feedback
   - Admin-only endpoints for management
   - Rate limiting and validation
   - Status management and filtering

### Frontend Components

1. **Feedback Form** (`frontend/components/FeedbackForm.tsx`)
   - Modal popup with beautiful UI
   - Form validation and submission
   - Type selection (bug, idea, issue, feature, general)
   - Optional email collection
   - Auto-reset and confirmation

2. **Admin Feedback Panel** (`frontend/components/admin/AdminFeedbackPanel.tsx`)
   - Comprehensive feedback management
   - Filtering by type and status
   - Statistics and analytics
   - Action buttons (review, resolve, delete)

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Install dependencies
cd backend
pip install httpx

# Set environment variables
cp .env.example .env
```

Add to `.env`:
```env
# Feedback System Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FEEDBACK_ALERT_EMAIL=feedback@ytsbyai.com
SLACK_WEBHOOK_FEEDBACK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install @radix-ui/react-select @radix-ui/react-label
```

### 3. SendGrid Configuration

1. **Create SendGrid Account** at [sendgrid.com](https://sendgrid.com)
2. **Generate API Key** in SendGrid Dashboard
3. **Verify Sender Email** (feedback@ytsbyai.com)
4. **Add to environment variables**

### 4. Slack Integration (Optional)

1. **Create Slack App** in your workspace
2. **Add Incoming Webhooks** integration
3. **Copy webhook URL** to environment variables

## 📊 API Endpoints

### Public Endpoints

#### POST `/api/v1/feedback`
Create new feedback (rate limited: 10/minute):

```json
{
  "feedback_type": "bug",
  "message": "Video got stuck at 20s",
  "email": "user@example.com",
  "page_url": "https://ytsbyai.com/demo"
}
```

Response:
```json
{
  "id": "feedback_20240101_120000_123",
  "feedback_type": "bug",
  "message": "Video got stuck at 20s",
  "user_email": "user@example.com",
  "user_uid": null,
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1",
  "page_url": "https://ytsbyai.com/demo",
  "status": "new",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "is_anonymous": false
}
```

### Admin Endpoints (Protected)

#### GET `/api/v1/admin/feedback`
Get feedback list with filtering:

```json
{
  "feedback": [...],
  "total_count": 25,
  "stats": {
    "total_feedback": 25,
    "by_type": {
      "bug": 10,
      "idea": 8,
      "issue": 5,
      "feature": 2
    },
    "by_status": {
      "new": 15,
      "reviewing": 5,
      "resolved": 5
    },
    "recent_feedback": 8,
    "anonymous_feedback": 3
  }
}
```

#### DELETE `/api/v1/admin/feedback/{id}`
Delete feedback:

```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

#### PUT `/api/v1/admin/feedback/{id}/status`
Update feedback status:

```json
{
  "success": true,
  "message": "Status updated to reviewing"
}
```

#### GET `/api/v1/admin/feedback/stats`
Get feedback statistics:

```json
{
  "total_feedback": 25,
  "by_type": {
    "bug": 10,
    "idea": 8,
    "issue": 5,
    "feature": 2
  },
  "by_status": {
    "new": 15,
    "reviewing": 5,
    "resolved": 5
  },
  "recent_feedback": 8,
  "anonymous_feedback": 3
}
```

## 🎨 Frontend Features

### Feedback Form Component
- **Modal Popup** with backdrop
- **Type Selection** with icons:
  - 🐛 Bug Report (red)
  - ⚠️ Issue (yellow)
  - 💡 Feature Idea (green)
  - 🚀 Feature Request (blue)
  - 💬 General Feedback (gray)
- **Form Validation** with minimum character count
- **Auto-reset** after successful submission
- **Confirmation Toast** on submit
- **Responsive Design** for all devices

### Admin Feedback Panel
- **Real-time Updates** with auto-refresh
- **Type Filtering** (bug, idea, issue, feature, general)
- **Status Management** (new, reviewing, in_progress, resolved, closed)
- **Statistics Cards** with key metrics
- **Action Buttons** for review, resolve, delete
- **Message Truncation** with full view option
- **User Information** display (email, IP, page URL)

### Feedback Types
- **Bug Report** - Technical issues and errors
- **Issue** - Problems with functionality
- **Feature Idea** - Suggestions for improvements
- **Feature Request** - Specific feature requests
- **General Feedback** - General comments and feedback

### Feedback Statuses
- **New** - Just received
- **Reviewing** - Under review
- **In Progress** - Being worked on
- **Resolved** - Issue fixed
- **Closed** - No longer relevant

## 🔒 Security Features

### Authentication
- **Firebase Auth** for admin access
- **Anonymous feedback** allowed for public users
- **Rate limiting** on all endpoints
- **Input validation** and sanitization

### Data Protection
- **Feedback expiration** after 30 days
- **No sensitive data** in feedback messages
- **Secure email delivery** via SendGrid
- **Encrypted webhook** for Slack integration

## 📧 Email Notifications

### SendGrid Integration
- **Professional HTML templates** with color coding
- **Responsive design** for all email clients
- **Action buttons** linking to admin dashboard
- **Detailed feedback information** with timestamps

### Email Template Features
- **Color-coded headers** based on feedback type
- **Feedback details** with type, user, and timestamp
- **Action required** section with dashboard link
- **Professional branding** with YTS by AI styling

## 🔔 Slack Integration

### Webhook Configuration
- **Real-time notifications** to Slack channels
- **Emoji indicators** for different feedback types
- **Rich message formatting** with attachments
- **Channel-specific** feedback routing

### Slack Message Format
```
🐛 New BUG Feedback
Video got stuck at 20s
User: user@example.com | Time: 12:00:00 UTC
```

## ⚙️ Configuration

### Environment Variables
```env
# Required
SENDGRID_API_KEY=your_sendgrid_api_key
FEEDBACK_ALERT_EMAIL=feedback@ytsbyai.com

# Optional
SLACK_WEBHOOK_FEEDBACK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Rate Limiting
```python
# Public feedback creation
@limiter.limit("10/minute")

# Admin feedback management
@limiter.limit("30/minute")
```

### Feedback Storage
```python
# Redis configuration
feedback_key = "feedback:all"
expiration = 2592000  # 30 days
```

## 🚀 Deployment

### Backend Deployment
```bash
# Render deployment
cd backend
render deploy

# Environment variables
SENDGRID_API_KEY=your_sendgrid_api_key
FEEDBACK_ALERT_EMAIL=feedback@ytsbyai.com
SLACK_WEBHOOK_FEEDBACK=your_slack_webhook_url
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
  - FEEDBACK_ALERT_EMAIL=${FEEDBACK_ALERT_EMAIL}
  - SLACK_WEBHOOK_FEEDBACK=${SLACK_WEBHOOK_FEEDBACK}
```

## 📈 Monitoring & Analytics

### Feedback Tracking
- **Real-time monitoring** of feedback submissions
- **Type distribution** analytics
- **Status tracking** and workflow management
- **Email delivery tracking** via SendGrid
- **Slack message delivery** confirmation

### Performance Optimization
- **Redis caching** for fast feedback retrieval
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
pytest tests/test_feedback.py
pytest tests/test_feedback_service.py
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:feedback
```

### Manual Testing
1. **Create test feedback** via form
2. **Verify email delivery** in inbox
3. **Check Slack notification** in channel
4. **Test admin panel** functionality
5. **Verify status updates** and filtering

## 🎯 Usage Examples

### Adding Feedback Button to Components
```tsx
import FeedbackForm from '@/components/FeedbackForm';

const MyComponent = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowFeedback(true)}>
        💬 Feedback
      </Button>
      
      <FeedbackForm 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        pageUrl={window.location.href}
      />
    </div>
  );
};
```

### Creating Feedback Programmatically
```typescript
// Submit feedback from code
const response = await fetch('/api/v1/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    feedback_type: 'bug',
    message: 'Video playback issue',
    email: 'user@example.com',
    page_url: window.location.href
  })
});
```

### Admin Feedback Management
```typescript
// Get feedback in admin panel
const response = await fetch('/api/v1/admin/feedback', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
setFeedback(data.feedback);
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

3. **Feedback Not Appearing**
   - Check Redis connection
   - Verify authentication
   - Review API responses

4. **Frontend Not Updating**
   - Check Firebase authentication
   - Verify API endpoint responses
   - Review browser console errors

### Debug Commands
```bash
# Check Redis feedback
redis-cli lrange feedback:all 0 -1

# Test SendGrid API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"feedback@ytsbyai.com"},"content":[{"type":"text/plain","value":"Test"}]}'

# Test Slack webhook
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test feedback message"}'
```

## 📚 Additional Resources

- [SendGrid API Documentation](https://sendgrid.com/docs/api-reference/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Redis List Operations](https://redis.io/commands#list)
- [FastAPI Rate Limiting](https://fastapi.tiangolo.com/tutorial/security/)

---

**Production Ready**: This feedback system is fully production-ready with comprehensive monitoring, email notifications, Slack integration, and beautiful frontend components. 
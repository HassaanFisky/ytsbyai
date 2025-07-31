# Feedback and Bug Report System

A comprehensive, production-ready feedback and bug report system for YTS by AI, with Firebase Auth, Slack/email notifications, and accessible frontend components. All code/config examples are copy-paste ready and validated for 2025 standards.

---

## 🏗️ Architecture

### Backend
- **feedback_service.py:** Redis-based storage (30-day expiration, GDPR-compliant)
- **routers/feedback.py:** FastAPI router (public and admin endpoints)
- **SendGrid/Slack:** Email and webhook notifications
- **Firebase Auth:** Secure admin access, optional user email/UID
- **Anonymous Feedback:** Supported for public users

### Frontend
- **FeedbackForm.tsx:** Modal popup, validation, type selection, optional email
- **AdminFeedbackPanel.tsx:** Management, filtering, stats, actions
- **Accessibility:** WCAG 2.2+ compliance, keyboard navigation, ARIA labels

---

## 🚀 Setup Instructions

### Backend
```bash
cd backend
pip install httpx
cp .env.example .env
```
Add to `.env`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
FEEDBACK_ALERT_EMAIL=feedback@ytsbyai.com
SLACK_WEBHOOK_FEEDBACK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Frontend
```bash
cd frontend
npm install @radix-ui/react-select @radix-ui/react-label
```

---

## 📊 API Endpoints

All endpoints use `/api/v1/feedback` prefix. All responses are JSON. All code examples are copy-paste ready.

### Public
```http
POST /api/v1/feedback
Content-Type: application/json

{
  "feedback_type": "bug",
  "message": "Video got stuck at 20s",
  "email": "user@example.com",
  "page_url": "https://ytsbyai.com/demo"
}
```
**Response:**
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

### Admin (Protected)
```http
GET    /api/v1/admin/feedback           # List feedback (filtering)
DELETE /api/v1/admin/feedback/{id}      # Delete feedback
PUT    /api/v1/admin/feedback/{id}/status # Update status
GET    /api/v1/admin/feedback/stats     # Get statistics
```

---

## 🔒 Security & Accessibility

- **Authentication:** Firebase Auth for admin access
- **Anonymous Feedback:** Allowed for public users
- **Rate Limiting:** All endpoints
- **Input Validation:** Comprehensive validation/sanitization
- **Data Protection:** Feedback expires after 30 days, no sensitive data stored
- **GDPR:** All feedback data is ephemeral, non-personal, and auto-expires
- **Accessibility:** All forms and panels are keyboard/ARIA accessible

---

## 🎨 Frontend Features

- Modal popup with backdrop
- Type selection with icons (bug, issue, idea, feature, general)
- Form validation (min character count)
- Auto-reset and confirmation toast
- Responsive, accessible design (WCAG 2.2+)
- Admin panel: real-time updates, filtering, stats, actions

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/test_feedback_service.py
pytest tests/test_feedback.py
```

### Frontend
```bash
cd frontend
npm run test
npm run test:feedback
```

---

## 🛠️ Usage Examples

### Add Feedback Button (Frontend)
```tsx
import FeedbackForm from '@/components/FeedbackForm';

const MyComponent = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  return (
    <div>
      <Button onClick={() => setShowFeedback(true)}>💬 Feedback</Button>
      <FeedbackForm isOpen={showFeedback} onClose={() => setShowFeedback(false)} pageUrl={window.location.href} />
    </div>
  );
};
```

### Submit Feedback Programmatically (Frontend)
```typescript
const response = await fetch('/api/v1/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feedback_type: 'bug',
    message: 'Video playback issue',
    email: 'user@example.com',
    page_url: window.location.href
  })
});
```

---

## 📈 Monitoring & Analytics

- Real-time monitoring of feedback submissions
- Type/status distribution analytics
- Status tracking and workflow management
- Email/Slack delivery tracking
- Redis caching for fast retrieval
- Auto-expiration to prevent data bloat
- Rate limiting to prevent abuse
- Comprehensive logging and error handling

---

## 🚨 Troubleshooting

### Common Issues
1. **Email Not Sending:** Verify SendGrid API key, sender email verification, check logs
2. **Slack Notifications Not Working:** Verify webhook URL, Slack app permissions
3. **Feedback Not Appearing:** Check Redis connection, authentication, API responses
4. **Frontend Not Updating:** Check API responses, browser console

---

## 📚 Documentation
- **API Documentation:** See `FEEDBACK_SYSTEM.md`
- **Setup Instructions:** Step-by-step in this file
- **Troubleshooting:** See above
- **Usage Examples:** See above

---

**Production Ready:** This feedback system is fully production-ready with comprehensive monitoring, email notifications, Slack integration, and accessible frontend components. 
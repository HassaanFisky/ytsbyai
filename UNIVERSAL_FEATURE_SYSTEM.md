# Universal Feature Request System - YTS by AI

A universal, production-ready feature request & voting system for all users (kids to coders), built with accessibility, security, and gamification. All code/config examples are copy-paste ready and validated for 2025 standards.

---

## 🎯 Overview

- Emoji-based navigation, progressive disclosure, and guided experience
- Smart user detection (beginner/pro/unknown)
- Accessibility-first (WCAG 2.2+), mobile/PWA support
- Gamification (badges, stats, achievements)
- GDPR-compliant, privacy-first data handling

---

## 🏗️ Architecture

### Backend
- **feature_request_service.py:** Universal design support (user type, category, difficulty, audience, badges, media)
- **API Endpoints:**
  - `POST /api/v1/features` (create, with user type)
  - `POST /api/v1/features/{id}/vote` (vote, with user type)
  - `GET /api/v1/features` (filtered by user type)
  - `GET /api/v1/features/user/profile` (user stats & badges)
  - Admin: stats, top-voters, all features

### Frontend
- **FeatureBoard.tsx:** Emoji quick filters, user profile, animated voting, media attachments, accessibility
- **FeatureForm.tsx:** 3-step wizard, example suggestions, auto-suggested tags, media upload, real-time validation
- **Accessibility:** Keyboard navigation, ARIA labels, high contrast, large text, voice input

---

## ⚙️ Environment Variables
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
SENDGRID_API_KEY=your_sendgrid_api_key
SLACK_WEBHOOK_FEATURES=your_slack_webhook_url
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_domain
```

---

## 🗂️ Database Schema
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string", 
  "category": "beginner|pro|everyone",
  "difficulty_level": "easy|medium|hard",
  "target_audience": ["kids", "beginners", "pros", "elderly"],
  "author_type": "beginner|pro|unknown",
  "media": {
    "screenshot_url": "string?",
    "audio_url": "string?", 
    "video_url": "string?"
  },
  "votes": {
    "upvotes": "integer",
    "downvotes": "integer",
    "helpful_count": "integer"
  }
}
```

---

## 🔒 Security & Accessibility
- **Authentication:** Firebase Auth for secure login
- **Vote Prevention:** One vote per feature per user
- **Admin Protection:** Admin endpoints require authentication
- **Input Validation:** All inputs validated/sanitized
- **Rate Limiting:** All endpoints
- **Data Protection:** 30-day TTL, anonymized analytics, GDPR compliance
- **Accessibility:** All UIs are WCAG 2.2+ compliant (screen reader, keyboard, high contrast, large text)

---

## 🚀 Quick Start
```bash
chmod +x setup-feature-requests.sh
./setup-feature-requests.sh
redis-server
cd backend && ./dev.sh
cd frontend && ./dev.sh
./test-feature-requests.sh
```

---

## 🧪 Testing
```bash
cd backend
pytest tests/test_feature_request_service.py
cd frontend
npm run test
npm run test:features
```

---

## 🛠️ Usage Examples

### Creating a Feature Request (Frontend)
```typescript
const response = await fetch('/api/v1/features', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${firebaseToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Universal Feature',
    description: 'Description here',
    category: 'everyone',
    difficulty_level: 'easy',
    target_audience: ['kids', 'beginners'],
    tags: ['universal', 'accessibility']
  })
});
```

---

## 📈 Analytics & Gamification
- User engagement by type (beginner/pro)
- Feature popularity by category
- Voting patterns by audience
- Badges: Feature Creator, Active Voter, Community Leader, Idea Champion
- Achievement notifications and personal dashboard

---

## 🚨 Troubleshooting
1. **Email/Slack not sending:** Verify API keys, webhook URLs, sender verification
2. **Features not appearing:** Check Redis, authentication, API responses
3. **Frontend not updating:** Check API responses, browser console

---

**Production Ready:** The Universal Feature Request System is fully production-ready, accessible, and inclusive for all users. 
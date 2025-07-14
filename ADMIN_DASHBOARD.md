# Admin Dashboard for Demo Portal Analytics

A comprehensive real-time admin dashboard for tracking demo portal usage, conversions, and analytics with Firebase authentication protection.

## 🏗️ Architecture

### Backend Components

1. **Admin Authentication** (`backend/app/core/admin_auth.py`)
   - Firebase Admin SDK integration
   - Email whitelist for admin access
   - Token verification middleware
   - Admin role validation

2. **Analytics Service** (`backend/app/core/admin_analytics.py`)
   - Redis data aggregation
   - Real-time statistics calculation
   - Usage timeline generation
   - Leaderboard processing
   - Conversion funnel analysis

3. **Admin API Routes** (`backend/app/routers/admin.py`)
   - Protected endpoints with rate limiting
   - Comprehensive analytics data
   - Health check endpoint

### Frontend Components

1. **Admin Auth Gate** (`frontend/components/admin/AdminAuthGate.tsx`)
   - Firebase authentication flow
   - Admin email validation
   - Protected route wrapper
   - User-friendly auth UI

2. **Analytics Dashboard** (`frontend/components/admin/AnalyticsDashboard.tsx`)
   - Real-time data visualization
   - Interactive charts and tables
   - Auto-refresh functionality
   - Responsive design

3. **Admin Page** (`frontend/app/admin/analytics/page.tsx`)
   - Protected admin route
   - SEO optimization (noindex)
   - Metadata configuration

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
```

Add to `.env`:
```env
# Admin Configuration
ADMIN_EMAILS=admin@ytsbyai.com,founder@ytsbyai.com,growth@ytsbyai.com,analytics@ytsbyai.com

# Firebase Admin (if using service account)
FIREBASE_SERVICE_ACCOUNT=path/to/service-account.json
```

### 2. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Add required packages
npm install @radix-ui/react-tabs class-variance-authority
```

### 3. Firebase Configuration

1. **Enable Google Sign-In** in Firebase Console
2. **Add admin emails** to the whitelist in `AdminAuthGate.tsx`
3. **Configure Firebase Admin SDK** (optional service account)

## 📊 API Endpoints

### Protected Admin Endpoints

All endpoints require Firebase authentication and admin privileges:

```typescript
// Headers required for all admin requests
{
  'Authorization': 'Bearer <firebase_id_token>',
  'Content-Type': 'application/json'
}
```

#### GET `/api/v1/admin/demo-stats`
Returns comprehensive demo portal statistics:

```json
{
  "total_sessions": 1250,
  "active_sessions": 45,
  "quota_exceeded_counts": {
    "summary": 89,
    "transcription": 67
  },
  "conversion_clicks": {
    "signup": 23,
    "stripe": 15
  },
  "session_sources": {
    "direct": 500,
    "shared": 375,
    "organic": 375
  },
  "top_ips": ["103.25.90.44", "192.168.1.1"],
  "recent_sessions": [...],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET `/api/v1/admin/usage-timeline?hours=24`
Returns usage timeline for charts:

```json
{
  "summary": [10, 8, 12, 15, ...],
  "transcription": [8, 6, 10, 12, ...],
  "labels": ["00:00", "01:00", "02:00", ...]
}
```

#### GET `/api/v1/admin/leaderboard`
Returns most active sessions:

```json
{
  "leaderboard": [
    {
      "ip_address": "103.25.90.44",
      "location": {
        "country": "India",
        "region": "Maharashtra",
        "city": "Mumbai"
      },
      "total_usage": 15,
      "summary_usage": 10,
      "transcription_usage": 5,
      "created_at": "2024-01-01T10:00:00Z",
      "session_id": "abc123"
    }
  ]
}
```

#### GET `/api/v1/admin/conversion-funnel`
Returns conversion funnel data:

```json
{
  "demo_started": 1250,
  "quota_exceeded": 156,
  "modal_shown": 156,
  "signup_clicked": 23,
  "checkout_clicked": 15,
  "signup_completed": 8,
  "checkout_completed": 5
}
```

#### GET `/api/v1/admin/health`
Health check endpoint:

```json
{
  "status": "healthy",
  "admin_user": "admin@ytsbyai.com",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🎨 Frontend Features

### Admin Authentication
- **Firebase Google Sign-In** with admin email validation
- **Whitelist protection** for authorized admin accounts
- **Session management** with automatic token refresh
- **User-friendly error handling** with clear messaging

### Analytics Dashboard
- **Real-time data** with 5-minute auto-refresh
- **Interactive charts** for usage timeline
- **Comprehensive statistics** cards
- **Tabbed interface** for different data views
- **Responsive design** for all devices

### Data Visualization
- **Usage Timeline Chart** - Summary vs Transcription usage
- **Conversion Funnel** - Step-by-step conversion tracking
- **Leaderboard** - Most active sessions by IP
- **Recent Sessions Table** - Detailed session information
- **Top IP Addresses** - Traffic source analysis

### Key Metrics
- **Total Sessions** - Overall demo portal usage
- **Active Sessions** - Currently active users
- **Conversion Rate** - Signup and checkout percentages
- **Quota Exceeded Rate** - Users hitting limits
- **Traffic Sources** - Direct, shared, organic breakdown

## 🔒 Security Features

### Authentication
- **Firebase Admin SDK** for secure token verification
- **Email whitelist** for admin access control
- **Verified email requirement** for admin accounts
- **Automatic token refresh** and session management

### Rate Limiting
- **30 requests/minute** for analytics endpoints
- **60 requests/minute** for health checks
- **IP-based rate limiting** with slowapi

### Data Protection
- **No sensitive data exposure** in responses
- **IP anonymization** for privacy compliance
- **Secure headers** and CORS configuration
- **Admin-only access** with proper authorization

## 🚀 Deployment

### Backend Deployment
```bash
# Render deployment
cd backend
render deploy

# Environment variables
ADMIN_EMAILS=admin@ytsbyai.com,founder@ytsbyai.com
FIREBASE_SERVICE_ACCOUNT=base64_encoded_service_account
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

# Or individual containers
docker build -t ytsbyai-backend ./backend
docker build -t ytsbyai-frontend ./frontend
```

## 📈 Monitoring & Analytics

### Real-time Metrics
- **Session tracking** with Redis
- **Usage analytics** with automatic aggregation
- **Conversion tracking** with detailed funnel analysis
- **Geographic data** with IP location mapping

### Performance Optimization
- **Caching** with Redis for fast data retrieval
- **Parallel API calls** for dashboard data
- **Lazy loading** for large datasets
- **Auto-refresh** with configurable intervals

### Error Handling
- **Graceful degradation** for missing data
- **User-friendly error messages**
- **Automatic retry logic** for failed requests
- **Comprehensive logging** for debugging

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/test_admin.py
pytest tests/test_analytics.py
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:admin
```

### Manual Testing
1. **Access admin dashboard** at `/admin/analytics`
2. **Sign in with admin account** (whitelisted email)
3. **Verify data loading** and real-time updates
4. **Test all dashboard features** and interactions

## 🔧 Configuration

### Admin Email Whitelist
Update in both backend and frontend:

```python
# backend/app/core/admin_auth.py
ADMIN_EMAILS = [
    "admin@ytsbyai.com",
    "founder@ytsbyai.com", 
    "growth@ytsbyai.com",
    "analytics@ytsbyai.com"
]
```

```typescript
// frontend/components/admin/AdminAuthGate.tsx
const ADMIN_EMAILS = [
    "admin@ytsbyai.com",
    "founder@ytsbyai.com", 
    "growth@ytsbyai.com",
    "analytics@ytsbyai.com"
];
```

### Rate Limiting
Configure in `backend/app/routers/admin.py`:

```python
@limiter.limit("30/minute")  # Analytics endpoints
@limiter.limit("60/minute")  # Health checks
```

### Auto-refresh Interval
Configure in `frontend/components/admin/AnalyticsDashboard.tsx`:

```typescript
// Auto-refresh every 5 minutes
const interval = setInterval(fetchData, 5 * 60 * 1000);
```

## 🎯 Usage Examples

### Accessing the Dashboard
1. Navigate to `https://yourdomain.com/admin/analytics`
2. Sign in with Google using admin email
3. View real-time analytics dashboard

### API Integration
```typescript
// Fetch demo stats
const response = await fetch('/api/v1/admin/demo-stats', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const stats = await response.json();
```

### Custom Analytics
```python
# Add custom analytics endpoint
@router.get("/custom-stats")
async def get_custom_stats(current_admin: dict = Depends(get_admin_user)):
    # Your custom analytics logic
    return {"custom_metric": value}
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify Firebase configuration
   - Check admin email whitelist
   - Ensure email is verified

2. **No Data Displayed**
   - Check Redis connection
   - Verify demo portal usage
   - Check API endpoint responses

3. **Rate Limiting**
   - Reduce request frequency
   - Implement caching
   - Contact admin for limit increase

4. **Chart Not Loading**
   - Check browser console for errors
   - Verify data format
   - Test with mock data

### Debug Commands
```bash
# Check Redis data
redis-cli keys "demo:*"

# Test admin endpoint
curl -H "Authorization: Bearer <token>" /api/v1/admin/health

# Monitor logs
docker logs ytsbyai-backend
```

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin)
- [Redis Analytics Patterns](https://redis.io/topics/patterns)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

---

**Production Ready**: This admin dashboard is fully production-ready with security, monitoring, and scalability features built-in. 
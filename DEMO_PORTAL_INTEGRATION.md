# Demo Portal Integration

## Overview

The YTS by AI Demo Portal provides secure, guest access to core features with usage tracking and conversion optimization. Users can try voice transcription and YouTube summarization without creating an account.

## Features

### 🔐 Security & Access
- **No Login Required**: Temporary guest sessions via cookies
- **IP-based Tracking**: Prevents abuse with IP address tracking
- **Session Management**: 24-hour session duration with automatic cleanup
- **Rate Limiting**: Prevents abuse with per-endpoint rate limits

### 📊 Usage Tracking
- **3 Free Summaries**: YouTube URL summarization per session
- **2 Free Transcriptions**: Voice transcription (max 30s audio) per session
- **Real-time Counter**: Live quota display with progress bars
- **Session Persistence**: Usage tracked across browser sessions

### 🎯 Conversion Optimization
- **Quota Lockout**: Clear messaging when limits reached
- **Sign-up CTAs**: Prominent conversion buttons throughout
- **Feature Preview**: Full functionality with clear upgrade path
- **Social Sharing**: Easy content sharing to drive viral growth

## Architecture

### Backend Components

#### Demo Service (`backend/app/core/demo_service.py`)
```python
class DemoService:
    - Redis-based session management
    - IP-based guest ID generation
    - Usage quota tracking
    - Session expiration handling
```

#### Demo Router (`backend/app/routers/demo.py`)
```python
Endpoints:
- GET /api/v1/demo/session - Get/create guest session
- GET /api/v1/demo/limits - Get demo service limits
- POST /api/v1/demo/summary - Create YouTube summary
- POST /api/v1/demo/transcribe - Transcribe audio
- GET /api/v1/demo/stats - Get usage statistics
- DELETE /api/v1/demo/session - Clear session
```

### Frontend Components

#### Demo Portal (`frontend/components/demo-portal.tsx`)
```typescript
Features:
- Voice recording with MediaRecorder API
- YouTube URL input and validation
- Real-time quota display
- Copy/download/share functionality
- Conversion CTAs
```

#### Demo Page (`frontend/app/demo/page.tsx`)
```typescript
- SEO-optimized metadata
- Responsive layout
- Error handling
```

## Environment Variables

Add to your `.env` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Demo Portal Settings
DEMO_ENABLED=true
DEMO_SUMMARY_LIMIT=3
DEMO_TRANSCRIPTION_LIMIT=2
DEMO_AUDIO_MAX_DURATION=30
DEMO_SESSION_DURATION=86400
```

## Installation

### 1. Backend Dependencies
```bash
cd backend
pip install redis==5.0.1
```

### 2. Frontend Dependencies
```bash
cd frontend
npm install @radix-ui/react-progress @radix-ui/react-tabs class-variance-authority
```

### 3. Redis Setup
```bash
# Install Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS

# Start Redis
redis-server

# Test connection
redis-cli ping
```

## API Endpoints

### Session Management
```http
GET /api/v1/demo/session
Response: {
  "guest_id": "guest:192.168.1.1:abc123",
  "session_id": "uuid-session-id",
  "created_at": "2024-01-01T00:00:00Z",
  "ip_address": "192.168.1.1",
  "usage": {
    "summary": {"used": 0, "limit": 3, "remaining": 3},
    "transcription": {"used": 0, "limit": 2, "remaining": 2}
  },
  "total_used": 0,
  "total_limit": 5,
  "has_any_quota": true
}
```

### YouTube Summary
```http
POST /api/v1/demo/summary
Body: {
  "youtube_url": "https://youtube.com/watch?v=...",
  "tone": "professional",
  "max_length": 500
}
Response: {
  "summary": "AI-generated summary...",
  "title": "Video Title",
  "tone": "professional",
  "cta": "Call to action",
  "quota_info": {...},
  "session_id": "uuid"
}
```

### Voice Transcription
```http
POST /api/v1/demo/transcribe
Body: FormData with audio file
Response: {
  "transcription": "Transcribed text...",
  "language": "en",
  "duration": 15.5,
  "summary": "AI summary...",
  "quota_info": {...},
  "session_id": "uuid"
}
```

## Usage Limits

### Summary Service
- **Limit**: 3 summaries per session
- **Duration**: 24 hours per session
- **Features**: Full LangGraph workflow integration
- **Output**: Professional summaries with CTAs

### Transcription Service
- **Limit**: 2 transcriptions per session
- **Audio Limit**: Maximum 30 seconds
- **Features**: Whisper transcription + AI summarization
- **Languages**: Auto-detection with confidence scores

## Security Features

### Rate Limiting
```python
# Per-endpoint limits
@limiter.limit("10/minute")  # Summary creation
@limiter.limit("10/minute")  # Transcription
@limiter.limit("30/minute")  # Session/limits queries
```

### Session Security
```python
# Cookie settings
response.set_cookie(
    key="demo_session_id",
    value=session_id,
    max_age=86400,
    httponly=True,
    secure=production,
    samesite="lax"
)
```

### IP Tracking
```python
def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host
```

## Frontend Features

### Voice Recording
```typescript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  // Recording logic...
};
```

### Quota Display
```typescript
const getQuotaProgress = (used: number, limit: number) => {
  return (used / limit) * 100;
};
```

### Content Sharing
```typescript
const shareContent = async (text: string, title: string) => {
  if (navigator.share) {
    await navigator.share({ title, text });
  } else {
    copyToClipboard(text, title);
  }
};
```

## Conversion Optimization

### Quota Lockout
- Clear messaging when limits reached
- Direct links to signup/pricing pages
- Feature comparison highlighting

### CTAs Throughout
- "Sign Up Free" buttons
- "View Plans" links
- "Unlimited Access" messaging

### Social Proof
- Share functionality for viral growth
- Download options for content retention
- Copy-to-clipboard for easy sharing

## Deployment

### Docker Compose
```yaml
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    environment:
      - REDIS_HOST=redis
      - DEMO_ENABLED=true
    depends_on:
      - redis
```

### Environment Variables
```bash
# Production
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
DEMO_ENABLED=true
DEMO_SESSION_DURATION=86400
```

### Health Checks
```python
@app.get("/health")
async def health_check():
    # Check Redis connection
    try:
        demo_service.redis_client.ping()
        return {"status": "healthy", "redis": "connected"}
    except:
        return {"status": "unhealthy", "redis": "disconnected"}
```

## Monitoring

### Usage Analytics
```python
# Track conversion rates
demo_usage = await demo_service.get_demo_stats(guest_id)
conversion_rate = demo_usage.total_used / demo_usage.total_limit
```

### Error Tracking
```python
# Log quota exceeded events
logger.info(f"Demo quota exceeded for {guest_id}: {service}")
```

### Performance Metrics
```python
# Track response times
import time
start_time = time.time()
# ... API logic ...
response_time = time.time() - start_time
```

## Testing

### Unit Tests
```python
async def test_demo_quota():
    guest_id = "test_guest"
    has_quota, info = await demo_service.check_demo_quota(guest_id, "summary")
    assert has_quota == True
    assert info["remaining"] == 3
```

### Integration Tests
```python
async def test_demo_summary_creation():
    response = await client.post("/api/v1/demo/summary", json={
        "youtube_url": "https://youtube.com/watch?v=test"
    })
    assert response.status_code == 200
    assert "summary" in response.json()
```

### Frontend Tests
```typescript
test('demo portal loads correctly', () => {
  render(<DemoPortal />);
  expect(screen.getByText('Try YTS by AI')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Restart Redis
   sudo systemctl restart redis
   ```

2. **Audio Recording Issues**
   ```javascript
   // Check microphone permissions
   navigator.permissions.query({ name: 'microphone' })
     .then(result => console.log(result.state));
   ```

3. **Quota Not Updating**
   ```python
   # Check Redis keys
   redis-cli keys "demo:usage:*"
   redis-cli keys "demo:session:*"
   ```

### Debug Mode
```python
# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
logger.debug(f"Demo session created: {session_data}")
```

## Performance Optimization

### Redis Optimization
```python
# Connection pooling
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    max_connections=20
)
```

### Frontend Optimization
```typescript
// Debounce API calls
const debouncedLoadStats = useCallback(
  debounce(loadDemoSession, 1000),
  []
);
```

### Caching Strategy
```python
# Cache demo limits
@lru_cache(maxsize=1)
async def get_cached_demo_limits():
    return await demo_service.get_demo_limits()
```

## Security Considerations

### Data Protection
- No PII stored in demo sessions
- Session data expires automatically
- IP addresses hashed for privacy

### Rate Limiting
- Per-IP rate limits
- Per-endpoint limits
- Automatic abuse detection

### Input Validation
- YouTube URL validation
- Audio file type checking
- Duration limits enforced

## Future Enhancements

### Planned Features
- [ ] A/B testing for conversion optimization
- [ ] Advanced analytics dashboard
- [ ] Email capture for lead generation
- [ ] Social login integration
- [ ] Mobile app demo version

### Scalability Improvements
- [ ] Redis cluster for high availability
- [ ] CDN for static assets
- [ ] Load balancing for API endpoints
- [ ] Database sharding for large scale

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Test with minimal configuration
4. Contact the development team

## License

This demo portal integration is part of the YTS by AI project and follows the same licensing terms. 
# 🚀 Professional Frontend-Backend API Setup

## Overview
This project uses a professional API utility for seamless communication between the Next.js frontend and FastAPI backend.

## 📁 File Structure
```
frontend/
├── lib/
│   └── api.ts          # Professional API utility
├── components/
│   └── api-example.tsx # Example usage component
├── .env.local          # Environment variables
└── API_SETUP.md        # This documentation
```

## 🔧 Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (CORS Configuration)
The backend is already configured to allow requests from:
- `http://localhost:3000` (Frontend dev server)
- `http://localhost:3001` (Alternative port)
- `https://ytsbyai.vercel.app` (Production)
- `chrome-extension://*` (Chrome extension)

## 🛠️ API Utility Usage

### Basic Usage
```typescript
import { api } from '@/lib/api';

// GET request
const result = await api.get('/api/v1/summary/123');

// POST request
const result = await api.post('/api/v1/summary', {
  text: 'Your text here',
  type: 'youtube'
});

// PUT request
const result = await api.put('/api/v1/summary/123', {
  text: 'Updated text'
});

// DELETE request
const result = await api.delete('/api/v1/summary/123');
```

### Advanced Usage with Types
```typescript
import { api, ApiResponse } from '@/lib/api';

interface SummaryData {
  id: string;
  text: string;
  summary: string;
  created_at: string;
}

const response: ApiResponse<SummaryData> = await api.get<SummaryData>('/api/v1/summary/123');

if (response.success) {
  console.log('Summary:', response.data?.summary);
} else {
  console.error('Error:', response.error);
}
```

### Custom Fetch Options
```typescript
import { fetchFromAPI } from '@/lib/api';

const response = await fetchFromAPI('/api/v1/summary', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token',
    'Custom-Header': 'value'
  },
  body: JSON.stringify({ text: 'Hello world' })
});
```

## 🔒 Security Features

### Built-in Security
- ✅ CORS protection
- ✅ Credentials support (cookies/auth)
- ✅ Error handling
- ✅ TypeScript support
- ✅ Environment variable protection

### Best Practices
1. **Never hardcode API URLs** - Use environment variables
2. **Always handle errors** - Check `response.success`
3. **Use TypeScript interfaces** - For type safety
4. **Validate data** - Both frontend and backend
5. **Use HTTPS in production** - Secure communication

## 🧪 Testing

### Test the API Connection
1. Start both servers:
   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev
   
   # Terminal 2 - Backend
   cd backend && uvicorn main:app --reload --port 8000
   ```

2. Use the example component:
   ```typescript
   import ApiExample from '@/components/api-example';
   
   // In your page
   <ApiExample />
   ```

3. Check browser console for API calls and errors

## 🐛 Troubleshooting

### Common Issues

**1. CORS Error**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:** Ensure backend CORS is configured correctly (already done)

**2. API URL Not Found**
```
Failed to fetch: TypeError: Failed to fetch
```
**Solution:** Check if backend server is running on port 8000

**3. Environment Variable Not Working**
```
API URL: undefined
```
**Solution:** Restart frontend dev server after adding `.env.local`

**4. TypeScript Errors**
```
Property 'data' does not exist on type 'ApiResponse'
```
**Solution:** Always check `response.success` before accessing `response.data`

## 📊 Monitoring

### Browser DevTools
- Network tab: Monitor API calls
- Console: Check for errors
- Application tab: Verify environment variables

### Backend Logs
```bash
cd backend
uvicorn main:app --reload --port 8000 --log-level debug
```

## 🚀 Production Deployment

### Frontend (Vercel)
- Environment variables in Vercel dashboard
- `NEXT_PUBLIC_API_URL=https://your-backend-domain.com`

### Backend (Render/Heroku)
- Update CORS origins in `backend/app/core/config.py`
- Add production domain to `ALLOWED_ORIGINS`

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [TypeScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**✅ Setup Complete!** Your frontend and backend are now professionally connected with proper error handling, TypeScript support, and security features. 
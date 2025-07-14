# 🚀 YTS by AI - Deployment Guide

Complete deployment guide for all components of the YTS by AI full-stack application.

## 📋 Prerequisites

- GitHub repository with your code
- API keys for all services (OpenAI, Stripe, Firebase, PostHog)
- Domain name (optional but recommended)

## 🎯 Deployment Order

1. **Backend (Render)** - Deploy first as frontend depends on it
2. **Frontend (Vercel)** - Deploy after backend is live
3. **Mobile (Expo)** - Can be deployed in parallel
4. **Chrome Extension** - Deploy last after frontend is live

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend
```bash
cd backend
# Ensure all dependencies are in requirements.txt
# Ensure render.yaml is configured
```

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ytsbyai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:
```
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_cert_url
JWT_SECRET_KEY=your_jwt_secret
ENVIRONMENT=production
DEBUG=false
```

### Step 4: Deploy
Click "Create Web Service" and wait for deployment.

**Backend URL**: `https://your-backend-url.onrender.com`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
cd frontend
# Ensure all dependencies are in package.json
# Ensure vercel.json is configured
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables
In Vercel dashboard, add these environment variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

### Step 4: Deploy
Click "Deploy" and wait for deployment.

**Frontend URL**: `https://ytsbyai.vercel.app`

---

## 📱 Mobile App Deployment (Expo)

### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS
```bash
cd mobile
eas build:configure
```

### Step 4: Build for Production
```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### Step 5: Submit to Stores
```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

**Note**: You'll need developer accounts for both stores.

---

## 🔌 Chrome Extension Deployment

### Step 1: Package Extension
```bash
cd chrome-ext
zip -r ../ytsbyai-extension.zip . -x "*.git*" "*.DS_Store*"
```

### Step 2: Update Configuration
1. Update `background.js` with your production backend URL
2. Create extension icons (16x16, 32x32, 48x48, 128x128)
3. Update `manifest.json` with your details

### Step 3: Submit to Chrome Web Store
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "Add new item"
3. Upload `ytsbyai-extension.zip`
4. Fill in store listing:
   - **Name**: YTS by AI
   - **Description**: AI-powered YouTube video summarization
   - **Screenshots**: Add screenshots of the extension in action
   - **Privacy Policy**: Link to your privacy policy
5. Submit for review

---

## 🔗 Update Cross-References

After deployment, update these files with production URLs:

### 1. Frontend Configuration
```javascript
// frontend/vercel.json
"redirects": [
  {
    "source": "/api/(.*)",
    "destination": "https://your-backend-url.onrender.com/api/$1"
  }
]
```

### 2. Chrome Extension
```javascript
// chrome-ext/background.js
const API_BASE_URL = 'https://your-backend-url.onrender.com/api/v1';
```

### 3. Stripe Webhooks
In Stripe dashboard, set webhook endpoint to:
```
https://your-backend-url.onrender.com/api/v1/webhook
```

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.onrender.com/health
```

### Frontend Test
1. Visit your Vercel URL
2. Test YouTube video summarization
3. Test subscription flow
4. Test mobile responsiveness

### Mobile App Test
1. Install from TestFlight (iOS) or internal testing (Android)
2. Test voice input functionality
3. Test summary playback

### Chrome Extension Test
1. Install from Chrome Web Store
2. Visit any YouTube video
3. Click "Summarize with AI" button
4. Verify summary appears

---

## 📊 Monitoring & Analytics

### PostHog Setup
1. Create PostHog project
2. Add tracking events in your code
3. Set up funnels for conversion tracking

### Error Monitoring
- Set up Sentry for error tracking
- Monitor API response times
- Track user engagement metrics

---

## 🔒 Security Checklist

- [ ] All API keys are in environment variables
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] Input validation is in place
- [ ] SQL injection protection
- [ ] XSS protection

---

## 🚨 Troubleshooting

### Common Issues

1. **Backend 500 errors**: Check environment variables
2. **CORS errors**: Verify CORS configuration
3. **Stripe webhook failures**: Check webhook URL and secret
4. **Firebase auth issues**: Verify Firebase configuration
5. **Mobile build failures**: Check EAS configuration

### Support
- Check Render/Vercel logs for detailed error messages
- Verify all environment variables are set correctly
- Test locally before deploying

---

## 🎉 Success!

Once all components are deployed and tested:

1. **Update documentation** with production URLs
2. **Set up monitoring** and alerts
3. **Launch marketing** campaign
4. **Monitor performance** and user feedback
5. **Iterate and improve** based on usage data

Your YTS by AI application is now live and ready for users! 🚀 
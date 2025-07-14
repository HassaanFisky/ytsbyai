# YTS by AI

**Fullstack AI SaaS for YouTube & Voice Summarization with Advanced Features**

---

## 🚀 Overview
YTS by AI is a production-ready, scalable SaaS that summarizes any YouTube video or voice input using GPT-4 and Whisper. Built for monetization, automation, and cross-platform use (web, mobile, Chrome extension) with advanced features like GraphRAG recommendations, voice AI, admin dashboard, and universal feature requests.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, TailwindCSS, TypeScript, useSWR, React, Toastify
- **Backend:** FastAPI, Python, OpenAI API, Whisper, Firebase Auth, Stripe
- **Mobile:** React Native (Expo), Firebase, expo-speech
- **Chrome Extension:** YouTube detection, button injection, backend connection
- **CI/CD:** GitHub Actions, Slack Notify
- **Analytics:** PostHog
- **Database:** Redis, Neo4j, Pinecone
- **Voice AI:** OpenVoice, faster-whisper
- **Notifications:** SendGrid, Slack

---

## 📦 Modules
- **backend/**: FastAPI app with all AI services
- **frontend/**: Next.js app with universal UI
- **mobile/**: Expo app with voice input
- **chrome-ext/**: Chrome extension for YouTube
- **.github/**: CI/CD workflows
- **env-template.txt**: Complete environment variables

---

## ✨ Key Features

### 🎯 Core Features
- YouTube/voice summarization (GPT-4 + Whisper)
- $1/month Stripe subscription, 1-month free trial
- Device lock (JWT + IP + localStorage)
- Save summary, feature flags, memory auto-clear, tone customization
- SEO-ready, mobile-first, iOS transitions, dark/light mode
- PostHog analytics, Slack CI alerts

### 🧠 AI-Powered Features
- **GraphRAG Recommendations**: Neo4j + Pinecone hybrid search
- **Voice AI Integration**: Transcription + synthesis with OpenVoice
- **Smart Summaries**: LangGraph workflow for intelligent summaries
- **Demo Portal**: Guest access with usage tracking
- **Universal Feature System**: For kids to coders

### 🎛️ Admin & Analytics
- **Admin Dashboard**: Real-time analytics and user management
- **Alerts System**: Smart notifications with email/Slack
- **Feedback System**: Comprehensive bug reports and feature requests
- **Usage Analytics**: Detailed tracking and insights

### 🔒 Security & Monitoring
- **Rate Limiting**: Per-endpoint protection
- **Firebase Auth**: Secure user management
- **Redis Caching**: Fast data access
- **Health Monitoring**: Comprehensive health checks

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/ytsbyai.git
cd ytsbyai
chmod +x setup.sh
./setup.sh
```

### 2. Environment Configuration
```bash
cp env-template.txt .env
# Edit .env with your API keys
```

### 3. Start Development
```bash
# Start all services
./superDev.ps1  # Windows
./superDev.sh   # Linux/macOS
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Admin**: http://localhost:3000/admin/analytics
- **Demo**: http://localhost:3000/demo

---

## 📊 API Endpoints

### Core Services
- `POST /api/v1/summary` - YouTube video summarization
- `POST /api/v1/voice/transcribe` - Voice transcription
- `POST /api/v1/voice/synthesize` - Speech synthesis
- `POST /api/v1/recommend` - GraphRAG recommendations

### Admin Services
- `GET /api/v1/admin/analytics` - Admin dashboard data
- `GET /api/v1/admin/alerts` - System alerts
- `GET /api/v1/admin/feedback` - User feedback

### Demo Portal
- `GET /api/v1/demo/session` - Guest session management
- `POST /api/v1/demo/summary` - Demo summarization
- `POST /api/v1/demo/transcribe` - Demo transcription

### Feature Requests
- `GET /api/v1/features` - List feature requests
- `POST /api/v1/features` - Create feature request
- `POST /api/v1/features/{id}/vote` - Vote on features

---

## 🎨 Frontend Features

### Universal Design
- **Emoji Navigation**: Intuitive interface for all users
- **Progressive Disclosure**: Complexity based on user type
- **Accessibility First**: Works for elderly, kids, professionals
- **Dark Mode**: Default with low-contrast option

### User Types Supported
- 🧒 **Kids**: Simple emoji-based interface
- 🌱 **Beginners**: Guided experience with examples
- 🚀 **Pros**: Advanced features and technical options
- 👴 **Elderly**: Large text, high contrast, voice support

---

## 🔧 Backend Services

### AI Services
- **Summary Service**: YouTube + voice summarization
- **Voice Service**: Whisper + OpenVoice integration
- **GraphRAG Service**: Hybrid graph + vector search
- **LangGraph Service**: Intelligent workflow orchestration

### Admin Services
- **Admin Analytics**: Real-time usage tracking
- **Alerts Service**: Smart notification system
- **Feedback Service**: User feedback management
- **Demo Service**: Guest access with limits

---

## 🚀 Deployment

### Production Deployment
- **Frontend**: Vercel (automatic from GitHub)
- **Backend**: Render (with GPU support)
- **Mobile**: Expo Publish
- **Chrome Extension**: Chrome Web Store

### Environment Variables
See `env-template.txt` for complete list of required variables.

### Docker Deployment
```bash
docker-compose up -d
```

---

## 📈 Monitoring & Analytics

### Real-time Metrics
- User engagement and conversion rates
- API usage and performance metrics
- Error tracking and alerting
- Feature request analytics

### Admin Dashboard
- Live user activity monitoring
- Usage statistics and trends
- Alert management and notifications
- Feedback and feature request management

---

## 🔒 Security Features

- **Firebase Authentication**: Secure user management
- **Rate Limiting**: Per-endpoint protection
- **Input Validation**: Comprehensive sanitization
- **CORS Protection**: Secure cross-origin requests
- **JWT Tokens**: Stateless authentication
- **Redis Security**: Encrypted data storage

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### Integration Testing
```bash
./test-feature-requests.sh
./test-feedback.sh
```

---

## 📚 Documentation

- **API Documentation**: Available at `/docs` when running
- **Setup Guides**: Comprehensive setup instructions
- **Feature Documentation**: Detailed feature guides
- **Troubleshooting**: Common issues and solutions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@ytsbyai.com

---

**🎉 YTS by AI - The complete AI-powered YouTube and voice summarization platform!** 
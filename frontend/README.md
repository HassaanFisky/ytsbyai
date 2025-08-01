# YTS by AI Frontend

A modern, secure, and performant Progressive Web App for AI-powered YouTube video and voice note summarization.

## 🚀 Features

### Core Functionality
- **AI Summarization**: GPT-4 powered video and voice summarization
- **YouTube Integration**: Direct YouTube URL processing
- **Voice Recognition**: Real-time voice-to-text with Whisper
- **PWA Support**: Full offline capabilities and app installation
- **Multi-User Modes**: Teen, ADHD, and Professional interfaces

### Security & Performance 
**Comprehensive Security**: XSS protection, CSRF tokens, input validation
- **Performance Monitoring**: Core Web Vitals tracking and optimization
- **Error Handling**: Graceful error boundaries with recovery options
- **Offline Support**: IndexedDB caching and sync queue management

### Developer Experience
- **TypeScript**: Full type safety
- **Testing**: Comprehensive test suite with Vitest
- **Code Quality**: ESLint, Prettier, and automated formatting
- **Performance Analysis**: Lighthouse integration and bundle analysis

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom themes
- **State Management**: React Context + SWR
- **Authentication**: Firebase Auth
- **Payments**: Stripe integration
- **Analytics**: PostHog
- **Testing**: Vitest + Testing Library
- **PWA**: Service Worker + Manifest

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys and configuration

# Start development server
npm run dev
```

## 🔧 Development Scripts

### Core Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Build and preview production
```

### Testing
```bash
npm run test         # Run all tests
npm run test:ui      # Run tests with UI
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:all     # Run all test suites
```

### Security & Performance
```bash
npm run security:audit    # Run security audit
npm run security:fix      # Fix security vulnerabilities
npm run performance:analyze # Analyze bundle size
npm run performance:lighthouse # Run Lighthouse audit
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # Run TypeScript check
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### PWA & Offline
```bash
npm run pwa:validate # Validate PWA assets
npm run offline:test # Test offline functionality
```

## 🔒 Security Features

### Input Validation
- **XSS Protection**: Automatic sanitization of user inputs
- **CSRF Protection**: Token-based request validation
- **URL Validation**: YouTube URL format validation
- **Password Strength**: Comprehensive password requirements

### Security Headers
- **Content Security Policy**: Restrictive CSP with necessary exceptions
- **HSTS**: HTTPS enforcement
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing prevention

### API Security
- **Rate Limiting**: Request throttling per user
- **Origin Validation**: CORS and origin checking
- **Request Size Limits**: Prevent large payload attacks

## 📊 Performance Features

### Core Web Vitals Monitoring
- **First Contentful Paint (FCP)**: Visual loading performance
- **Largest Contentful Paint (LCP)**: Perceived loading speed
- **First Input Delay (FID)**: Interactivity responsiveness
- **Cumulative Layout Shift (CLS)**: Visual stability

### Performance Optimization
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Lighthouse Audits**: Automated performance scoring
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting

### Caching Strategies
- **API Response Caching**: Intelligent cache invalidation
- **Static Asset Caching**: Service worker cache management
- **Offline Data Storage**: IndexedDB for offline functionality

## 🔄 Offline Features

### Offline Data Management
- **IndexedDB Storage**: Persistent offline data storage
- **Sync Queue**: Automatic data synchronization when online
- **Cache Management**: Intelligent cache size and age management
- **Offline Indicators**: Visual feedback for connection status

### PWA Capabilities
- **App Installation**: Native app-like installation
- **Offline Functionality**: Core features work without internet
- **Background Sync**: Automatic data synchronization
- **Push Notifications**: Real-time updates and alerts

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and authentication flow testing
- **Security Tests**: Input validation and security feature testing
- **Performance Tests**: Core Web Vitals and performance monitoring
- **Offline Tests**: PWA and offline functionality testing

### Test Structure
```
tests/
├── ErrorBoundary.test.tsx    # Error boundary component tests
├── security.test.ts          # Security utility tests
├── performance.test.ts       # Performance monitoring tests
├── offline.test.ts          # Offline functionality tests
└── components/              # Component-specific tests
```

### Running Tests
```bash
# Run specific test suites
npm run test:security
npm run test:performance
npm run test:offline
npm run test:error-boundary

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## 🏗️ Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ErrorBoundary.tsx   # Error handling component
│   ├── PWAInstallPrompt.tsx # PWA installation prompt
│   ├── PWAServiceWorker.tsx # Service worker management
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility libraries
│   ├── security.ts         # Security utilities
│   ├── performance.ts      # Performance monitoring
│   ├── offline.ts          # Offline management
│   └── api.ts             # API utilities
├── hooks/                  # Custom React hooks
├── context/                # React context providers
├── tests/                  # Test files
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── offline.html        # Offline fallback page
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
NEXT_PUBLIC_API_URL=your-backend-url
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Optional
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Security Configuration
```typescript
// Customize security settings
securityManager.updateConfig({
  enableCSP: true,
  enableHSTS: true,
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  allowedOrigins: ['https://your-domain.com']
})
```

### Performance Configuration
```typescript
// Set up performance monitoring
performanceMonitor.addCustomMetric('custom_metric', value)
measureApiCall('api_name', apiFunction)
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### PWA Deployment Checklist
- [ ] Manifest.json configured
- [ ] Service worker registered
- [ ] HTTPS enabled
- [ ] Icons generated
- [ ] Offline page created
- [ ] PWA validation passed

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Automatic tracking and reporting
- **Custom Metrics**: Application-specific performance data
- **Error Tracking**: Comprehensive error reporting
- **User Analytics**: PostHog integration for user behavior

### Security Monitoring
- **Input Validation**: Track validation failures
- **Rate Limiting**: Monitor request patterns
- **Security Headers**: Verify header implementation
- **Error Boundaries**: Capture and report errors

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards
4. **Run tests**: `npm run test:all`
5. **Check code quality**: `npm run lint && npm run format:check`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines
- **TypeScript**: Use strict typing
- **Testing**: Write tests for new features
- **Security**: Validate all inputs
- **Performance**: Monitor Core Web Vitals
- **Accessibility**: Follow WCAG guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Security**: Report security vulnerabilities privately
- **Community**: Join our Discord/Telegram for discussions

---

Built with ❤️ by the YTS by AI team 
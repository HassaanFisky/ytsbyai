# Quota Exceeded UX Implementation

## Overview

This implementation provides a comprehensive quota-exceeded user experience with animated modals, global state management, and seamless conversion flows to Firebase signup and Stripe checkout.

## Features

### 🎯 **Core Features**
- **Automatic Modal Trigger**: Shows when quota limit is reached
- **Animated Progress Bars**: Smooth filling animation before modal appears
- **Global State Management**: Zustand store for quota tracking across components
- **Firebase Integration**: One-click Google signup with popup
- **Stripe Checkout**: Direct redirect to payment flow
- **Analytics Tracking**: Comprehensive event tracking for conversion optimization

### 🎨 **UX Enhancements**
- **Smooth Animations**: Framer Motion powered transitions
- **Progressive Disclosure**: Features list animates in after progress bar
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Error Handling**: Graceful fallbacks for failed redirects

## Components

### 1. QuotaExceededModal Component

```typescript
// frontend/components/QuotaExceededModal.tsx
interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaInfo: {
    service: 'summary' | 'transcription';
    used: number;
    limit: number;
    remaining: number;
  };
  onContinueFree: () => void;
  onUnlockPro: () => void;
}
```

**Features:**
- Animated progress bar filling
- Progressive feature list disclosure
- Firebase/Stripe redirect handlers
- Responsive design with backdrop blur
- Keyboard navigation support

### 2. Global State Management

```typescript
// frontend/lib/demo-store.ts
interface DemoStore {
  // State
  demoStats: DemoStats | null;
  quotaExceeded: QuotaExceededState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDemoStats: (stats: DemoStats) => void;
  updateQuota: (service: 'summary' | 'transcription', newUsed: number) => void;
  setQuotaExceeded: (service: 'summary' | 'transcription', quotaInfo: any) => void;
  closeQuotaModal: () => void;

  // Computed
  isQuotaExceeded: (service: 'summary' | 'transcription') => boolean;
  getQuotaProgress: (service: 'summary' | 'transcription') => number;
  shouldShowModal: () => boolean;
}
```

**State Management Features:**
- Automatic quota tracking
- Modal trigger logic
- Loading and error states
- Computed selectors for performance
- DevTools integration

### 3. Redirect Utilities

```typescript
// frontend/lib/redirect-utils.ts
export const redirectToFirebaseSignup = async (source: string = 'quota_modal') => {
  // Google OAuth popup with analytics tracking
};

export const redirectToStripeCheckout = async (
  priceId: string = 'price_1OqX2X2X2X2X2X2X2X2X2X2X',
  source: string = 'quota_modal'
) => {
  // Stripe checkout session creation and redirect
};
```

**Redirect Features:**
- Firebase Google OAuth popup
- Stripe checkout session creation
- Analytics event tracking
- Error handling with fallbacks
- Source tracking for attribution

## Usage Examples

### Basic Integration

```typescript
// In your demo portal component
import QuotaExceededModal from './QuotaExceededModal';
import { useDemoStore, useDemoStats, useQuotaExceeded } from '@/lib/demo-store';
import { redirectToFirebaseSignup, redirectToStripeCheckout } from '@/lib/redirect-utils';

const DemoPortal = () => {
  const demoStats = useDemoStats();
  const quotaExceeded = useQuotaExceeded();
  const { closeQuotaModal } = useDemoActions();

  const handleContinueFree = () => {
    redirectToFirebaseSignup('quota_modal');
  };

  const handleUnlockPro = () => {
    redirectToStripeCheckout('price_1OqX2X2X2X2X2X2X2X2X2X2X', 'quota_modal');
  };

  return (
    <div>
      {/* Your demo content */}
      
      <QuotaExceededModal
        isOpen={quotaExceeded.isModalOpen}
        onClose={closeQuotaModal}
        quotaInfo={quotaExceeded.quotaInfo!}
        onContinueFree={handleContinueFree}
        onUnlockPro={handleUnlockPro}
      />
    </div>
  );
};
```

### State Management Integration

```typescript
// Update quota after API call
const createSummary = async () => {
  try {
    const response = await fetch('/api/v1/demo/summary', {
      method: 'POST',
      body: JSON.stringify({ youtube_url: youtubeUrl }),
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update global quota state - modal will auto-trigger if exceeded
      updateQuota('summary', result.quota_info.used);
      
      setSummaryResult(result);
      toast.success('Summary created successfully!');
    }
  } catch (error) {
    console.error('Error creating summary:', error);
  }
};
```

### Custom Analytics Tracking

```typescript
// Track custom events
const trackQuotaExceeded = (service: string, source: string) => {
  // PostHog tracking
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('quota_exceeded', {
      service,
      source,
      timestamp: new Date().toISOString()
    });
  }
  
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'quota_exceeded', {
      service,
      source
    });
  }
};
```

## Animation Sequence

### 1. Progress Bar Animation
```typescript
// Animate progress bar filling
useEffect(() => {
  if (isOpen) {
    const timer = setTimeout(() => {
      setProgressValue((quotaInfo.used / quotaInfo.limit) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }
}, [isOpen, quotaInfo]);
```

### 2. Feature List Disclosure
```typescript
// Show features after progress animation
useEffect(() => {
  if (isOpen) {
    const timer = setTimeout(() => {
      setShowFeatures(true);
    }, 800);
    return () => clearTimeout(timer);
  } else {
    setShowFeatures(false);
  }
}, [isOpen]);
```

### 3. Modal Entrance Animation
```typescript
<motion.div
  initial={{ scale: 0.9, opacity: 0, y: 20 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.9, opacity: 0, y: 20 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
  {/* Modal content */}
</motion.div>
```

## Environment Variables

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## API Endpoints

### Stripe Checkout Session
```http
POST /api/v1/subscription/create-checkout-session
Content-Type: application/json

{
  "price_id": "price_1OqX2X2X2X2X2X2X2X2X2X2X",
  "success_url": "http://localhost:3000/dashboard?source=demo_checkout",
  "cancel_url": "http://localhost:3000/demo?source=demo_checkout_cancelled",
  "metadata": {
    "source": "quota_modal",
    "demo_user": "true"
  }
}
```

### Subscription Status
```http
GET /api/v1/subscription/status
Authorization: Bearer <firebase_token>
```

## Analytics Events

### Conversion Tracking
```typescript
// Events tracked automatically
'demo_signup_attempted' // When user clicks signup
'demo_signup_successful' // After successful Firebase auth
'demo_signup_failed' // If Firebase auth fails
'demo_checkout_attempted' // When user clicks checkout
'demo_checkout_session_created' // After Stripe session creation
'demo_checkout_failed' // If Stripe checkout fails
'demo_manual_signup_redirect' // Fallback to manual signup
'demo_pricing_redirect' // Redirect to pricing page
'demo_dashboard_redirect' // After successful conversion
'demo_user_signout' // When user signs out
```

### Custom Properties
```typescript
{
  source: 'quota_modal' | 'demo_signup' | 'demo_checkout',
  service: 'summary' | 'transcription',
  price_id: string,
  user_id: string,
  error: string
}
```

## Error Handling

### Firebase Auth Errors
```typescript
try {
  const result = await signInWithPopup(auth, provider);
  // Success handling
} catch (error: any) {
  if (error.code === 'auth/popup-closed-by-user') {
    // User closed popup - show manual signup option
    window.location.href = '/auth?source=demo_signup&error=popup_closed';
  } else if (error.code === 'auth/popup-blocked') {
    // Popup blocked - redirect to manual signup
    window.location.href = '/auth?source=demo_signup&error=popup_blocked';
  } else {
    // Other errors
    window.location.href = '/auth?source=demo_signup&error=firebase_error';
  }
}
```

### Stripe Checkout Errors
```typescript
try {
  const response = await fetch('/api/v1/subscription/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify(checkoutData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }
  
  const { session_url } = await response.json();
  window.location.href = session_url;
} catch (error) {
  // Fallback to pricing page
  window.location.href = '/pricing?source=demo_checkout_error';
}
```

## Performance Optimization

### State Selectors
```typescript
// Use specific selectors for better performance
export const useDemoStats = () => useDemoStore((state) => state.demoStats);
export const useQuotaExceeded = () => useDemoStore((state) => state.quotaExceeded);
export const useIsLoading = () => useDemoStore((state) => state.isLoading);
```

### Memoization
```typescript
// Memoize expensive computations
const getQuotaProgress = useMemo(() => {
  if (!demoStats) return 0;
  const { used, limit } = demoStats.usage[service];
  return (used / limit) * 100;
}, [demoStats, service]);
```

### Lazy Loading
```typescript
// Lazy load modal component
const QuotaExceededModal = lazy(() => import('./QuotaExceededModal'));

// Only render when needed
{shouldShowModal() && (
  <Suspense fallback={<div>Loading...</div>}>
    <QuotaExceededModal {...modalProps} />
  </Suspense>
)}
```

## Testing

### Unit Tests
```typescript
// Test quota exceeded logic
test('should trigger modal when quota exceeded', () => {
  const { result } = renderHook(() => useDemoStore());
  
  act(() => {
    result.current.updateQuota('summary', 3); // Max limit
  });
  
  expect(result.current.quotaExceeded.isModalOpen).toBe(true);
  expect(result.current.quotaExceeded.service).toBe('summary');
});

// Test redirect functions
test('should redirect to Firebase signup', async () => {
  const mockSignInWithPopup = jest.fn();
  jest.spyOn(auth, 'signInWithPopup').mockImplementation(mockSignInWithPopup);
  
  await redirectToFirebaseSignup('test');
  
  expect(mockSignInWithPopup).toHaveBeenCalled();
});
```

### Integration Tests
```typescript
// Test full flow
test('should show modal and handle redirects', async () => {
  render(<DemoPortal />);
  
  // Trigger quota exceeded
  fireEvent.click(screen.getByText('Create Summary'));
  
  // Wait for modal
  await waitFor(() => {
    expect(screen.getByText('You\'ve Reached the Free Limit!')).toBeInTheDocument();
  });
  
  // Test continue free button
  fireEvent.click(screen.getByText('Continue for Free'));
  
  // Should redirect to Firebase
  expect(window.location.href).toContain('/auth');
});
```

## Deployment

### Build Configuration
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

### Environment Setup
```bash
# Install dependencies
npm install zustand framer-motion @radix-ui/react-progress @radix-ui/react-tabs

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Stripe keys

# Start development
npm run dev
```

## Monitoring & Analytics

### Conversion Funnel
```typescript
// Track conversion funnel
const trackConversionFunnel = (step: string, properties?: any) => {
  const funnelSteps = {
    'demo_started': 'User started demo',
    'quota_exceeded': 'User hit quota limit',
    'modal_shown': 'Modal displayed',
    'signup_clicked': 'User clicked signup',
    'checkout_clicked': 'User clicked checkout',
    'signup_completed': 'User completed signup',
    'checkout_completed': 'User completed checkout'
  };
  
  trackEvent(`funnel_${step}`, {
    step,
    description: funnelSteps[step],
    ...properties
  });
};
```

### Performance Metrics
```typescript
// Track modal performance
const trackModalPerformance = (action: string, duration?: number) => {
  trackEvent('modal_performance', {
    action,
    duration,
    timestamp: Date.now()
  });
};
```

## Troubleshooting

### Common Issues

1. **Modal not showing**
   - Check quota state in Redux DevTools
   - Verify `shouldShowModal()` returns true
   - Check for console errors

2. **Firebase auth not working**
   - Verify Firebase config in environment variables
   - Check browser console for auth errors
   - Ensure popup blockers are disabled

3. **Stripe checkout failing**
   - Verify Stripe keys are correct
   - Check API endpoint is working
   - Verify price ID exists in Stripe dashboard

4. **Animations not working**
   - Ensure Framer Motion is installed
   - Check for CSS conflicts
   - Verify motion components are properly imported

### Debug Mode
```typescript
// Enable debug logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Quota State:', quotaExceeded);
  console.log('Demo Stats:', demoStats);
}
```

## Future Enhancements

### Planned Features
- [ ] A/B testing for different modal designs
- [ ] Email capture before redirect
- [ ] Social proof elements in modal
- [ ] Personalized pricing based on usage
- [ ] Retargeting pixel integration
- [ ] Advanced analytics dashboard

### Performance Improvements
- [ ] Virtual scrolling for large feature lists
- [ ] Image optimization for modal assets
- [ ] Service worker for offline fallbacks
- [ ] CDN integration for static assets

This implementation provides a complete, production-ready quota exceeded UX with smooth animations, comprehensive state management, and robust conversion tracking. 
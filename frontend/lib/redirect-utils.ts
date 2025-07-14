import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase configuration (should be in environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics tracking
const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    // Track with PostHog if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(eventName, properties);
    }
    
    // Track with Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
    
    console.log('Analytics Event:', eventName, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Firebase signup redirect
export const redirectToFirebaseSignup = async (source: string = 'quota_modal') => {
  try {
    trackEvent('demo_signup_attempted', { source, method: 'firebase' });
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
      // Add any additional OAuth scopes if needed
    });
    
    const result = await signInWithPopup(auth, provider);
    
    if (result.user) {
      trackEvent('demo_signup_successful', { 
        source, 
        method: 'firebase',
        user_id: result.user.uid 
      });
      
      // Redirect to dashboard or onboarding
      window.location.href = '/dashboard?source=demo_signup';
    }
  } catch (error: any) {
    trackEvent('demo_signup_failed', { 
      source, 
      method: 'firebase',
      error: error.code 
    });
    
    console.error('Firebase signup error:', error);
    
    // Fallback to manual signup page
    window.location.href = '/auth?source=demo_signup&error=firebase_error';
  }
};

// Stripe checkout redirect
export const redirectToStripeCheckout = async (
  priceId: string = 'price_1OqX2X2X2X2X2X2X2X2X2X2X',
  source: string = 'quota_modal'
) => {
  try {
    trackEvent('demo_checkout_attempted', { source, price_id: priceId });
    
    // Create checkout session
    const response = await fetch('/api/v1/subscription/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: `${window.location.origin}/dashboard?source=demo_checkout`,
        cancel_url: `${window.location.origin}/demo?source=demo_checkout_cancelled`,
        metadata: {
          source,
          demo_user: 'true',
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    const { session_url } = await response.json();
    
    trackEvent('demo_checkout_session_created', { 
      source, 
      price_id: priceId,
      session_url 
    });
    
    // Redirect to Stripe checkout
    window.location.href = session_url;
  } catch (error: any) {
    trackEvent('demo_checkout_failed', { 
      source, 
      price_id: priceId,
      error: error.message 
    });
    
    console.error('Stripe checkout error:', error);
    
    // Fallback to pricing page
    window.location.href = '/pricing?source=demo_checkout_error';
  }
};

// Manual signup redirect (fallback)
export const redirectToManualSignup = (source: string = 'quota_modal') => {
  trackEvent('demo_manual_signup_redirect', { source });
  window.location.href = `/auth?source=${source}`;
};

// Pricing page redirect
export const redirectToPricing = (source: string = 'quota_modal') => {
  trackEvent('demo_pricing_redirect', { source });
  window.location.href = `/pricing?source=${source}`;
};

// Dashboard redirect (after successful signup)
export const redirectToDashboard = (source: string = 'quota_modal') => {
  trackEvent('demo_dashboard_redirect', { source });
  window.location.href = `/dashboard?source=${source}`;
};

// Utility to get current user info
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Utility to check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Utility to sign out
export const signOut = async () => {
  try {
    await auth.signOut();
    trackEvent('demo_user_signout');
    window.location.href = '/demo';
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// Utility to get user's subscription status
export const getUserSubscriptionStatus = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const response = await fetch('/api/v1/subscription/status', {
      headers: {
        'Authorization': `Bearer ${await user.getIdToken()}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
}; 
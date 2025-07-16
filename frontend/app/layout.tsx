'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { UserModeProvider } from '@/context/UserModeContext'
import UserModeGate from '@/components/UserModeGate/UserModeGate'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { PWAServiceWorker } from '@/components/PWAServiceWorker'
import ErrorBoundary from '@/components/ErrorBoundary'
import { PostHogProvider } from '@/components/posthog-provider'
import { getSecurityHeaders } from '@/lib/security'
import { measurePageLoad } from '@/lib/performance'

// Stripe integration (optional, safe fallback if not configured)
let Elements: React.ComponentType<{ children: React.ReactNode; stripe?: any }> = ({ children }) => <>{children}</>
let stripePromise: any = null
try {
  // Use direct imports if available
  // @ts-ignore
  Elements = require('@stripe/react-stripe-js').Elements
  // @ts-ignore
  stripePromise = require('@/lib/stripe').stripePromise
} catch (e) {
  // Stripe not available, fallback to no-op
  console.warn('Stripe modules not found, Stripe features will be disabled.')
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Initialize performance monitoring
  if (typeof window !== 'undefined') {
    measurePageLoad()
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserModeProvider>
            <ErrorBoundary>
              <PostHogProvider>
                <Elements stripe={stripePromise}>
                  <div className="relative">
                    <UserModeGate>
                      <Suspense fallback={<LoadingScreen />}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            {children}
                          </motion.div>
                        </AnimatePresence>
                      </Suspense>
                    </UserModeGate>
                    
                    {/* PWA Components */}
                    <PWAInstallPrompt />
                    <PWAServiceWorker />
                    
                    <ToastContainer
                      position="bottom-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="colored"
                    />
                  </div>
                </Elements>
              </PostHogProvider>
            </ErrorBoundary>
          </UserModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import posthog from 'posthog-js'

type PostHogContextType = {
  posthog: typeof posthog | null
  isLoaded: boolean
}

const PostHogContext = createContext<PostHogContextType>({
  posthog: null,
  isLoaded: false,
})

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

    if (posthogKey && typeof window !== 'undefined') {
      posthog.init(posthogKey, {
        api_host: 'https://app.posthog.com',
        loaded: (posthog) => {
          setIsLoaded(true)
        },
        capture_pageview: false,
      })
    }
  }, [])

  return (
    <PostHogContext.Provider value={{ posthog: isLoaded ? posthog : null, isLoaded }}>
      {children}
    </PostHogContext.Provider>
  )
}

export const usePostHog = () => {
  const context = useContext(PostHogContext)
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider')
  }
  return context
} 
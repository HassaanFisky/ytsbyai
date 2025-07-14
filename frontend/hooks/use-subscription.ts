'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface Subscription {
  id: string
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
  plan: 'free' | 'pro' | 'enterprise'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  usage: {
    summariesUsed: number
    summariesLimit: number
  }
}

interface BillingPortalSession {
  url: string
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscription()
    } else {
      setIsLoading(false)
      setSubscription(null)
    }
  }, [isAuthenticated, user])

  const fetchSubscription = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await fetch('/api/subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error: any) {
      console.error('Error fetching subscription:', error)
      setError(error.message || 'Failed to load subscription')
      // Set default free subscription
      setSubscription({
        id: 'free',
        status: 'active',
        plan: 'free',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        usage: {
          summariesUsed: 0,
          summariesLimit: 5
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      setError(null)
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/app?success=true`,
          cancelUrl: `${window.location.origin}/app?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      return { success: true, url: data.url }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create checkout session'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const createBillingPortalSession = async (): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      setError(null)
      
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/app`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create billing portal session')
      }

      const data: BillingPortalSession = await response.json()
      return { success: true, url: data.url }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create billing portal session'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const cancelSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      // Refresh subscription data
      await fetchSubscription()
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to cancel subscription'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const reactivateSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
      }

      // Refresh subscription data
      await fetchSubscription()
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reactivate subscription'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const getUsagePercentage = (): number => {
    if (!subscription?.usage) return 0
    return Math.round((subscription.usage.summariesUsed / subscription.usage.summariesLimit) * 100)
  }

  const isSubscriptionActive = (): boolean => {
    return subscription?.status === 'active' || subscription?.status === 'trialing'
  }

  const isSubscriptionCancelled = (): boolean => {
    return subscription?.cancelAtPeriodEnd === true
  }

  const getDaysUntilExpiry = (): number => {
    if (!subscription?.currentPeriodEnd) return 0
    const expiryDate = new Date(subscription.currentPeriodEnd)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const subscriptionStatus = subscription?.status || 'inactive'

  return {
    subscription,
    subscriptionStatus,
    isLoading,
    error,
    isSubscriptionActive,
    isSubscriptionCancelled,
    getUsagePercentage,
    getDaysUntilExpiry,
    createCheckoutSession,
    createBillingPortalSession,
    cancelSubscription,
    reactivateSubscription,
    refreshSubscription: fetchSubscription
  }
} 
import { loadStripe, Stripe } from '@stripe/stripe-js'

// This stub lazily initializes Stripe in the browser if the publishable key is present.
// At build time on environments where Stripe isn\'t configured, this file still compiles
// because the publishable key is read from an environment variable that may be undefined.
// The consuming code is expected to gracefully handle a `null` promise.

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

export const stripePromise: Promise<Stripe | null> =
  publishableKey ? loadStripe(publishableKey) : Promise.resolve(null)
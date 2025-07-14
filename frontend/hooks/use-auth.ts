'use client'

import { useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'

interface User {
  id: string
  email: string
  name?: string
  photoURL?: string
  emailVerified: boolean
}

interface AuthError {
  code: string
  message: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true)
      
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified
        }
        setUser(userData)
        setIsAuthenticated(true)
        setError(null)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      setIsLoading(true)
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with name if provided
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        })
      }
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setError(null)
      await firebaseSignOut(auth)
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code)
      setError(errorMessage)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates)
        return { success: true }
      }
      return { success: false, error: 'No user logged in' }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    clearError
  }
} 
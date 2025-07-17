import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!auth) throw new Error('Auth not initialized');
    
    setAuthLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }
      
      toast.success('Account created successfully!');
      return firebaseUser;
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const firebaseError = error as { message?: string };
      toast.error(firebaseError.message || 'Failed to create account');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth not initialized');
    
    setAuthLoading(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast.success('Signed in successfully!');
      return firebaseUser;
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const firebaseError = error as { message?: string };
      toast.error(firebaseError.message || 'Failed to sign in');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) throw new Error('Auth not initialized');
    
    setAuthLoading(true);
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const firebaseError = error as { message?: string };
      toast.error(firebaseError.message || 'Failed to sign out');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!auth || !auth.currentUser) return;
    
    setAuthLoading(true);
    try {
      await updateProfile(auth.currentUser, updates);
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      const firebaseError = error as { message?: string };
      toast.error(firebaseError.message || 'Failed to update profile');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    loading,
    authLoading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
  };
};
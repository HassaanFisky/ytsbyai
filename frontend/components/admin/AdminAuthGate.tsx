'use client';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ children }) => {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Admin email whitelist
  const ADMIN_EMAILS = [
    "admin@ytsbyai.com",
    "founder@ytsbyai.com", 
    "growth@ytsbyai.com",
    "analytics@ytsbyai.com"
  ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const userEmail = user.email;
        const isUserAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
      setIsCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user]);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Authentication Error
            </CardTitle>
            <CardDescription>
              There was an error with the authentication system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
            <Button onClick={handleSignIn} className="w-full mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Please sign in with your admin account to access the analytics dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignIn} className="w-full">
              Sign in with Google
            </Button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Only authorized admin accounts can access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Your account does not have admin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Signed in as: <strong>{user.email}</strong>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSignOut} variant="outline" className="flex-1">
                Sign Out
              </Button>
              <Button onClick={handleSignIn} className="flex-1">
                Try Different Account
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Contact the system administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome, {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Admin Access
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminAuthGate; 
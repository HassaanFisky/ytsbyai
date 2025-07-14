'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserMode, applyUserMode } from '@/styles/themes/userThemes';

interface UserModeContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  isModeActive: (mode: UserMode) => boolean;
  getModeDescription: (mode: UserMode) => string;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

interface UserModeProviderProps {
  children: ReactNode;
  initialMode?: UserMode;
}

export function UserModeProvider({ children, initialMode = 'default' }: UserModeProviderProps) {
  const [userMode, setUserModeState] = useState<UserMode>(initialMode);

  // Load user mode from localStorage on mount
  useEffect(() => {
    const storedMode = localStorage.getItem('userMode') as UserMode;
    if (storedMode && ['teen', 'pro', 'adhd', 'default'].includes(storedMode)) {
      setUserModeState(storedMode);
    }
  }, []);

  // Apply theme when user mode changes
  useEffect(() => {
    applyUserMode(userMode);
    localStorage.setItem('userMode', userMode);
  }, [userMode]);

  const setUserMode = (mode: UserMode) => {
    setUserModeState(mode);
  };

  const isModeActive = (mode: UserMode) => {
    return userMode === mode;
  };

  const getModeDescription = (mode: UserMode): string => {
    const descriptions = {
      teen: 'Vibrant, social, and fun interface for teenagers',
      pro: 'Clean, professional interface for business users',
      adhd: 'High contrast, simplified interface for ADHD users',
      default: 'Standard interface for general users',
    };
    return descriptions[mode];
  };

  const value: UserModeContextType = {
    userMode,
    setUserMode,
    isModeActive,
    getModeDescription,
  };

  return (
    <UserModeContext.Provider value={value}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}

// Hook for conditional rendering based on user mode
export function useUserModeConditional() {
  const { userMode, isModeActive } = useUserMode();
  
  return {
    isTeen: isModeActive('teen'),
    isPro: isModeActive('pro'),
    isADHD: isModeActive('adhd'),
    isDefault: isModeActive('default'),
    userMode,
  };
}

// Hook for theme classes based on user mode
export function useUserModeTheme() {
  const { userMode } = useUserMode();
  
  const getThemeClass = (element: string) => {
    const themeClasses = {
      teen: {
        background: 'bg-gradient-to-br from-pink-50 to-purple-50',
        text: 'text-purple-800',
        button: 'bg-gradient-to-r from-pink-500 to-purple-500',
      },
      pro: {
        background: 'bg-gradient-to-br from-gray-50 to-slate-50',
        text: 'text-gray-800',
        button: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      },
      adhd: {
        background: 'bg-gradient-to-br from-orange-50 to-red-50',
        text: 'text-orange-800',
        button: 'bg-gradient-to-r from-orange-400 to-red-500',
      },
      default: {
        background: 'bg-gradient-to-br from-blue-50 to-purple-50',
        text: 'text-gray-800',
        button: 'bg-gradient-to-r from-blue-500 to-purple-500',
      },
    };
    
    return themeClasses[userMode][element as keyof typeof themeClasses[typeof userMode]] || '';
  };
  
  return { getThemeClass, userMode };
} 
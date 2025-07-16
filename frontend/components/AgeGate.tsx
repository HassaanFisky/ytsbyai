'use client';

import { useState, useEffect } from 'react';
import { useAgeTheme } from '@/lib/useAgeTheme';

interface AgeGateProps {
  children: React.ReactNode;
  onAgeSubmit?: (age: number, category: string) => void;
}

export default function AgeGate({ children, onAgeSubmit }: AgeGateProps) {
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { ageCategory, setAgeCategory, theme, animations, getAgeGroup, getEmoji } = useAgeTheme();

  useEffect(() => {
    // Check if age is already stored
    const storedAge = localStorage.getItem('userAge');
    const storedCategory = localStorage.getItem('ageCategory');
    
    if (storedAge && storedCategory) {
      setAgeCategory(storedCategory as any);
      setIsLoading(false);
    } else {
      setShowAgeGate(true);
      setIsLoading(false);
    }
  }, [setAgeCategory]);

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age);
    
    if (ageNum >= 1 && ageNum <= 120) {
      const category = getAgeGroup(ageNum);
      
      localStorage.setItem('userAge', ageNum.toString());
      localStorage.setItem('ageCategory', category);
      
      setAgeCategory(category);
      setShowAgeGate(false);
      
      if (onAgeSubmit) {
        onAgeSubmit(ageNum, category);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showAgeGate) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
        <div className={`max-w-md w-full mx-4 p-8 ${theme.card} ${animations.entrance}`}>
          <div className="text-center space-y-6">
            <div className={`${theme.emoji}`}>
              {getEmoji(ageCategory)}
            </div>
            
            <h1 className={`text-3xl font-bold ${theme.text}`}>
              Welcome to YTS by AI!
            </h1>
            
            <p className={`text-lg ${theme.subtext}`}>
              Let's personalize your experience. How old are you?
            </p>

            <form onSubmit={handleAgeSubmit} className="space-y-4">
              <div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  className={`w-full px-4 py-3 ${theme.input} ${(theme as any).getFontSize ? (theme as any).getFontSize(ageCategory) : ''}`}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={!age || parseInt(age) < 1 || parseInt(age) > 120}
                className={`w-full py-3 px-6 font-semibold transition-all duration-300 ${theme.button} ${animations.button}`}
              >
                Start My Journey
              </button>
            </form>

            <p className={`text-sm ${theme.subtext}`}>
              We'll customize your experience based on your age group
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${animations.page}`}>
      {children}
    </div>
  );
} 
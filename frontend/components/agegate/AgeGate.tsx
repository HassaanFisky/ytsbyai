'use client';

import React, { useState, useEffect } from 'react';
import { useUserMode } from '@/context/UserModeContext';

interface AgeGateProps {
  children: React.ReactNode;
  onAgeSubmit?: (age: number, category: string) => void;
}

interface AgeCategory {
  name: string;
  range: [number, number];
  mode: 'teen' | 'pro' | 'adhd' | 'default';
  description: string;
  color: string;
}

const AGE_CATEGORIES: AgeCategory[] = [
  {
    name: 'Teen',
    range: [13, 19],
    mode: 'teen',
    description: 'Fun, social, and engaging experience',
    color: 'from-pink-500 to-purple-500'
  },
  {
    name: 'Young Adult',
    range: [20, 25],
    mode: 'default',
    description: 'Balanced and versatile experience',
    color: 'from-blue-500 to-purple-500'
  },
  {
    name: 'Professional',
    range: [26, 65],
    mode: 'pro',
    description: 'Detailed and analytical experience',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    name: 'Senior',
    range: [66, 100],
    mode: 'adhd',
    description: 'Clear and focused experience',
    color: 'from-orange-400 to-red-500'
  }
];

export default function AgeGate({ children, onAgeSubmit }: AgeGateProps) {
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [age, setAge] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgeCategory | null>(null);
  const { setUserMode } = useUserMode();

  useEffect(() => {
    // Check if user has already set their age
    const userAge = localStorage.getItem('userAge');
    const userMode = localStorage.getItem('userMode');
    
    if (!userAge || !userMode) {
      setShowAgeGate(true);
    }
  }, []);

  const getAgeCategory = (userAge: number): AgeCategory => {
    return AGE_CATEGORIES.find(cat => 
      userAge >= cat.range[0] && userAge <= cat.range[1]
    ) || AGE_CATEGORIES[1]; // Default to Young Adult
  };

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userAge = parseInt(age);
    
    if (userAge >= 13 && userAge <= 100) {
      const category = getAgeCategory(userAge);
      setSelectedCategory(category);
      
      // Set user mode based on age category
      setUserMode(category.mode);
      
      // Store age in localStorage
      localStorage.setItem('userAge', userAge.toString());
      localStorage.setItem('userMode', category.mode);
      
      // Call callback if provided
      if (onAgeSubmit) {
        onAgeSubmit(userAge, category.name);
      }
      
      // Close age gate after a brief delay to show the category
      setTimeout(() => {
        setShowAgeGate(false);
      }, 2000);
    }
  };

  const handleSkip = () => {
    setUserMode('default');
    localStorage.setItem('userMode', 'default');
    setShowAgeGate(false);
  };

  if (!showAgeGate) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {!selectedCategory ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to YTS by AI! 🎉
              </h2>
              <p className="text-gray-600">
                Let's personalize your experience based on your age
              </p>
            </div>

            <form onSubmit={handleAgeSubmit} className="space-y-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  How old are you?
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="13"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your age"
                  required
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Age Categories:</h3>
                {AGE_CATEGORIES.map((category) => (
                  <div
                    key={category.name}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Set My Experience
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${selectedCategory.color} flex items-center justify-center`}>
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {selectedCategory.name} Mode Activated!
            </h3>
            <p className="text-gray-600">
              {selectedCategory.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
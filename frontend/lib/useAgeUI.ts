import { useState, useEffect } from 'react';

export type AgeCategory = 'teen' | 'young' | 'adult' | 'mature' | 'senior';

interface ThemeConfig {
  background: string;
  card: string;
  text: string;
  subtext: string;
  emoji: string;
  input: string;
  button: string;
}

interface AnimationConfig {
  entrance: string;
  button: string;
  page: string;
}

const ageThemes: Record<AgeCategory, ThemeConfig> = {
  teen: {
    background: 'bg-gradient-to-br from-pink-100 to-purple-100',
    card: 'bg-white/90 backdrop-blur-sm border border-pink-200',
    text: 'text-purple-800',
    subtext: 'text-purple-600',
    emoji: 'animate-bounce',
    input: 'border-pink-300 focus:ring-pink-500 focus:border-pink-500',
    button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
  },
  young: {
    background: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    card: 'bg-white/90 backdrop-blur-sm border border-blue-200',
    text: 'text-indigo-800',
    subtext: 'text-indigo-600',
    emoji: 'animate-pulse',
    input: 'border-blue-300 focus:ring-blue-500 focus:border-blue-500',
    button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
  },
  adult: {
    background: 'bg-gradient-to-br from-gray-50 to-slate-100',
    card: 'bg-white/95 backdrop-blur-sm border border-gray-200',
    text: 'text-gray-800',
    subtext: 'text-gray-600',
    emoji: 'animate-none',
    input: 'border-gray-300 focus:ring-gray-500 focus:border-gray-500',
    button: 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white shadow-md hover:shadow-lg'
  },
  mature: {
    background: 'bg-gradient-to-br from-amber-50 to-orange-100',
    card: 'bg-white/90 backdrop-blur-sm border border-amber-200',
    text: 'text-amber-800',
    subtext: 'text-amber-600',
    emoji: 'animate-none',
    input: 'border-amber-300 focus:ring-amber-500 focus:border-amber-500',
    button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg'
  },
  senior: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-100',
    card: 'bg-white/95 backdrop-blur-sm border border-green-200',
    text: 'text-emerald-800',
    subtext: 'text-emerald-600',
    emoji: 'animate-none',
    input: 'border-green-300 focus:ring-green-500 focus:border-green-500',
    button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg'
  }
};

const ageAnimations: Record<AgeCategory, AnimationConfig> = {
  teen: {
    entrance: 'animate-fade-in-scale',
    button: 'hover:scale-105 active:scale-95',
    page: 'animate-fade-in'
  },
  young: {
    entrance: 'animate-slide-in-bottom',
    button: 'hover:scale-105 active:scale-95',
    page: 'animate-fade-in'
  },
  adult: {
    entrance: 'animate-fade-in',
    button: 'hover:scale-102 active:scale-98',
    page: 'animate-fade-in'
  },
  mature: {
    entrance: 'animate-fade-in',
    button: 'hover:scale-102 active:scale-98',
    page: 'animate-fade-in'
  },
  senior: {
    entrance: 'animate-fade-in',
    button: 'hover:scale-102 active:scale-98',
    page: 'animate-fade-in'
  }
};

export function useAgeUI() {
  const [ageCategory, setAgeCategoryState] = useState<AgeCategory>('adult');

  useEffect(() => {
    // Load age category from localStorage on mount
    const storedCategory = localStorage.getItem('ageCategory') as AgeCategory;
    if (storedCategory && ageThemes[storedCategory]) {
      setAgeCategoryState(storedCategory);
    }
  }, []);

  const setAgeCategory = (category: AgeCategory) => {
    setAgeCategoryState(category);
    localStorage.setItem('ageCategory', category);
  };

  const theme = ageThemes[ageCategory];
  const animations = ageAnimations[ageCategory];

  return {
    ageCategory,
    setAgeCategory,
    theme,
    animations,
    // Utility functions
    getAgeGroup: (age: number): AgeCategory => {
      if (age < 18) return 'teen';
      if (age < 30) return 'young';
      if (age < 50) return 'adult';
      if (age < 65) return 'mature';
      return 'senior';
    },
    getAgeDescription: (category: AgeCategory): string => {
      const descriptions = {
        teen: 'Teen (13-17) - Fun, vibrant, and energetic',
        young: 'Young Adult (18-29) - Modern and dynamic',
        adult: 'Adult (30-49) - Professional and balanced',
        mature: 'Mature (50-64) - Refined and comfortable',
        senior: 'Senior (65+) - Clear and accessible'
      };
      return descriptions[category];
    }
  };
} 
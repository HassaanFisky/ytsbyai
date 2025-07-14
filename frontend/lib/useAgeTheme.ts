import { useState, useEffect } from 'react';

export type AgeCategory = 'kid' | 'teen' | 'young' | 'adult' | 'senior';

interface ThemeConfig {
  background: string;
  card: string;
  text: string;
  subtext: string;
  emoji: string;
  input: string;
  button: string;
  accent: string;
  shadow: string;
  animation: string;
}

interface AnimationConfig {
  entrance: string;
  button: string;
  page: string;
  hover: string;
}

const ageThemes: Record<AgeCategory, ThemeConfig> = {
  kid: {
    background: 'bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100',
    card: 'bg-white/95 backdrop-blur-sm border-2 border-yellow-200 rounded-2xl',
    text: 'text-orange-800 font-bold',
    subtext: 'text-orange-600',
    emoji: 'text-4xl animate-bounce',
    input: 'border-2 border-orange-300 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 rounded-xl',
    button: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl rounded-xl',
    accent: 'text-orange-500',
    shadow: 'shadow-2xl',
    animation: 'animate-pulse'
  },
  teen: {
    background: 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
    card: 'bg-white/90 backdrop-blur-sm border border-pink-200 rounded-xl',
    text: 'text-purple-800 font-semibold',
    subtext: 'text-purple-600',
    emoji: 'text-3xl animate-bounce',
    input: 'border-pink-300 focus:ring-pink-500 focus:border-pink-500 rounded-lg',
    button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl rounded-lg',
    accent: 'text-purple-500',
    shadow: 'shadow-lg',
    animation: 'animate-pulse'
  },
  young: {
    background: 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100',
    card: 'bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg',
    text: 'text-indigo-800',
    subtext: 'text-indigo-600',
    emoji: 'text-2xl animate-pulse',
    input: 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg',
    button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg rounded-lg',
    accent: 'text-indigo-500',
    shadow: 'shadow-md',
    animation: 'animate-fade-in'
  },
  adult: {
    background: 'bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100',
    card: 'bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg',
    text: 'text-gray-800',
    subtext: 'text-gray-600',
    emoji: 'text-xl',
    input: 'border-gray-300 focus:ring-gray-500 focus:border-gray-500 rounded-md',
    button: 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white shadow-sm hover:shadow-md rounded-md',
    accent: 'text-gray-600',
    shadow: 'shadow-sm',
    animation: 'animate-fade-in'
  },
  senior: {
    background: 'bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100',
    card: 'bg-white/95 backdrop-blur-sm border-2 border-green-200 rounded-lg',
    text: 'text-emerald-800 font-semibold',
    subtext: 'text-emerald-600',
    emoji: 'text-2xl',
    input: 'border-2 border-green-300 focus:ring-4 focus:ring-green-200 focus:border-green-500 rounded-lg text-lg',
    button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg rounded-lg text-lg',
    accent: 'text-emerald-600',
    shadow: 'shadow-md',
    animation: 'animate-fade-in'
  }
};

const ageAnimations: Record<AgeCategory, AnimationConfig> = {
  kid: {
    entrance: 'animate-bounce-in',
    button: 'hover:scale-110 active:scale-95',
    page: 'animate-fade-in-scale',
    hover: 'hover:scale-105'
  },
  teen: {
    entrance: 'animate-fade-in-scale',
    button: 'hover:scale-105 active:scale-95',
    page: 'animate-fade-in',
    hover: 'hover:scale-102'
  },
  young: {
    entrance: 'animate-slide-in-bottom',
    button: 'hover:scale-105 active:scale-98',
    page: 'animate-fade-in',
    hover: 'hover:scale-102'
  },
  adult: {
    entrance: 'animate-fade-in',
    button: 'hover:scale-102 active:scale-98',
    page: 'animate-fade-in',
    hover: 'hover:scale-101'
  },
  senior: {
    entrance: 'animate-fade-in',
    button: 'hover:scale-102 active:scale-98',
    page: 'animate-fade-in',
    hover: 'hover:scale-101'
  }
};

export function useAgeTheme() {
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
    // Enhanced utility functions
    getAgeGroup: (age: number): AgeCategory => {
      if (age < 13) return 'kid';
      if (age < 18) return 'teen';
      if (age < 30) return 'young';
      if (age < 50) return 'adult';
      return 'senior';
    },
    getAgeDescription: (category: AgeCategory): string => {
      const descriptions = {
        kid: 'Kid (Under 13) - Fun, colorful, and playful',
        teen: 'Teen (13-17) - Vibrant, energetic, and social',
        young: 'Young Adult (18-29) - Modern, dynamic, and tech-savvy',
        adult: 'Adult (30-49) - Professional, balanced, and efficient',
        senior: 'Senior (50+) - Clear, accessible, and comfortable'
      };
      return descriptions[category];
    },
    getEmoji: (category: AgeCategory): string => {
      const emojis = {
        kid: '🎈',
        teen: '🎯',
        young: '🚀',
        adult: '💼',
        senior: '🌱'
      };
      return emojis[category];
    },
    getFontSize: (category: AgeCategory): string => {
      const sizes = {
        kid: 'text-lg',
        teen: 'text-base',
        young: 'text-base',
        adult: 'text-sm',
        senior: 'text-lg'
      };
      return sizes[category];
    }
  };
} 
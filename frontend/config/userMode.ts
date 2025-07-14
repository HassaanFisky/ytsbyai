import { UserMode } from '@/styles/themes/userThemes';

export interface UserModeConfig {
  id: UserMode;
  name: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
  isAccessible: boolean;
}

export const userModeConfigs: Record<UserMode, UserModeConfig> = {
  teen: {
    id: 'teen',
    name: 'Teen Mode',
    description: 'Vibrant, social, and fun interface designed for teenagers',
    features: [
      'Social media integration',
      'Vibrant colors and animations',
      'Emoji and fun elements',
      'Quick sharing features',
      'Trending content focus'
    ],
    icon: '🎮',
    color: 'pink',
    isAccessible: false,
  },
  pro: {
    id: 'pro',
    name: 'Professional Mode',
    description: 'Clean, efficient interface for business and productivity',
    features: [
      'Minimalist design',
      'Productivity tools',
      'Time tracking',
      'Professional color scheme',
      'Keyboard shortcuts'
    ],
    icon: '💼',
    color: 'blue',
    isAccessible: true,
  },
  adhd: {
    id: 'adhd',
    name: 'ADHD-Friendly Mode',
    description: 'High contrast, simplified interface for users with ADHD',
    features: [
      'High contrast colors',
      'Larger text and buttons',
      'Reduced distractions',
      'Focus timers',
      'Clear visual hierarchy'
    ],
    icon: '🎯',
    color: 'orange',
    isAccessible: true,
  },
  default: {
    id: 'default',
    name: 'Standard Mode',
    description: 'Balanced interface for general users',
    features: [
      'Standard design',
      'Good readability',
      'Moderate animations',
      'Universal accessibility',
      'Familiar interface'
    ],
    icon: '🌟',
    color: 'purple',
    isAccessible: true,
  },
};

// Auto-detection logic for user modes
export const detectUserMode = (): UserMode => {
  // Check for stored preference
  const storedMode = localStorage.getItem('userMode') as UserMode;
  if (storedMode && userModeConfigs[storedMode]) {
    return storedMode;
  }

  // Check for accessibility preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  if (prefersHighContrast || prefersReducedMotion) {
    return 'adhd';
  }

  // Check for professional indicators (work hours, etc.)
  const currentHour = new Date().getHours();
  const isWorkHours = currentHour >= 9 && currentHour <= 17;
  
  if (isWorkHours) {
    return 'pro';
  }

  // Default to standard mode
  return 'default';
};

// Mode switching utilities
export const switchUserMode = (mode: UserMode) => {
  localStorage.setItem('userMode', mode);
  window.location.reload(); // Simple approach - could be more sophisticated
};

// Feature detection
export const hasFeature = (mode: UserMode, feature: string): boolean => {
  const config = userModeConfigs[mode];
  return config.features.includes(feature);
};

// Accessibility helpers
export const isAccessibleMode = (mode: UserMode): boolean => {
  return userModeConfigs[mode].isAccessible;
};

// Mode-specific settings
export const getModeSettings = (mode: UserMode) => {
  const settings = {
    teen: {
      animationSpeed: 'fast',
      colorIntensity: 'high',
      socialFeatures: true,
      distractionLevel: 'medium',
    },
    pro: {
      animationSpeed: 'slow',
      colorIntensity: 'low',
      socialFeatures: false,
      distractionLevel: 'low',
    },
    adhd: {
      animationSpeed: 'minimal',
      colorIntensity: 'high',
      socialFeatures: false,
      distractionLevel: 'very-low',
    },
    default: {
      animationSpeed: 'medium',
      colorIntensity: 'medium',
      socialFeatures: false,
      distractionLevel: 'low',
    },
  };
  
  return settings[mode];
};

// Export all modes for easy access
export const allModes: UserMode[] = ['teen', 'pro', 'adhd', 'default']; 
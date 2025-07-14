export type UserMode = 'teen' | 'pro' | 'adhd' | 'default';

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  typography: {
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  animations: {
    duration: string;
    easing: string;
  };
  accessibility: {
    focusRing: string;
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

export const userThemes: Record<UserMode, ThemeConfig> = {
  teen: {
    colors: {
      primary: 'from-pink-500 to-purple-500',
      secondary: 'from-purple-500 to-indigo-500',
      accent: 'bg-pink-400',
      background: 'bg-gradient-to-br from-pink-50 to-purple-50',
      text: 'text-purple-800',
      border: 'border-pink-200',
    },
    spacing: {
      small: 'p-2',
      medium: 'p-4',
      large: 'p-6',
    },
    typography: {
      fontSize: {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xlarge: 'text-xl',
      },
      fontWeight: {
        normal: 'font-normal',
        medium: 'font-medium',
        bold: 'font-bold',
      },
    },
    animations: {
      duration: 'duration-300',
      easing: 'ease-out',
    },
    accessibility: {
      focusRing: 'focus:ring-2 focus:ring-pink-500',
      highContrast: false,
      reducedMotion: false,
    },
  },
  pro: {
    colors: {
      primary: 'from-blue-600 to-indigo-600',
      secondary: 'from-gray-600 to-slate-600',
      accent: 'bg-blue-500',
      background: 'bg-gradient-to-br from-gray-50 to-slate-50',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
    spacing: {
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6',
    },
    typography: {
      fontSize: {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xlarge: 'text-xl',
      },
      fontWeight: {
        normal: 'font-normal',
        medium: 'font-medium',
        bold: 'font-semibold',
      },
    },
    animations: {
      duration: 'duration-200',
      easing: 'ease-in-out',
    },
    accessibility: {
      focusRing: 'focus:ring-2 focus:ring-blue-500',
      highContrast: false,
      reducedMotion: false,
    },
  },
  adhd: {
    colors: {
      primary: 'from-orange-400 to-red-500',
      secondary: 'from-red-500 to-orange-500',
      accent: 'bg-orange-500',
      background: 'bg-gradient-to-br from-orange-50 to-red-50',
      text: 'text-orange-800',
      border: 'border-orange-300',
    },
    spacing: {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8',
    },
    typography: {
      fontSize: {
        small: 'text-lg',
        medium: 'text-xl',
        large: 'text-2xl',
        xlarge: 'text-3xl',
      },
      fontWeight: {
        normal: 'font-semibold',
        medium: 'font-bold',
        bold: 'font-extrabold',
      },
    },
    animations: {
      duration: 'duration-500',
      easing: 'ease-out',
    },
    accessibility: {
      focusRing: 'focus:ring-4 focus:ring-orange-500',
      highContrast: true,
      reducedMotion: false,
    },
  },
  default: {
    colors: {
      primary: 'from-blue-500 to-purple-500',
      secondary: 'from-purple-500 to-pink-500',
      accent: 'bg-blue-500',
      background: 'bg-gradient-to-br from-blue-50 to-purple-50',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
    spacing: {
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6',
    },
    typography: {
      fontSize: {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xlarge: 'text-xl',
      },
      fontWeight: {
        normal: 'font-normal',
        medium: 'font-medium',
        bold: 'font-semibold',
      },
    },
    animations: {
      duration: 'duration-300',
      easing: 'ease-in-out',
    },
    accessibility: {
      focusRing: 'focus:ring-2 focus:ring-blue-500',
      highContrast: false,
      reducedMotion: false,
    },
  },
};

export const getThemeClasses = (mode: UserMode, element: keyof ThemeConfig) => {
  const theme = userThemes[mode];
  return theme[element];
};

export const applyUserMode = (mode: UserMode) => {
  const theme = userThemes[mode];
  
  // Apply to document root
  const root = document.documentElement;
  root.style.setProperty('--primary-gradient', theme.colors.primary);
  root.style.setProperty('--secondary-gradient', theme.colors.secondary);
  root.style.setProperty('--accent-color', theme.colors.accent);
  root.style.setProperty('--background-gradient', theme.colors.background);
  root.style.setProperty('--text-color', theme.colors.text);
  root.style.setProperty('--border-color', theme.colors.border);
  
  // Apply accessibility settings
  if (theme.accessibility.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
  
  if (theme.accessibility.reducedMotion) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }
}; 
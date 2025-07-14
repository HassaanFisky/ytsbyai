import { useEffect, useState } from 'react';

export type UserMode = 'teen' | 'pro' | 'adhd' | 'default';

export interface AutoModeSignals {
  darkMode: boolean;
  reducedMotion: boolean;
  memory: 'low' | 'medium' | 'high' | 'unknown';
  input: 'touch' | 'mouse';
  device: 'mobile' | 'desktop';
  hour: number;
}

export function useAutoMode() {
  const [signals, setSignals] = useState<AutoModeSignals | null>(null);
  const [suggestedMode, setSuggestedMode] = useState<UserMode>('default');

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const deviceMemoryRaw = (navigator as any).deviceMemory;
    let memory: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
    if (deviceMemoryRaw) {
      if (deviceMemoryRaw < 2) memory = 'low';
      else if (deviceMemoryRaw < 4) memory = 'medium';
      else memory = 'high';
    }
    const input = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'touch' : 'mouse';
    const userAgent = navigator.userAgent.toLowerCase();
    const device = /mobile|android|iphone|ipad|ipod/.test(userAgent) ? 'mobile' : 'desktop';
    const hour = new Date().getHours();

    const detected: AutoModeSignals = {
      darkMode,
      reducedMotion,
      memory,
      input,
      device,
      hour,
    };
    setSignals(detected);

    // Suggest mode based on signals
    let mode: UserMode = 'default';
    if (device === 'mobile' && darkMode) mode = 'teen';
    else if (reducedMotion || memory === 'low') mode = 'adhd';
    else if (device === 'desktop' && !darkMode) mode = 'pro';
    else if (hour >= 22 || hour < 6) mode = 'adhd'; // Night = focus mode
    setSuggestedMode(mode);
  }, []);

  return { suggestedMode, signals };
} 
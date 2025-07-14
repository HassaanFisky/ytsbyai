'use client';

import { useState, useEffect } from 'react';
import AgeGate from '@/components/agegate/AgeGate';

export default function UserModeGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const userMode = localStorage.getItem('user_mode');
    if (userMode) setAccepted(true);
  }, []);

  const handleAgeSubmit = (age: number, category: string) => {
    localStorage.setItem('user_age', age.toString());
    localStorage.setItem('user_mode', category);
    setAccepted(true);
  };

  return !accepted
    ? <AgeGate onAgeSubmit={handleAgeSubmit} />
    : <>{children}</>;
}

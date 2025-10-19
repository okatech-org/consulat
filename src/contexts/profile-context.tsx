'use client';

import { createContext, useContext } from 'react';
import type { CompleteProfile } from '@/types/profile';

interface ProfileContextValue {
  profile: CompleteProfile | null;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

interface ProfileProviderProps {
  children: React.ReactNode;
  profile: CompleteProfile | null;
}

export function ProfileProvider({ children, profile }: ProfileProviderProps) {
  return (
    <ProfileContext.Provider value={{ profile }}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

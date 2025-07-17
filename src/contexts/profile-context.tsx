'use client';

import { createContext, useContext } from 'react';
import type { FullProfile } from '@/types/profile';

interface ProfileContextValue {
  profile: FullProfile | null;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

interface ProfileProviderProps {
  children: React.ReactNode;
  profile: FullProfile | null;
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

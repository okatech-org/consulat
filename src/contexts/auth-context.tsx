'use client';

import type { SessionUser } from '@/types/user';
import { createContext, useContext } from 'react';

interface AuthContextValue {
  user: SessionUser | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  user: SessionUser | null;
}

export function AuthProvider({ children, user }: AuthProviderProps) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

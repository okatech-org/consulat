'use client';

import { api } from 'convex/_generated/api';
import { useQuery } from 'convex/react';
import { createContext, useContext } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import type { UserData } from '@/convex/lib/types';

interface AuthContextValue {
  user: UserData;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { userId } = useClerkAuth();
  const userData = useQuery(
    api.functions.user.getUserByClerkId,
    userId ? { clerkUserId: userId, withMembership: true } : 'skip',
  );

  return (
    <AuthContext.Provider
      value={{
        user: userData ?? null,
        loading: userData === undefined && userId !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

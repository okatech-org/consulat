'use client';

import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { createContext, useContext } from 'react';

interface AuthContextValue {
  user: Doc<'users'> | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  userId: string | null;
}

export function AuthProvider({ children, userId }: AuthProviderProps) {
  const userData = useQuery(
    api.functions.user.getUserByClerkId,
    userId ? { clerkUserId: userId } : 'skip',
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

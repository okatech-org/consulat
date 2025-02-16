'use client';

import { createContext, useContext } from 'react';
import { Session } from 'next-auth';
import { User } from '@prisma/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
}

// Create and export the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
});

// Create a custom hook to use the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

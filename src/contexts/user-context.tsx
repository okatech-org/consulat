'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { SessionUser } from '@/lib/user';

interface UserContextType {
  user: SessionUser | null;
  isLoading: boolean;
  updateUser: (userData: Partial<SessionUser>) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchroniser avec la session NextAuth
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (session?.user) {
      setUser(session.user as SessionUser);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [session, status]);

  // Mettre à jour les données utilisateur localement
  const updateUser = (userData: Partial<SessionUser>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    // Optionnel : synchroniser avec la session NextAuth si nécessaire
    // updateSession(updatedUser);
  };

  // Forcer le rafraîchissement depuis la session
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await updateSession();
    } finally {
      setIsLoading(false);
    }
  };

  const value: UserContextType = {
    user,
    isLoading: isLoading || status === 'loading',
    updateUser,
    refreshUser,
    isAuthenticated: !!user && status === 'authenticated',
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook pour utiliser le contexte utilisateur
export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Hook pour vérifier l'authentification
export function useAuth() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  return {
    user,
    isAuthenticated,
    isLoading,
    isGuest: !isAuthenticated && !isLoading,
  };
}

// Hook pour les informations utilisateur spécifiques
export function useUserInfo() {
  const { user } = useCurrentUser();

  return {
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'USER',
    image: user?.image || null,
    id: user?.id || '',
    // Informations dérivées
    displayName: user?.name || user?.email || 'Utilisateur',
    initials: user?.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U',
    hasPhone: !!user?.phoneNumber,
    hasImage: !!user?.image,
  };
}

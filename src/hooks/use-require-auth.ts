'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/user-context';

interface UseRequireAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
}

/**
 * Hook pour protéger les routes qui nécessitent une authentification
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/auth/login', redirectIfAuthenticated = false } = options;
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Attendre que le chargement soit terminé

    if (redirectIfAuthenticated && isAuthenticated) {
      // Rediriger si déjà authentifié (pour les pages login/signup)
      router.push('/dashboard');
      return;
    }

    if (!redirectIfAuthenticated && !isAuthenticated) {
      // Rediriger si pas authentifié (pour les pages protégées)
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, isLoading, redirectTo, redirectIfAuthenticated, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    // Indique si on doit afficher le contenu (évite le flash de contenu)
    shouldRender: isLoading
      ? false
      : redirectIfAuthenticated
        ? !isAuthenticated
        : isAuthenticated,
  };
}

/**
 * Hook spécifique pour protéger les pages qui nécessitent une authentification
 */
export function useRequireAuthenticatedUser() {
  return useRequireAuth();
}

/**
 * Hook spécifique pour rediriger les utilisateurs déjà connectés (pages login/signup)
 */
export function useRedirectIfAuthenticated() {
  return useRequireAuth({ redirectIfAuthenticated: true });
}

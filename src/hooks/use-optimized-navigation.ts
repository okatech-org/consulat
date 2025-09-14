'use client';

import { useRouter, prefetch } from 'next/navigation';
import { useCallback, useTransition, useRef } from 'react';
import { api } from '@/trpc/react';
import { aggressiveCacheConfig } from './use-aggressive-cache';

interface NavigationOptions {
  prefetch?: boolean;
  scroll?: boolean;
  instant?: boolean;
}

export function useOptimizedNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const utils = api.useUtils();
  const prefetchCache = useRef<Set<string>>(new Set());
  const navigationTimeout = useRef<NodeJS.Timeout>();

  // Précharger les données d'une page (avec cache pour éviter les doublons)
  const prefetchPageData = useCallback(async (path: string) => {
    // Si déjà préchargé récemment, ne pas refaire
    if (prefetchCache.current.has(path)) {
      return;
    }

    try {
      prefetchCache.current.add(path);
      
      // Nettoyer le cache après 5 minutes
      setTimeout(() => {
        prefetchCache.current.delete(path);
      }, 5 * 60 * 1000);

      // Précharger selon la route avec configuration de cache agressive
      const promises: Promise<unknown>[] = [];
      
      if (path.includes('/profiles')) {
        promises.push(
          utils.profile.getList.prefetch({
            page: 1,
            limit: 15,
            sort: { field: 'createdAt', order: 'desc' },
            filters: {}
          }, aggressiveCacheConfig),
          utils.intelligence.getDashboardStats.prefetch(
            { period: 'month' }, 
            aggressiveCacheConfig
          )
        );
      } else if (path.includes('/competences')) {
        promises.push(
          utils.skillsDirectory.getDirectory.prefetch({}, aggressiveCacheConfig)
        );
      } else if (path.includes('/carte') || path.includes('/maps')) {
        promises.push(
          utils.intelligence.getProfilesMap.prefetch(
            { filters: undefined }, 
            aggressiveCacheConfig
          )
        );
      } else if (path.includes('/entities')) {
        promises.push(
          utils.intelligence.getProfiles.prefetch(
            { filters: {} }, 
            aggressiveCacheConfig
          )
        );
      } else if (path === '/dashboard') {
        promises.push(
          utils.intelligence.getDashboardStats.prefetch(
            { period: 'month' }, 
            aggressiveCacheConfig
          ),
          utils.profile.getList.prefetch({
            page: 1,
            limit: 10,
            sort: { field: 'createdAt', order: 'desc' }
          }, aggressiveCacheConfig)
        );
      }

      // Précharger la route Next (link prefetch)
      try {
        // @ts-expect-error experimental prefetch (Next 14+/15)
        prefetch?.(path);
      } catch {}

      // Exécuter toutes les requêtes en parallèle (sans bloquer la UI)
      Promise.allSettled(promises);
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    }
  }, [utils]);

  // Navigation optimisée avec transition instantanée
  const navigateTo = useCallback((path: string, options: NavigationOptions = {}) => {
    const { prefetch = true, scroll = true, instant = false } = options;

    // Annuler toute navigation en cours
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
    }

    // Navigation instantanée sans attendre le préchargement
    if (instant) {
      router.push(path);
      if (scroll) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
      }
      // Précharger en arrière-plan après la navigation
      if (prefetch) {
        prefetchPageData(path);
      }
      return;
    }

    // Navigation avec transition pour les cas normaux
    startTransition(async () => {
      // Précharger les données si demandé
      if (prefetch) {
        // Timeout pour ne pas bloquer trop longtemps
        const prefetchPromise = prefetchPageData(path);
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 120));
        await Promise.race([prefetchPromise, timeoutPromise]).catch(() => {});
      }

      // Naviguer immédiatement
      router.push(path);

      // Scroll optimisé
      if (scroll) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
      }
    });
  }, [router, prefetchPageData]);

  // Préchargement au survol optimisé
  const handleMouseEnter = useCallback((path: string) => {
    // Précharger immédiatement si pas déjà fait
    if (!prefetchCache.current.has(path)) {
      // Délai très court pour éviter les survols accidentels
      const timeout = setTimeout(() => {
        prefetchPageData(path);
      }, 50); // Réduit de 200ms à 50ms

      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [prefetchPageData]);

  return {
    navigateTo,
    prefetchPageData,
    handleMouseEnter,
    isPending
  };
}

// Hook pour précharger les données communes au montage
export function usePrefetchCommonData() {
  const utils = api.useUtils();

  const prefetchCommon = useCallback(async () => {
    try {
      await Promise.all([
        utils.countries.getActive.prefetch(),
        utils.notifications.getUnreadCount.prefetch(),
        utils.intelligence.getDashboardStats.prefetch({ period: 'week' })
      ]);
    } catch (error) {
      console.error('Erreur lors du préchargement des données communes:', error);
    }
  }, [utils]);

  return { prefetchCommon };
}

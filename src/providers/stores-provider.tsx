'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { type Locale } from '@/i18n/config';
import { useAppStore } from '@/stores/app-store';
import { useSettingsStore } from '@/stores/settings-store';

interface StoresProviderProps {
  children: ReactNode;
  locale?: Locale; // Rendre la locale optionnelle
}

/**
 * Composant Provider pour initialiser et synchroniser les différents stores
 *
 * Ce composant:
 * - Initialise l'état de l'application
 * - Configure les écouteurs d'événements (online/offline)
 * - Synchronise la locale avec les paramètres du navigateur
 * - Suit les changements de page pour les statistiques
 */
export default function StoresProvider({ children, locale }: StoresProviderProps) {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  // Récupération des actions des stores
  const { setLocale, locale: storeLocale } = useSettingsStore();

  const {
    markAsReady,
    setOnlineStatus,
    incrementPageView,
    recordActivity,
    firstVisit,
    resetFirstVisit,
  } = useAppStore();

  // Synchroniser la locale du store avec next-intl
  useEffect(() => {
    if (currentLocale && currentLocale !== storeLocale) {
      setLocale(currentLocale);
    }
  }, [currentLocale, storeLocale, setLocale]);

  // Initialiser l'application
  useEffect(() => {
    // Marquer l'application comme prête
    markAsReady();

    // Réinitialiser le drapeau de première visite si nécessaire
    if (firstVisit) {
      resetFirstVisit();
    }

    // Configurer les écouteurs d'événements online/offline
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Enregistrer que l'app est active maintenant
    recordActivity();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [markAsReady, setOnlineStatus, recordActivity, firstVisit, resetFirstVisit]);

  // Suivre les changements de page
  useEffect(() => {
    if (pathname) {
      incrementPageView(pathname);
      recordActivity();
    }
  }, [pathname, incrementPageView, recordActivity]);

  // Simplement rendre les enfants
  return <>{children}</>;
}

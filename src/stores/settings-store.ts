'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { locales, type Locale } from '@/i18n/config';

// Type pour les préférences du système
interface SystemPreferences {
  colorScheme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  reduceMotion: boolean;
  highContrast: boolean;
}

interface SettingsState {
  // Paramètres linguistiques
  locale: Locale;
  availableLocales: readonly Locale[];
  
  // Préférences système
  systemPreferences: SystemPreferences;
  
  // Préférences de notification
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  // Actions
  setLocale: (locale: Locale) => void;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  toggleEmailNotifications: () => void;
  togglePushNotifications: () => void;
}

/**
 * Store pour les paramètres et préférences de l'utilisateur
 * 
 * Gère la langue, le thème, et diverses préférences d'accessibilité
 * et de notification. Persiste ces données dans le localStorage.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      // Paramètres linguistiques
      locale: 'fr' as Locale, // Par défaut en français
      availableLocales: locales,
      
      // Préférences système
      systemPreferences: {
        colorScheme: 'system',
        fontSize: 'md',
        reduceMotion: false,
        highContrast: false
      },
      
      // Préférences de notification
      emailNotifications: true,
      pushNotifications: true,
      
      // Actions
      setLocale: (locale) => set((state) => {
        state.locale = locale;
      }),
      
      toggleColorScheme: () => set((state) => {
        if (state.systemPreferences.colorScheme === 'light') {
          state.systemPreferences.colorScheme = 'dark';
        } else if (state.systemPreferences.colorScheme === 'dark') {
          state.systemPreferences.colorScheme = 'system';
        } else {
          state.systemPreferences.colorScheme = 'light';
        }
      }),
      
      setColorScheme: (scheme) => set((state) => {
        state.systemPreferences.colorScheme = scheme;
      }),
      
      setFontSize: (size) => set((state) => {
        state.systemPreferences.fontSize = size;
      }),
      
      toggleReduceMotion: () => set((state) => {
        state.systemPreferences.reduceMotion = !state.systemPreferences.reduceMotion;
      }),
      
      toggleHighContrast: () => set((state) => {
        state.systemPreferences.highContrast = !state.systemPreferences.highContrast;
      }),
      
      toggleEmailNotifications: () => set((state) => {
        state.emailNotifications = !state.emailNotifications;
      }),
      
      togglePushNotifications: () => set((state) => {
        state.pushNotifications = !state.pushNotifications;
      }),
    })),
    {
      name: 'user-settings',
      partialize: (state) => ({
        locale: state.locale,
        systemPreferences: state.systemPreferences,
        emailNotifications: state.emailNotifications,
        pushNotifications: state.pushNotifications,
      }),
    }
  )
); 
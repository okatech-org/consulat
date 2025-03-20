'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // État global de l'application
  isReady: boolean;
  isOnline: boolean;
  hasUpdates: boolean;
  firstVisit: boolean;
  lastActive: number;
  
  // Statistiques
  pageViews: Record<string, number>;
  
  // Actions
  markAsReady: () => void;
  setOnlineStatus: (status: boolean) => void;
  checkForUpdates: () => Promise<void>;
  markUpdateAvailable: () => void;
  clearUpdatesFlag: () => void;
  incrementPageView: (path: string) => void;
  recordActivity: () => void;
  resetFirstVisit: () => void;
}

/**
 * Store pour l'état global de l'application
 * 
 * Gère les informations sur l'état de l'application,
 * la connexion réseau, et les statistiques d'utilisation.
 */
export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // État initial
      isReady: false,
      isOnline: true,
      hasUpdates: false,
      firstVisit: true,
      lastActive: Date.now(),
      pageViews: {},
      
      // Actions
      markAsReady: () => set((state) => {
        state.isReady = true;
      }),
      
      setOnlineStatus: (status) => set((state) => {
        state.isOnline = status;
      }),
      
      checkForUpdates: async () => {
        // Logique pour vérifier les mises à jour
        // (requête au serveur, vérification de version, etc.)
        // Pour l'exemple, on simule un délai
        try {
          // Simuler une requête au serveur
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Décider si une mise à jour est disponible
          const hasUpdate = Math.random() > 0.8; // 20% de chance d'avoir une mise à jour
          
          if (hasUpdate) {
            set((state) => {
              state.hasUpdates = true;
            });
          }
        } catch (error) {
          console.error('Erreur lors de la vérification des mises à jour:', error);
        }
      },
      
      markUpdateAvailable: () => set((state) => {
        state.hasUpdates = true;
      }),
      
      clearUpdatesFlag: () => set((state) => {
        state.hasUpdates = false;
      }),
      
      incrementPageView: (path) => set((state) => {
        if (!path) return;
        
        const currentCount = state.pageViews[path] || 0;
        state.pageViews[path] = currentCount + 1;
      }),
      
      recordActivity: () => set((state) => {
        state.lastActive = Date.now();
      }),
      
      resetFirstVisit: () => set((state) => {
        state.firstVisit = false;
      }),
    })),
    {
      name: 'app-state',
      partialize: (state) => ({
        firstVisit: state.firstVisit,
        lastActive: state.lastActive,
        pageViews: state.pageViews,
      }),
    }
  )
); 
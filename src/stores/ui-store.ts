'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface Dialog {
  id: string;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

interface UIState {
  // Navigation mobile
  isMobileMenuOpen: boolean;
  isSidebarOpen: boolean;
  
  // Dialogues et modales
  dialogs: Record<string, Dialog>;
  
  // État de chargement global
  isLoading: boolean;
  loadingText: string;
  
  // Préférences du thème
  theme: Theme;
  
  // Méthodes pour la navigation
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  toggleSidebar: () => void;
  
  // Méthodes pour les dialogues
  openDialog: (id: string, data?: Record<string, unknown>) => void;
  closeDialog: (id: string) => void;
  isDialogOpen: (id: string) => boolean;
  getDialogData: (id: string) => Record<string, unknown> | undefined;
  
  // Méthodes pour l'état de chargement
  startLoading: (text?: string) => void;
  stopLoading: () => void;
  
  // Méthodes pour la gestion du thème
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Store pour l'état de l'interface utilisateur
 * 
 * Gère les éléments d'UI comme les menus, les dialogues,
 * et les indicateurs de chargement global.
 */
export const useUIStore = create<UIState>()(
  persist(
    immer((set, get) => ({
      // État initial
      isMobileMenuOpen: false,
      isSidebarOpen: false,
      dialogs: {},
      isLoading: false,
      loadingText: '',
      theme: 'system',
      
      // Méthodes pour la navigation
      openMobileMenu: () => set((state) => {
        state.isMobileMenuOpen = true;
      }),
      
      closeMobileMenu: () => set((state) => {
        state.isMobileMenuOpen = false;
      }),
      
      toggleMobileMenu: () => set((state) => {
        state.isMobileMenuOpen = !state.isMobileMenuOpen;
      }),
      
      toggleSidebar: () => set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen;
      }),
      
      // Méthodes pour les dialogues
      openDialog: (id, data) => set((state) => {
        state.dialogs[id] = {
          id,
          isOpen: true,
          data
        };
      }),
      
      closeDialog: (id) => set((state) => {
        if (state.dialogs[id]) {
          state.dialogs[id].isOpen = false;
        }
      }),
      
      isDialogOpen: (id) => {
        return !!get().dialogs[id]?.isOpen;
      },
      
      getDialogData: (id) => {
        return get().dialogs[id]?.data;
      },
      
      // Méthodes pour l'état de chargement
      startLoading: (text = 'Chargement en cours...') => set((state) => {
        state.isLoading = true;
        state.loadingText = text;
      }),
      
      stopLoading: () => set((state) => {
        state.isLoading = false;
        state.loadingText = '';
      }),
      
      // Méthodes pour la gestion du thème
      setTheme: (theme) => set((state) => {
        state.theme = theme;
        
        // Appliquer le thème au document HTML
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System - Vérifier les préférences du système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        }
      }),
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        let newTheme: Theme;
        
        if (currentTheme === 'light') {
          newTheme = 'dark';
        } else if (currentTheme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        
        get().setTheme(newTheme);
      }
    })),
    {
      name: 'ui-preferences',
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme
      }),
    }
  )
); 
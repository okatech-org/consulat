'use client';

import { Session } from '@/lib/auth/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  id?: string;
}

interface UserState {
  // État de l'utilisateur
  isAuthenticated: boolean;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;

  // Actions pour modifier l'état
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => void;

  // Actions pour charger les données
  refreshProfile: () => Promise<void>;
}

/**
 * Store pour la gestion de l'utilisateur courant
 *
 * Centralise les données de l'utilisateur connecté, son profil,
 * et les actions liées à l'authentification.
 */
export const useUserStore = create<UserState>()(
  persist(
    immer((set, get) => ({
      // État initial
      isAuthenticated: false,
      session: null,
      profile: null,
      loading: false,

      // Actions pour modifier l'état
      setSession: (session) =>
        set((state) => {
          state.session = session;
          state.isAuthenticated = !!session;
        }),

      setProfile: (profile) =>
        set((state) => {
          state.profile = profile;
        }),

      logout: () =>
        set((state) => {
          state.session = null;
          state.profile = null;
          state.isAuthenticated = false;
        }),

      // Actions pour charger les données
      refreshProfile: async () => {
        // Si pas d'utilisateur connecté, on ne fait rien
        if (!get().session) return;

        set((state) => {
          state.loading = true;
        });

        try {
          // Ici, on pourrait appeler une API pour récupérer le profil
          // Pour l'instant, on simule avec les données du session
          const { session } = get();

          if (session?.user) {
            set((state) => {
              state.profile = {
                firstName: session.user.name?.split(' ')[0],
                lastName: session.user.name?.split(' ')[1],
                email: session.user.email || undefined,
                id: session.user.id,
                roles: session.user.roles,
              };
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        } finally {
          set((state) => {
            state.loading = false;
          });
        }
      },
    })),
    {
      name: 'user-storage', // Nom du stockage dans localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
      }), // On ne persiste que certaines données
    },
  ),
);

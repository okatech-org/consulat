import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { analyzeProfile } from '@/actions/profile-suggestions';
import { User } from '@prisma/client';

const STORAGE_KEY = 'profile_suggestions';

interface StoredData {
  profileHash: string; // Pour comparer les profiles
  suggestions: ProfileSuggestion[];
  timestamp: number; // Pour potentiellement invalider le cache après un certain temps
}

export interface ProfileSuggestion {
  id: string;
  field: 'documents' | 'contact' | 'family' | 'professional';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: {
    type: 'add' | 'update' | 'complete';
    target: string;
  };
}

// Fonction utilitaire pour générer un hash simple du profil
function generateProfileHash(profile: FullProfile): string {
  // On prend les champs qui nous intéressent pour la comparaison
  const relevantData = {
    id: profile.id,
    updatedAt: profile.updatedAt,
    // Ajoutez d'autres champs pertinents qui pourraient affecter les suggestions
  };
  return JSON.stringify(relevantData);
}

// Fonction utilitaire pour sauvegarder les données
function saveToStorage(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving suggestions to storage:', error);
  }
}

// Fonction utilitaire pour récupérer les données
function getFromStorage(): StoredData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading suggestions from storage:', error);
    return null;
  }
}

export function useProfileSuggestions(profile: FullProfile, user: User) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations('documents.assistant');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Générer le hash du profil actuel
        const currentProfileHash = generateProfileHash(profile);

        // Vérifier le stockage local
        const storedData = getFromStorage();

        // Si on a des données stockées et que le hash correspond
        if (storedData && storedData.profileHash === currentProfileHash) {
          setSuggestions(storedData.suggestions);
          setIsLoading(false);
          return;
        }

        // Sinon, faire l'analyse
        const result = await analyzeProfile(profile, user, locale);

        if (result.suggestions) {
          // Traduire les messages
          const translatedSuggestions = result.suggestions.map(
            (suggestion: ProfileSuggestion) => ({
              ...suggestion,
              message: suggestion.message,
            }),
          );

          // Sauvegarder dans le state
          setSuggestions(translatedSuggestions);

          // Sauvegarder dans le stockage
          saveToStorage({
            profileHash: currentProfileHash,
            suggestions: translatedSuggestions,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError(t('errors.fetch_failed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [profile, t, user]);

  return {
    suggestions,
    isLoading,
    error,
  };
}

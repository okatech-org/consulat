import { useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale, useTranslations } from 'next-intl';
import type { CompleteProfile } from '@/convex/lib/types';
import type { Id } from '@/convex/_generated/dataModel';

const STORAGE_KEY = 'profile_suggestions';

interface StoredData {
  profileHash: string;
  suggestions: ProfileSuggestion[];
  timestamp: number;
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

function generateProfileHash(profile: CompleteProfile): string {
  const relevantData = {
    id: profile._id,
    updatedAt: profile._creationTime,
  };
  return JSON.stringify(relevantData);
}

function saveToStorage(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving suggestions to storage:', error);
  }
}

function getFromStorage(): StoredData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading suggestions from storage:', error);
    return null;
  }
}

export function useProfileSuggestions(profile: CompleteProfile, userId: Id<'users'>) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations('documents.assistant');

  const analyzeProfile = useAction(api.functions.ai.analyzeProfileForSuggestions);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentProfileHash = generateProfileHash(profile);

        const storedData = getFromStorage();

        if (storedData && storedData.profileHash === currentProfileHash) {
          setSuggestions(storedData.suggestions);
          setIsLoading(false);
          return;
        }

        const result = await analyzeProfile({
          userId,
          locale,
        });

        if (result && result.suggestions) {
          const translatedSuggestions = result.suggestions.map(
            (suggestion: ProfileSuggestion) => ({
              ...suggestion,
              message: suggestion.message,
            }),
          );

          setSuggestions(translatedSuggestions);

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
  }, [profile, userId, locale, analyzeProfile, t]);

  return {
    suggestions,
    isLoading,
    error,
  };
}

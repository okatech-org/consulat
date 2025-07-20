'use client';

import { useState, useCallback } from 'react';
import {
  removeBackgroundFromUrl,
  removeBackgroundFromFile,
} from '@/actions/background-removal';
import type { BackgroundRemovalResult } from '@/actions/background-removal';

interface UseBackgroundRemovalOptions {
  onSuccess?: (result: BackgroundRemovalResult) => void;
  onError?: (error: string) => void;
}

interface UseBackgroundRemovalReturn {
  isProcessing: boolean;
  processImageFromUrl: (imageUrl: string) => Promise<BackgroundRemovalResult | null>;
  processImageFromFile: (file: File) => Promise<BackgroundRemovalResult | null>;
  error: string | null;
  clearError: () => void;
}

export function useBackgroundRemoval(
  options: UseBackgroundRemovalOptions = {},
): UseBackgroundRemovalReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processImageFromUrl = useCallback(
    async (imageUrl: string): Promise<BackgroundRemovalResult | null> => {
      if (isProcessing) {
        setError('Un traitement est déjà en cours');
        return null;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const result = await removeBackgroundFromUrl(imageUrl);

        if (result.success) {
          if (onSuccess) {
            onSuccess(result);
          }
          return result;
        } else {
          const errorMessage =
            result.error || "Erreur lors de la suppression de l'arrière-plan";
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
          return result;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression de l'arrière-plan";
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, onSuccess, onError],
  );

  const processImageFromFile = useCallback(
    async (file: File): Promise<BackgroundRemovalResult | null> => {
      if (isProcessing) {
        setError('Un traitement est déjà en cours');
        return null;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const result = await removeBackgroundFromFile(file);

        if (result.success) {
          if (onSuccess) {
            onSuccess(result);
          }
          return result;
        } else {
          const errorMessage =
            result.error || "Erreur lors de la suppression de l'arrière-plan";
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
          return result;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression de l'arrière-plan";
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, onSuccess, onError],
  );

  return {
    isProcessing,
    processImageFromUrl,
    processImageFromFile,
    error,
    clearError,
  };
}

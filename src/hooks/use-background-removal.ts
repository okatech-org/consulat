'use client';

import { useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { BackgroundRemovalResult } from '@/convex/functions/backgroundRemoval';

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

  const removeBackgroundFromUrlAction = useAction(
    api.functions.backgroundRemoval.removeBackgroundFromUrl,
  );
  const removeBackgroundFromFileAction = useAction(
    api.functions.backgroundRemoval.removeBackgroundFromFile,
  );

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
        const result = await removeBackgroundFromUrlAction({ imageUrl });

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
    [isProcessing, onSuccess, onError, removeBackgroundFromUrlAction],
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
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            if (!base64) {
              reject(new Error('Impossible de convertir le fichier en base64'));
              return;
            }
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await removeBackgroundFromFileAction({
          fileBase64,
          fileName: file.name,
        });

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
    [isProcessing, onSuccess, onError, removeBackgroundFromFileAction],
  );

  return {
    isProcessing,
    processImageFromUrl,
    processImageFromFile,
    error,
    clearError,
  };
}

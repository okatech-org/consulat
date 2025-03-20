import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLogger } from './useLogger';
import { AppError, ErrorType, formatErrorMessage, isAppError } from '@/lib/errors';

interface ErrorHandlerOptions {
  /**
   * Espace de noms de traduction à utiliser
   * @default 'errors'
   */
  translationNamespace?: string;

  /**
   * Callback à exécuter après la gestion d'une erreur
   */
  onError?: (error: Error) => void;

  /**
   * Indique si les erreurs doivent être journalisées
   * @default true
   */
  logErrors?: boolean;
}

/**
 * Hook pour gérer les erreurs de manière cohérente dans les composants
 * 
 * @example
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await someAction();
 * } catch (err) {
 *   handleError(err);
 * }
 * 
 * if (error) {
 *   return <ErrorDisplay error={error} onDismiss={clearError} />;
 * }
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { 
    translationNamespace = 'errors', 
    onError,
    logErrors = true
  } = options;
  
  const [error, setError] = useState<Error | null>(null);
  const [formattedError, setFormattedError] = useState<AppError | null>(null);
  const [isHandlingError, setIsHandlingError] = useState(false);
  
  const logger = useLogger();
  const t = useTranslations(translationNamespace);
  const t_common = useTranslations('common');
  
  /**
   * Gère une erreur
   */
  const handleError = useCallback((err: unknown) => {
    setIsHandlingError(true);
    
    let errorObj: Error;
    
    // Normaliser l'erreur
    if (err instanceof Error) {
      errorObj = err;
    } else if (typeof err === 'string') {
      errorObj = new Error(err);
    } else {
      errorObj = new Error('Une erreur inconnue est survenue');
    }
    
    // Journaliser l'erreur
    if (logErrors) {
      logger.error('Erreur capturée par useErrorHandler:', {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
        originalError: err
      });
    }
    
    // Créer une AppError si ce n'en est pas déjà une
    const appError = isAppError(errorObj) 
      ? errorObj as AppError 
      : new AppError(
          errorObj.message, 
          ErrorType.UNKNOWN, 
          { cause: errorObj }
        );
    
    // Essayer de traduire le message d'erreur
    try {
      if (appError.translationKey) {
        const translatedMessage = t(appError.translationKey, {
          field: appError.field,
          code: appError.code,
        });
        
        if (translatedMessage) {
          appError.message = translatedMessage;
        }
      } else {
        // Traduire en fonction du type d'erreur
        const translationKey = `${appError.type}.generic`;
        const defaultMessage = t(`${appError.type}.generic`, { 
          fallback: appError.message,
          field: appError.field
        });
        
        if (defaultMessage !== appError.message) {
          appError.message = defaultMessage;
        }
      }
    } catch (translationError) {
      // En cas d'échec de la traduction, utiliser le message original
      console.error('Échec de la traduction du message d\'erreur:', translationError);
    }
    
    // Enregistrer l'erreur dans l'état
    setError(errorObj);
    setFormattedError(appError);
    
    // Appeler le callback onError si fourni
    if (onError) {
      onError(errorObj);
    }
    
    setIsHandlingError(false);
    return appError;
  }, [t, t_common, logger, logErrors, onError]);
  
  /**
   * Efface l'erreur actuelle
   */
  const clearError = useCallback(() => {
    setError(null);
    setFormattedError(null);
  }, []);
  
  /**
   * Obtient un message traduit pour un type d'erreur
   */
  const getErrorMessage = useCallback((errorType: ErrorType, field?: string, code?: string) => {
    try {
      return t(`${errorType}.generic`, {
        fallback: t('unknown.generic'),
        field,
        code
      });
    } catch (err) {
      return t('unknown.generic');
    }
  }, [t]);
  
  return {
    error,
    formattedError,
    isHandlingError,
    handleError,
    clearError,
    getErrorMessage,
  };
} 
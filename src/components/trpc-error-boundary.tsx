'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';
import ErrorBoundary, { useErrorBoundary } from './error-boundary';

interface TRPCErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<TRPCErrorFallbackProps>;
}

interface TRPCErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  onRetry: () => void;
}

function TRPCErrorFallback({ error, resetError, onRetry }: TRPCErrorFallbackProps) {
  const t = useTranslations('errors');

  // Vérifier si c'est une erreur tRPC
  const isTRPCError = error instanceof TRPCClientError;
  const trpcError = isTRPCError ? (error as TRPCClientError<AppRouter>) : null;

  // Analyser le type d'erreur
  const isNetworkError =
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    trpcError?.data?.code === 'INTERNAL_SERVER_ERROR';

  const isUnauthorizedError =
    trpcError?.data?.code === 'UNAUTHORIZED' || error?.message?.includes('unauthorized');

  const isValidationError =
    trpcError?.data?.code === 'BAD_REQUEST' || error?.message?.includes('validation');

  const handleRetry = () => {
    resetError();
    onRetry();
  };

  const getErrorTitle = () => {
    if (isUnauthorizedError) return 'Accès non autorisé';
    if (isNetworkError) return t('network.title');
    if (isValidationError) return 'Données invalides';
    if (isTRPCError) return 'Erreur de communication';
    return t('common.error_title');
  };

  const getErrorDescription = () => {
    if (isUnauthorizedError)
      return 'Vous devez vous connecter pour accéder à cette fonctionnalité.';
    if (isNetworkError) return t('network.description');
    if (isValidationError) return 'Les données envoyées ne sont pas valides.';
    if (isTRPCError) return 'Impossible de communiquer avec le serveur.';
    return 'Une erreur inattendue est survenue.';
  };

  const getIcon = () => {
    if (isNetworkError) return <WifiOff className="h-12 w-12 text-destructive" />;
    if (isUnauthorizedError)
      return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    return <AlertTriangle className="h-12 w-12 text-destructive" />;
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <CardTitle className="text-lg">{getErrorTitle()}</CardTitle>
          <CardDescription>{getErrorDescription()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button onClick={handleRetry} className="w-full" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.try_again')}
          </Button>

          {/* Afficher les détails de l'erreur tRPC en développement */}
          {process.env.NODE_ENV === 'development' && trpcError && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Détails tRPC
              </summary>
              <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-32">
                <p>
                  <strong>Code:</strong> {trpcError.data?.code}
                </p>
                <p>
                  <strong>Status:</strong> {trpcError.data?.httpStatus}
                </p>
                <p>
                  <strong>Path:</strong> {trpcError.data?.path}
                </p>
                {trpcError.data?.zodError && (
                  <pre className="mt-2 whitespace-pre-wrap">
                    <strong>Validation:</strong>
                    {JSON.stringify(trpcError.data.zodError, null, 2)}
                  </pre>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook pour capturer les erreurs tRPC programmatiquement
export function useTRPCErrorHandler() {
  const { captureError } = useErrorBoundary();

  const handleTRPCError = React.useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        captureError(error);
      } else {
        captureError(new Error('Erreur tRPC inconnue'));
      }
    },
    [captureError],
  );

  return { handleTRPCError };
}

export function TRPCErrorBoundary({ children, fallback }: TRPCErrorBoundaryProps) {
  const handleRetry = React.useCallback(() => {
    // Invalider le cache tRPC et rafraîchir
    window.location.reload();
  }, []);

  const defaultFallback = React.useCallback(
    (props: any) => <TRPCErrorFallback {...props} onRetry={handleRetry} />,
    [handleRetry],
  );

  return (
    <ErrorBoundary
      fallback={fallback || defaultFallback}
      onError={(error, errorInfo) => {
        console.error('tRPC Error Boundary:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default TRPCErrorBoundary;

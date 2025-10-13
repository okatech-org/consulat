'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

import { ROUTES } from '@/schemas/routes';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  onGoHome: () => void;
  onReportError: () => void;
  showErrorDetails?: boolean;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Appeler le callback onError si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Envoyer l'erreur au service de monitoring (ex: Sentry)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: true,
      });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          onGoHome={() => (window.location.href = ROUTES.base)}
          onReportError={() => {
            // Implémenter la logique de rapport d'erreur
            console.log('Report error:', this.state.error);
          }}
          showErrorDetails={this.props.showErrorDetails}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  onGoHome,
  onReportError,
  showErrorDetails = false,
}: ErrorFallbackProps) {
  const handleRefresh = () => {
    resetError();
    window.location.reload();
  };

  const isNetworkError =
    error?.message?.includes('fetch') || error?.message?.includes('network');
  const isChunkError =
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError');

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {isNetworkError
              ? 'Erreur de réseau'
              : isChunkError
                ? 'Erreur de chargement'
                : 'Erreur inconnue'}
          </CardTitle>
          <CardDescription>
            {isNetworkError
              ? 'Erreur de réseau'
              : isChunkError
                ? 'Erreur de chargement'
                : 'Erreur inconnue'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Actions principales */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRefresh} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              {isChunkError ? 'Recharger' : 'Réessayer'}
            </Button>
            <Button onClick={onGoHome} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              {"Retour à la page d'accueil"}
            </Button>
          </div>

          {/* Bouton pour signaler l'erreur */}
          <Button onClick={onReportError} variant="ghost" size="sm" className="w-full">
            <Bug className="mr-2 h-4 w-4" />
            {"Signaler l'erreur"}
          </Button>

          {/* Détails de l'erreur (mode développement) */}
          {showErrorDetails && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                {'Détails techniques'}
              </summary>
              <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                )}
                {errorInfo?.componentStack && (
                  <pre className="mt-2 whitespace-pre-wrap">
                    <strong>Component Stack:</strong>
                    {errorInfo.componentStack}
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

// Hook pour utiliser l'error boundary programmatiquement
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Composant wrapper pour faciliter l'utilisation
export function ErrorBoundary({
  children,
  fallback,
  onError,
  showErrorDetails = process.env.NODE_ENV === 'development',
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass
      fallback={fallback}
      onError={onError}
      showErrorDetails={showErrorDetails}
    >
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundary;

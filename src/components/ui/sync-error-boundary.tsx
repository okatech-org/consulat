'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface SyncErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface SyncErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class SyncErrorBoundary extends React.Component<
  SyncErrorBoundaryProps,
  SyncErrorBoundaryState
> {
  constructor(props: SyncErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SyncErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Sync page error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <SyncErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface SyncErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export function SyncErrorFallback({ error, resetError }: SyncErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="w-dvw bg-background h-dvh pt-8 p-6 md:pt-6 min-h-max overflow-x-hidden md:overflow-hidden flex items-center justify-center">
      <div className="w-full h-full min-h-max overflow-y-auto flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center pb-4">
            <div className="flex mb-4 h-max w-max mx-auto items-center justify-center rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-xl font-bold text-red-700">
              Erreur technique
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Une erreur inattendue s&apos;est produite</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Nous rencontrons des difficultés techniques lors de la création de votre
                  espace consulaire.
                </p>
                <p className="text-sm">
                  Veuillez réessayer ou contacter le support si le problème persiste.
                </p>
                {isDevelopment && error && (
                  <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                    <summary className="cursor-pointer font-medium">
                      Détails techniques (développement)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">
                      {error.name}: {error.message}
                      {error.stack && `\n\nStack trace:\n${error.stack}`}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleReload} className="flex-1 sm:flex-none">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger la page
              </Button>

              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1 sm:flex-none"
              >
                <Home className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Button>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={resetError} className="text-sm">
                Réessayer le composant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
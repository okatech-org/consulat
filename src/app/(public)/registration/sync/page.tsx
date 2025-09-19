'use client';

import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  WifiOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SyncErrorBoundary } from '@/components/ui/sync-error-boundary';

type SyncState = 'loading' | 'success' | 'error' | 'timeout' | 'retrying';

function SyncPageContent() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const { mutate: syncUser, isPending } = api.auth.handleNewUser.useMutation({
    onSuccess: () => {
      if (timeoutId) clearTimeout(timeoutId);
      setSyncState('success');
      setTimeout(() => {
        router.push(ROUTES.user.profile_form);
      }, 1500);
    },
    onError: (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      setSyncState('error');
      setErrorMessage(error.message || 'Une erreur inattendue s\'est produite');
    },
  });

  const handleRetry = useCallback(() => {
    if (!user) return;

    setRetryCount(prev => prev + 1);
    setSyncState('retrying');
    setErrorMessage('');

    setTimeout(() => {
      syncUser({ clerkId: user.id });
      setSyncState('loading');

      const timeout = setTimeout(() => {
        setSyncState('timeout');
      }, 30000);
      setTimeoutId(timeout);
    }, 500);
  }, [user, syncUser]);

  useEffect(() => {
    if (isLoaded && user) {
      syncUser({ clerkId: user.id });

      const timeout = setTimeout(() => {
        setSyncState('timeout');
      }, 30000);
      setTimeoutId(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [user, isLoaded, syncUser]);

  useEffect(() => {
    const handleOnline = () => {
      if (syncState === 'error' && navigator.onLine) {
        handleRetry();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncState, handleRetry]);

  const renderSyncStatus = () => {
    switch (syncState) {
      case 'loading':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">
                Création de votre espace consulaire
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez patienter, cela peut prendre quelques instants...
              </p>
            </div>
          </div>
        );

      case 'retrying':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">
                Nouvelle tentative en cours...
              </p>
              <p className="text-sm text-muted-foreground">
                Tentative {retryCount}/3
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="w-full flex flex-col justify-center gap-4 items-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-green-700">
                Espace consulaire créé avec succès !
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection en cours...
              </p>
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="w-full space-y-4">
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Délai d&apos;attente dépassé</AlertTitle>
              <AlertDescription>
                La création de votre espace prend plus de temps que prévu.
                Veuillez réessayer ou vérifier votre connexion internet.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetry}
                disabled={isPending}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        );

      case 'error': {
        const isNetworkError = !navigator.onLine || errorMessage.includes('network') || errorMessage.includes('connexion');

        return (
          <div className="w-full space-y-4">
            <Alert variant="destructive">
              {isNetworkError ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {isNetworkError ? 'Problème de connexion' : 'Erreur de synchronisation'}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{errorMessage}</p>
                {isNetworkError && (
                  <p className="text-sm">
                    Vérifiez votre connexion internet et réessayez.
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetry}
                disabled={isPending || retryCount >= 3}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Limite atteinte' : 'Réessayer'}
              </Button>

              {retryCount >= 3 && (
                <Button
                  variant="outline"
                  onClick={() => router.push(ROUTES.base)}
                  className="flex-1 sm:flex-none"
                >
                  Retour à l'accueil
                </Button>
              )}
            </div>

            {retryCount > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Tentatives: {retryCount}/3
              </p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-dvw bg-background h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-dvw bg-background h-dvh pt-8 p-6 md:pt-6 min-h-max overflow-x-hidden md:overflow-hidden flex items-center justify-center md:grid md:grid-cols-2">
      <div className="w-full h-full min-h-max overflow-y-auto flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center pb-4">
            <div className="flex mb-4 h-max w-max mx-auto items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
              <Image
                src={process.env.NEXT_PUBLIC_ORG_LOGO || ''}
                width={200}
                height={200}
                alt={'Consulat.ga'}
                className="relative h-20 w-20 rounded-md transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              Consulat.ga
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderSyncStatus()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SyncPage() {
  return (
    <SyncErrorBoundary>
      <SyncPageContent />
    </SyncErrorBoundary>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Loader2,
  CheckCircle2,
  RefreshCw,
  Clock,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SYNC_TIMEOUT_MS = 30000;
const MAX_RETRY_ATTEMPTS = 3;
const REDIRECT_DELAY_MS = 1500;

type SyncState = 'loading' | 'success' | 'error' | 'timeout' | 'retrying';

export function RegistrationSync() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [syncState, setSyncState] = React.useState<SyncState>('loading');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [retryCount, setRetryCount] = React.useState(0);
  const [isSyncPending, setIsSyncPending] = React.useState(false);
  const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

  const syncUser = useAction(api.functions.user.handleNewUser);

  const handleSyncUser = React.useCallback(
    async (clerkId: string) => {
      setIsSyncPending(true);
      try {
        await syncUser({ clerkId });
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setSyncState('success');
        setTimeout(() => {
          router.push(ROUTES.user.profile_form);
        }, REDIRECT_DELAY_MS);
      } catch (error) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setSyncState('error');
        setErrorMessage(
          error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        );
      } finally {
        setIsSyncPending(false);
      }
    },
    [syncUser, router],
  );

  const handleRetry = React.useCallback(() => {
    if (!user || retryCount >= MAX_RETRY_ATTEMPTS) return;

    setRetryCount((prev) => prev + 1);
    setSyncState('retrying');
    setErrorMessage('');

    setTimeout(() => {
      handleSyncUser(user.id);
      setSyncState('loading');

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => setSyncState('timeout'), SYNC_TIMEOUT_MS);
    }, 500);
  }, [user, handleSyncUser, retryCount]);

  React.useEffect(() => {
    if (isLoaded && user) {
      handleSyncUser(user.id);

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => setSyncState('timeout'), SYNC_TIMEOUT_MS);
    } else if (isLoaded && !user) {
      router.push(ROUTES.auth.signup);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [isLoaded, user, handleSyncUser, router]);

  React.useEffect(() => {
    const handleOnline = () => {
      if (syncState === 'error' && navigator.onLine) {
        handleRetry();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncState, handleRetry]);

  if (!isLoaded) {
    return (
      <div className="w-full flex flex-col justify-center gap-4 items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const isNetworkError =
    !navigator.onLine ||
    errorMessage.includes('network') ||
    errorMessage.includes('connexion');

  switch (syncState) {
    case 'loading':
      return (
        <div className="w-full flex flex-col justify-center gap-4 items-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Création de votre espace consulaire</p>
            <p className="text-sm text-muted-foreground">
              Veuillez patienter, cela peut prendre quelques instants...
            </p>
          </div>
        </div>
      );

    case 'retrying':
      return (
        <div className="w-full flex flex-col justify-center gap-4 items-center min-h-[400px]">
          <RefreshCw className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Nouvelle tentative en cours...</p>
            <p className="text-sm text-muted-foreground">
              Tentative {retryCount}/{MAX_RETRY_ATTEMPTS}
            </p>
          </div>
        </div>
      );

    case 'success':
      return (
        <div className="w-full flex flex-col justify-center gap-4 items-center min-h-[400px]">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-green-700">
              Espace consulaire créé avec succès !
            </p>
            <p className="text-sm text-muted-foreground">Redirection en cours...</p>
            <Button asChild>
              <Link href={ROUTES.user.profile_form}>
                Continuer mon inscription consulaire
              </Link>
            </Button>
          </div>
        </div>
      );

    case 'timeout':
      return (
        <div className="w-full space-y-4 max-w-md mx-auto">
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertTitle>Délai d&apos;attente dépassé</AlertTitle>
            <AlertDescription>
              La création de votre espace prend plus de temps que prévu. Veuillez
              réessayer ou vérifier votre connexion internet.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              disabled={isSyncPending || retryCount >= MAX_RETRY_ATTEMPTS}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.base)}
              className="flex-1 sm:flex-none"
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
      );

    case 'error':
      return (
        <div className="w-full space-y-4 max-w-md mx-auto">
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
                <p className="text-sm">Vérifiez votre connexion internet et réessayez.</p>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              disabled={isSyncPending || retryCount >= MAX_RETRY_ATTEMPTS}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCount >= MAX_RETRY_ATTEMPTS ? 'Limite atteinte' : 'Réessayer'}
            </Button>

            {retryCount >= MAX_RETRY_ATTEMPTS && (
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.base)}
                className="flex-1 sm:flex-none"
              >
                Retour à l&apos;accueil
              </Button>
            )}
          </div>

          {retryCount > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Tentatives: {retryCount}/{MAX_RETRY_ATTEMPTS}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}

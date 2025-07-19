'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { PageContainer } from '@/components/layouts/page-container';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthenticatedError({ error, reset }: ErrorProps) {
  const t = useTranslations('errors');
  const router = useRouter();

  useEffect(() => {
    // Log l'erreur pour le monitoring
    console.error('Authenticated section error:', error);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoHome = () => {
    router.push(ROUTES.base);
  };

  const handleGoDashboard = () => {
    router.push(ROUTES.dashboard.base);
  };

  const isNetworkError =
    error?.message?.includes('fetch') || error?.message?.includes('network');
  const isAuthError =
    error?.message?.includes('auth') || error?.message?.includes('unauthorized');

  return (
    <PageContainer className="h-screen w-screen flex items-center justify-center p-0">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isNetworkError
              ? t('network.title')
              : isAuthError
                ? t('auth.session_expired')
                : t('common.error_title')}
          </CardTitle>
          <CardDescription>
            {isNetworkError
              ? t('network.description')
              : isAuthError
                ? 'Votre session a expiré. Veuillez vous reconnecter.'
                : 'Une erreur est survenue dans votre espace personnel.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleReset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.try_again')}
            </Button>
            <Button onClick={handleGoDashboard} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
            <Button onClick={handleGoHome} variant="ghost" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              {t('common.go_home')}
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Détails techniques
              </summary>
              <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p>
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

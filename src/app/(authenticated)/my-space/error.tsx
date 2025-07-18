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
import { AlertTriangle, RefreshCw, Home, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MySpaceError({ error, reset }: ErrorProps) {
  const t = useTranslations('errors');
  const router = useRouter();

  useEffect(() => {
    console.error('My Space error:', error);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoMySpace = () => {
    router.push('/my-space');
  };

  const handleGoHome = () => {
    router.push(ROUTES.base);
  };

  const isProfileError =
    error?.message?.includes('profile') || error?.message?.includes('user');
  const isDataError =
    error?.message?.includes('fetch') || error?.message?.includes('data');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isProfileError
              ? 'Erreur de profil'
              : isDataError
                ? 'Erreur de chargement'
                : 'Erreur dans votre espace'}
          </CardTitle>
          <CardDescription>
            {isProfileError
              ? 'Impossible de charger vos informations de profil.'
              : isDataError
                ? 'Impossible de charger vos données personnelles.'
                : 'Une erreur est survenue dans votre espace personnel.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleReset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.try_again')}
            </Button>
            <Button onClick={handleGoMySpace} variant="outline" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Retour à mon espace
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
    </div>
  );
}

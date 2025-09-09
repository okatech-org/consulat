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

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function IntelError({ error, reset }: ErrorProps) {
  const t = useTranslations('intelligence.errors');
  const router = useRouter();

  useEffect(() => {
    console.error('Intel error:', error);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push(ROUTES.base);
  };

  const isDataError =
    error?.message?.includes('fetch') || error?.message?.includes('data');
  const isPermissionError =
    error?.message?.includes('permission') || error?.message?.includes('unauthorized');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isPermissionError
              ? t('permissions.unauthorized')
              : isDataError
                ? t('load_failed')
                : t('general_error')}
          </CardTitle>
          <CardDescription>
            {isPermissionError
              ? t('permissions.insufficient')
              : isDataError
                ? t('load_failed_description')
                : t('general_error_description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleReset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.try_again')}
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('actions.go_back')}
            </Button>
            <Button onClick={handleGoHome} variant="ghost" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              {t('actions.go_home')}
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                {t('technical_details')}
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

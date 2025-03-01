'use client';

import React from 'react';
import { ChildForm } from './child-form';
import { useChildForm } from '@/hooks/use-child-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ChildProfileClient() {
  const t = useTranslations('user.children');
  const { isLoading, error, handleSubmit } = useChildForm();

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('create_form.title')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ChildForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

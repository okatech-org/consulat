'use client';

import React from 'react';
import { ChildForm } from './child-form';
import { useChildForm } from '@/hooks/use-child-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ChildProfileClient() {
  const { isLoading, error, handleSubmit } = useChildForm();

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ChildForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';

export function ServicesHeaderActions() {
  const t = useTranslations('services');

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        className="h-8"
        aria-label="Actualiser"
      >
        <RefreshCw className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">{t('actions.refresh')}</span>
      </Button>
      <Link href={ROUTES.user.service_available}>
        <Button size="sm" className="h-8">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t('myRequests.startNew')}</span>
        </Button>
      </Link>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';

export function AppointmentsHeader() {
  const t = useTranslations('appointments');

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <Button asChild>
        <Link href={ROUTES.user.new_appointment}>
          <Calendar className="mr-2 size-4" />
          {t('new.button')}
        </Link>
      </Button>
    </div>
  );
}

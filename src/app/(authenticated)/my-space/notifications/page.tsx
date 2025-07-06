'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NotificationsListing } from '@/components/notifications/notifications-listing';

export default function NotificationsPage() {
  const t = useTranslations('notifications');

  return (
    <PageContainer title={t('title')} description={t('subtitle')}>
      <Suspense fallback={<LoadingSkeleton variant="list" count={4} />}>
        <NotificationsListing />
      </Suspense>
    </PageContainer>
  );
}

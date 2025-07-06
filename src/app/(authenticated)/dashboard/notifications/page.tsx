'use client';

import { NotificationsListing } from '@/components/notifications/notifications-listing';
import { PageContainer } from '@/components/layouts/page-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

export default function AdminNotificationsPage() {
  const t = useTranslations('notifications');

  return (
    <PageContainer title={t('title')} description={t('subtitle')}>
      <Suspense fallback={<LoadingSkeleton variant="list" count={4} />}>
        <NotificationsListing />
      </Suspense>
    </PageContainer>
  );
}

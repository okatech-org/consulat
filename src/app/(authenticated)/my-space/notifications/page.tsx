'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NotificationsListing } from '@/components/notifications/notifications-listing';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const { user } = useCurrentUser();
  const notifications = useQuery(
    api.functions.notification.getNotificationsByUser,
    user?._id ? { userId: convexUser._id } : 'skip',
  );

  if (notifications === undefined) {
    return (
      <PageContainer title={t('title')} description={t('subtitle')}>
        <LoadingSkeleton variant="list" count={4} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={t('title')} description={t('subtitle')}>
      <NotificationsListing notifications={notifications} />
    </PageContainer>
  );
}

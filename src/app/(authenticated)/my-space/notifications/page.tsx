'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { NotificationsListing } from '@/components/notifications/notifications-listing';

export default function NotificationsPage() {
  return (
    <PageContainer title="Notifications" description="Notifications">
      <NotificationsListing />
    </PageContainer>
  );
}

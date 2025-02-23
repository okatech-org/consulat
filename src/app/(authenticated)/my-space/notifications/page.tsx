import CardContainer from '@/components/layouts/card-container';
import { NotificationsListing } from '@/components/notifications/notifications-listing';
import { getTranslations } from 'next-intl/server';

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');

  return (
    <CardContainer contentClass="space-y-6" title={t('title')} subtitle={t('subtitle')}>
      <NotificationsListing />
    </CardContainer>
  );
}

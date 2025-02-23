import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { NotificationsListing } from '@/components/notifications/notifications-listing';
import { getTranslations } from 'next-intl/server';

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');

  return (
    <PageContainer title={t('title')} description={t('subtitle')}>
      <CardContainer>
        <NotificationsListing />
      </CardContainer>
    </PageContainer>
  );
}

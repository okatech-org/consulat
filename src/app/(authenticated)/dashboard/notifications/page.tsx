import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { NotificationsListing } from '@/components/notifications/notifications-listing';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layouts/page-container';

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.auth.login);
  if (!user.roles.some((role) => ['ADMIN', 'MANAGER', 'AGENT'].includes(role))) {
    redirect(ROUTES.dashboard.base);
  }

  return (
    <PageContainer title={t('title')} description={t('subtitle')}>
      <NotificationsListing />
    </PageContainer>
  );
}

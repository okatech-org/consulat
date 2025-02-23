import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import CardContainer from '@/components/layouts/card-container';
import { NotificationsListing } from '@/components/notifications/notifications-listing';
import { getTranslations } from 'next-intl/server';

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.auth.login);
  if (!user.roles.some((role) => ['ADMIN', 'MANAGER', 'AGENT'].includes(role))) {
    redirect(ROUTES.dashboard.base);
  }

  return (
    <CardContainer contentClass="space-y-6" title={t('title')} subtitle={t('subtitle')}>
      <NotificationsListing />
    </CardContainer>
  );
}

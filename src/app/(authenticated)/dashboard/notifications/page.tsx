import { getNotifications } from '@/actions/notifications';
import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import CardContainer from '@/components/layouts/card-container';
import { NotificationItem } from '@/components/notifications/notification-item';
import { getTranslations } from 'next-intl/server';

export default async function AdminNotificationsPage() {
  const t = await getTranslations('notifications');
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.auth.login);
  if (!user.roles.some((role) => ['ADMIN', 'MANAGER', 'AGENT'].includes(role))) {
    redirect(ROUTES.dashboard.base);
  }

  const notifications = await getNotifications();

  return (
    <CardContainer contentClass="space-y-6" title={t('title')} subtitle={t('subtitle')}>
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
        {notifications.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">{t('empty')}</div>
        )}
      </div>
    </CardContainer>
  );
}

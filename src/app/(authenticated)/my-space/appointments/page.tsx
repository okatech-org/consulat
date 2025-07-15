import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/server';
import { getTranslations } from 'next-intl/server';
import { UserAppointmentsPageClient } from './page.client';
import type { GroupedAppointmentsDashboard } from '@/schemas/appointment';

// Cache pour 5 minutes
export const revalidate = 300;

export default async function UserAppointmentsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('appointments');

  if (!user) {
    redirect(ROUTES.auth.login);
  }

  // Récupérer les rendez-vous côté serveur avec l'API optimisée
  const appointments = await api.appointments.getUserAppointmentsDashboard({
    userId: user.id,
    limit: 10,
  });

  return (
    <UserAppointmentsPageClient
      initialAppointments={appointments as GroupedAppointmentsDashboard}
      translations={{
        title: t('title'),
        description: t('description'),
        newButton: t('new.button'),
        tabsUpcomingTitle: t('tabs.upcoming.title'),
        tabsPastTitle: t('tabs.past.title'),
        tabsCancelledTitle: t('tabs.cancelled.title'),
        tabsUpcomingEmpty: t('tabs.upcoming.empty'),
        tabsPastEmpty: t('tabs.past.empty'),
        tabsCancelledEmpty: t('tabs.cancelled.empty'),
      }}
    />
  );
}

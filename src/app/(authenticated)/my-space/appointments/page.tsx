import { getCurrentUser } from '@/actions/user';
import { api } from '@/trpc/server';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layouts/page-container';
import { Calendar } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContainer from '@/components/layouts/card-container';
import type {
  DashboardAppointment,
  GroupedAppointmentsDashboard,
} from '@/schemas/appointment';

// Cache pour 5 minutes
export const revalidate = 300;

interface AppointmentsPageProps {
  searchParams: { tab?: string };
}

export default async function UserAppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const { tab = 'upcoming' } = await searchParams;
  const user = await getCurrentUser();
  const t = await getTranslations('appointments');

  // Récupérer les rendez-vous côté serveur avec l'API optimisée
  const appointments = (await api.appointments.getUserAppointmentsDashboard({
    userId: user?.id,
    limit: 10,
  })) as GroupedAppointmentsDashboard;

  const renderAppointments = (
    items: DashboardAppointment[] = [],
    emptyMessage: string,
  ) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      action={
        <Link
          className={buttonVariants({ variant: 'default' })}
          href={ROUTES.user.new_appointment}
        >
          <Calendar className="mr-2 size-4" />
          <span>{t('new.button')}</span>
        </Link>
      }
    >
      <Tabs value={tab} defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" asChild>
            <Link href="?tab=upcoming">
              À venir
              {appointments?.upcoming && appointments.upcoming.totalCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {appointments.upcoming.totalCount}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="past" asChild>
            <Link href="?tab=past">Passés</Link>
          </TabsTrigger>
          <TabsTrigger value="cancelled" asChild>
            <Link href="?tab=cancelled">Annulés</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <CardContainer title={t('tabs.upcoming.title')}>
            {renderAppointments(
              appointments?.upcoming?.appointments,
              t('tabs.upcoming.empty'),
            )}
          </CardContainer>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <CardContainer title={t('tabs.past.title')}>
            {renderAppointments(appointments?.past?.appointments, t('tabs.past.empty'))}
          </CardContainer>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <CardContainer title={t('tabs.cancelled.title')}>
            {renderAppointments(
              appointments?.cancelled?.appointments,
              t('tabs.cancelled.empty'),
            )}
          </CardContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

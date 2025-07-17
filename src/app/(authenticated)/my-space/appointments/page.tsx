'use client';

import { useCurrentUser } from '@/contexts/user-context';
import { api } from '@/trpc/react';
import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layouts/page-container';
import { Calendar } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContainer from '@/components/layouts/card-container';
import type { DashboardAppointment } from '@/schemas/appointment';
import { useTabs } from '@/hooks/use-tabs';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useSearchParams } from 'next/navigation';

export default function UserAppointmentsPage() {
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get('tab') as 'upcoming' | 'past' | 'cancelled';
  const { user } = useCurrentUser();
  const t = useTranslations('appointments');
  const { currentTab, handleTabChange } = useTabs<'upcoming' | 'past' | 'cancelled'>(
    'appointments',
    urlTab ?? 'upcoming',
  );

  const { data: appointments, isLoading } =
    api.appointments.getUserAppointmentsDashboard.useQuery(
      {
        userId: user?.id,
        limit: 10,
      },
      {
        enabled: !!user?.id,
      },
    );

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

  if (isLoading) {
    return (
      <PageContainer
        title="Mes rendez-vous"
        description="Gérez vos rendez-vous consulaires"
        action={<div className="h-10 w-36 animate-pulse rounded-md bg-muted" />}
      >
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              <div className="flex items-center gap-2">À venir</div>
            </TabsTrigger>
            <TabsTrigger value="past">Passés</TabsTrigger>
            <TabsTrigger value="cancelled">Annulés</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <CardContainer title="Rendez-vous à venir">
              <LoadingSkeleton
                variant="card"
                count={3}
                size="md"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              />
            </CardContainer>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <CardContainer title="Rendez-vous passés">
              <LoadingSkeleton
                variant="card"
                count={3}
                size="md"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              />
            </CardContainer>
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            <CardContainer title="Rendez-vous annulés">
              <LoadingSkeleton
                variant="card"
                count={2}
                size="md"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              />
            </CardContainer>
          </TabsContent>
        </Tabs>
      </PageContainer>
    );
  }

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
      <Tabs
        value={currentTab}
        onValueChange={(value) =>
          handleTabChange(value as 'upcoming' | 'past' | 'cancelled')
        }
      >
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

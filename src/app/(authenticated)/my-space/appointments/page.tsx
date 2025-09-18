'use client';

import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layouts/page-container';
import { Calendar } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContainer from '@/components/layouts/card-container';
import type { AppointmentListItem } from '@/server/api/routers/appointments/misc';
import { api } from '@/trpc/react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';

export const dynamic = 'force-dynamic';

export default function UserAppointmentsPage() {
  const { user } = useCurrentUser();
  const { data: appointments, isLoading } = api.appointments.getList.useQuery({
    userId: user.id,
  });
  const t = useTranslations('appointments');

  const renderAppointments = (
    items: AppointmentListItem[] = [],
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
      <PageContainer title={t('title')} description={t('description')}>
        <LoadingSkeleton variant="grid" className="!w-full" />
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
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            À venir
            {appointments?.upcoming && appointments.upcoming.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {appointments.upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <CardContainer title={t('tabs.upcoming.title')}>
            {renderAppointments(appointments?.upcoming, t('tabs.upcoming.empty'))}
          </CardContainer>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <CardContainer title={t('tabs.past.title')}>
            {renderAppointments(appointments?.past, t('tabs.past.empty'))}
          </CardContainer>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <CardContainer title={t('tabs.cancelled.title')}>
            {renderAppointments(appointments?.cancelled, t('tabs.cancelled.empty'))}
          </CardContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

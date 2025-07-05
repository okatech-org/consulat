'use client';

import { useAppointments } from '@/hooks/use-appointments';
import { ErrorCard } from '@/components/ui/error-card';
import { PageContainer } from '@/components/layouts/page-container';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { useTabs } from '@/hooks/use-tabs';
import type { AppointmentWithRelations } from '@/schemas/appointment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContainer from '@/components/layouts/card-container';

type TabType = 'upcoming' | 'past' | 'cancelled';

export default function UserAppointmentsPageClient() {
  const t = useTranslations('appointments');
  const { appointments, isLoading, error } = useAppointments();
  const { handleTabChange, currentTab } = useTabs<TabType>('tab', 'upcoming');

  const renderAppointments = (items: AppointmentWithRelations[] = []) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">{t(`tabs.${currentTab}.empty`)}</p>
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
        <LoadingSkeleton variant="grid" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title={t('title')} description={t('description')}>
        <ErrorCard />
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
      <Tabs value={currentTab} onValueChange={handleTabChange as (value: string) => void}>
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
            {renderAppointments(appointments?.upcoming)}
          </CardContainer>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <CardContainer title={t('tabs.past.title')}>
            {renderAppointments(appointments?.past)}
          </CardContainer>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <CardContainer title={t('tabs.cancelled.title')}>
            {renderAppointments(appointments?.cancelled)}
          </CardContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

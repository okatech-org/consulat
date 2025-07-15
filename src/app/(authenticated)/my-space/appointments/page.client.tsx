'use client';

import { ErrorCard } from '@/components/ui/error-card';
import { PageContainer } from '@/components/layouts/page-container';
import { Calendar } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { useTabs } from '@/hooks/use-tabs';
import type {
  DashboardAppointment,
  GroupedAppointmentsDashboard,
} from '@/schemas/appointment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardContainer from '@/components/layouts/card-container';
import { useEffect, useState } from 'react';
import { api } from '@/trpc/react';

type TabType = 'upcoming' | 'past' | 'cancelled';

interface UserAppointmentsPageClientProps {
  initialAppointments: GroupedAppointmentsDashboard;
  translations: {
    title: string;
    description: string;
    newButton: string;
    tabsUpcomingTitle: string;
    tabsPastTitle: string;
    tabsCancelledTitle: string;
    tabsUpcomingEmpty: string;
    tabsPastEmpty: string;
    tabsCancelledEmpty: string;
  };
}

export function UserAppointmentsPageClient({
  initialAppointments,
  translations,
}: UserAppointmentsPageClientProps) {
  const { handleTabChange, currentTab } = useTabs<TabType>('tab', 'upcoming');
  const [appointments, setAppointments] = useState(initialAppointments);

  // Hook pour les mutations et rafraîchissement des données
  const {
    data: freshAppointments,
    error,
    refetch,
  } = api.appointments.getUserAppointmentsDashboard.useQuery(undefined, {
    initialData: initialAppointments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mettre à jour les appointments quand de nouvelles données arrivent
  useEffect(() => {
    if (freshAppointments) {
      setAppointments(freshAppointments);
    }
  }, [freshAppointments]);

  const renderAppointments = (items: DashboardAppointment[] = []) => {
    if (!items || items.length === 0) {
      const emptyKey =
        `tabs${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}Empty` as keyof typeof translations;
      return (
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">{translations[emptyKey]}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onUpdate={() => refetch()} // Rafraîchir après mutation
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <PageContainer title={translations.title} description={translations.description}>
        <ErrorCard />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={translations.title}
      description={translations.description}
      action={
        <Link
          className={buttonVariants({ variant: 'default' })}
          href={ROUTES.user.new_appointment}
        >
          <Calendar className="mr-2 size-4" />
          <span>{translations.newButton}</span>
        </Link>
      }
    >
      <Tabs value={currentTab} onValueChange={handleTabChange as (value: string) => void}>
        <TabsList>
          <TabsTrigger value="upcoming">
            À venir
            {appointments?.upcoming && appointments.upcoming.totalCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {appointments.upcoming.totalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <CardContainer title={translations.tabsUpcomingTitle}>
            {renderAppointments(appointments?.upcoming?.appointments)}
          </CardContainer>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <CardContainer title={translations.tabsPastTitle}>
            {renderAppointments(appointments?.past?.appointments)}
          </CardContainer>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <CardContainer title={translations.tabsCancelledTitle}>
            {renderAppointments(appointments?.cancelled?.appointments)}
          </CardContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

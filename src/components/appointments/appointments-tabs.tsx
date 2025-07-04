'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTabs } from '@/hooks/use-tabs';
import { AppointmentCard } from './appointment-card';
import { useTranslations } from 'next-intl';
import type { AppointmentWithRelations } from '@/schemas/appointment';
interface GroupedAppointments {
  upcoming: AppointmentWithRelations[];
  past: AppointmentWithRelations[];
  cancelled: AppointmentWithRelations[];
}

type TabType = 'upcoming' | 'past' | 'cancelled';

type AppointmentsTabsProps = {
  appointments: GroupedAppointments;
};

export function AppointmentsTabs({ appointments }: AppointmentsTabsProps) {
  const t = useTranslations('appointments');
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

  return (
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
        <Card>
          <CardHeader>
            <CardTitle>{t('tabs.upcoming.title')}</CardTitle>
          </CardHeader>
          <CardContent>{renderAppointments(appointments?.upcoming)}</CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('tabs.past.title')}</CardTitle>
          </CardHeader>
          <CardContent>{renderAppointments(appointments?.past)}</CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cancelled" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('tabs.cancelled.title')}</CardTitle>
          </CardHeader>
          <CardContent>{renderAppointments(appointments?.cancelled)}</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

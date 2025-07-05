'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { AgentAppointmentsList } from './agent-appointments-list';
import { useTabs } from '@/hooks/use-tabs';
import type { AppointmentWithRelations } from '@/schemas/appointment';

interface AgentAppointmentsTabsProps {
  upcoming: AppointmentWithRelations[];
  past: AppointmentWithRelations[];
  cancelled: AppointmentWithRelations[];
}

export function AgentAppointmentsTabs({
  upcoming,
  past,
  cancelled,
}: AgentAppointmentsTabsProps) {
  const { currentTab, handleTabChange } = useTabs<string>('tab', 'upcoming');
  const t = useTranslations('appointments.tabs');

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">
          {t('upcoming.title')} ({upcoming.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          {t('past.title')} ({past.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          {t('cancelled.title')} ({cancelled.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="space-y-4">
        <AgentAppointmentsList
          appointments={upcoming}
          emptyMessage={t('upcoming.empty')}
        />
      </TabsContent>
      <TabsContent value="past" className="space-y-4">
        <AgentAppointmentsList appointments={past} emptyMessage={t('past.empty')} />
      </TabsContent>
      <TabsContent value="cancelled" className="space-y-4">
        <AgentAppointmentsList
          appointments={cancelled}
          emptyMessage={t('cancelled.empty')}
        />
      </TabsContent>
    </Tabs>
  );
}

'use client';

import { AgentAppointmentsTabs } from '@/components/appointments/agent-appointments-tabs';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ErrorCard } from '@/components/ui/error-card';
import { PageContainer } from '@/components/layouts/page-container';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function AgentAppointmentsPage() {
  const t = useTranslations('appointments');
  const { user } = useCurrentUser();

  const appointmentsData = useQuery(
    api.functions.appointment.getAppointmentsByUser,
    user?.membership?._id ? { userId: user.membership._id } : 'skip',
  );

  const { upcoming, past, cancelled } = {
    upcoming: appointmentsData?.filter((apt) => apt.startAt > Date.now()) ?? [],
    past: appointmentsData?.filter((apt) => apt.startAt <= Date.now()) ?? [],
    cancelled: appointmentsData?.filter((apt) => apt.status === 'cancelled') ?? [],
  };

  if (!user) {
    return <ErrorCard />;
  }

  if (appointmentsData === undefined) {
    return (
      <PageContainer title={t('title')} description={t('description')}>
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <AgentAppointmentsTabs upcoming={upcoming} past={past} cancelled={cancelled} />
    </PageContainer>
  );
}

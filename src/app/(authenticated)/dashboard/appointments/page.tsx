'use client';

import { AgentAppointmentsTabs } from '@/components/appointments/agent-appointments-tabs';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUserAppointments } from '@/hooks/use-appointments';
import { ErrorCard } from '@/components/ui/error-card';
import { PageContainer } from '@/components/layouts/page-container';

export default function AgentAppointmentsPage() {
  const t = useTranslations('appointments');
  const { user } = useCurrentUser();

  const { upcoming, past, cancelled, isLoading } = useUserAppointments(
    user?._id,
    undefined,
  );

  if (!user) {
    return <ErrorCard />;
  }

  if (isLoading) {
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

import { AgentAppointmentsTabs } from '@/components/appointments/agent-appointments-tabs';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth/utils';
import { getUserAppointments } from '@/actions/appointments';
import { ErrorCard } from '@/components/ui/error-card';
import { PageContainer } from '@/components/layouts/page-container';

export default async function AgentAppointmentsPage() {
  const t = await getTranslations('appointments');
  const user = await getCurrentUser();

  if (!user) {
    return <ErrorCard />;
  }

  // Récupérer les rendez-vous de l'agent
  const { data, error } = await getUserAppointments({ agentId: user?.id });

  if (error) {
    return <ErrorCard description={error} />;
  }

  return (
    <PageContainer title={t('title')} description={t('description')}>
      {data && (
        <AgentAppointmentsTabs
          upcoming={data.upcoming}
          past={data.past}
          cancelled={data.cancelled}
        />
      )}
    </PageContainer>
  );
}

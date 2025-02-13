import { AgentAppointmentsTabs } from '@/components/appointments/agent-appointments-tabs';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/actions/user';
import { getUserAppointments } from '@/actions/appointments';
import { ErrorCard } from '@/components/ui/error-card';

export default async function AgentAppointmentsPage() {
  const t = await getTranslations('appointments');
  const user = await getCurrentUser();

  if (!user) {
    return (
      <ErrorCard
        title={'Une erreur est survenue'}
        description={'Vous devez être connecté pour accéder à cette page'}
      />
    );
  }

  // Récupérer les rendez-vous de l'agent
  const { data, error } = await getUserAppointments({ agentId: user?.id });

  if (error) {
    return <ErrorCard title={'Une erreur est survenue'} description={error} />;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      {data && (
        <AgentAppointmentsTabs
          upcoming={data.upcoming}
          past={data.past}
          cancelled={data.cancelled}
        />
      )}
    </>
  );
}

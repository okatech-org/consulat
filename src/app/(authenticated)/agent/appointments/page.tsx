import { AgentAppointmentsTabs } from '@/components/appointments/agent-appointments-tabs';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/actions/user';
import { db } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';

export default async function AgentAppointmentsPage() {
  const t = await getTranslations('appointments');
  const user = await getCurrentUser();

  // Récupérer les rendez-vous de l'agent
  const appointments = await db.appointment.findMany({
    where: {
      agentId: user?.id,
    },
    include: {
      organization: true,
      request: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Grouper les rendez-vous par statut
  const now = new Date();
  const grouped = appointments.reduce(
    (acc, appointment) => {
      const appointmentDate = new Date(appointment.date);
      if (appointment.status === AppointmentStatus.CANCELLED) {
        acc.cancelled.push(appointment);
      } else if (appointmentDate < now) {
        acc.past.push(appointment);
      } else {
        acc.upcoming.push(appointment);
      }
      return acc;
    },
    {
      upcoming: [],
      past: [],
      cancelled: [],
    } as {
      upcoming: typeof appointments;
      past: typeof appointments;
      cancelled: typeof appointments;
    },
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <AgentAppointmentsTabs
        upcoming={grouped.upcoming}
        past={grouped.past}
        cancelled={grouped.cancelled}
      />
    </div>
  );
}

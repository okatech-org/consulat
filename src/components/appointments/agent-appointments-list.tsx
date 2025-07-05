import { AgentAppointmentCard } from './agent-appointment-card';
import type { AppointmentWithRelations } from '@/schemas/appointment';

interface AgentAppointmentsListProps {
  appointments: AppointmentWithRelations[];
  emptyMessage: string;
}

export function AgentAppointmentsList({
  appointments,
  emptyMessage,
}: AgentAppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <p className="mt-4 text-lg font-semibold">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AgentAppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}

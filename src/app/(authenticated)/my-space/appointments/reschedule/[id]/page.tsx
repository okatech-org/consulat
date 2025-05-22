import { getAppointment } from '@/actions/appointments';
import { RescheduleAppointmentForm } from '@/components/appointments/reschedule-appointment-form';
import { PageContainer } from '@/components/layouts/page-container';
import { ErrorCard } from '@/components/ui/error-card';
import { ROUTES } from '@/schemas/routes';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface RescheduleAppointmentPageProps {
  params: {
    id: string;
  };
}

export default async function RescheduleAppointmentPage({
  params,
}: RescheduleAppointmentPageProps) {
  const t = await getTranslations('appointments');
  const appointment = await getAppointment(params.id);

  return (
    <PageContainer
      title={t('reschedule.title')}
      description={t('reschedule.description')}
      action={
        <Link
          href={ROUTES.user.appointments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-icon" />
          {'Retour'}
        </Link>
      }
    >
      {appointment ? (
        <RescheduleAppointmentForm appointment={appointment} />
      ) : (
        <ErrorCard
          title={t('reschedule.error.not_found')}
          description={t('reschedule.error.not_found_description')}
        />
      )}
    </PageContainer>
  );
}

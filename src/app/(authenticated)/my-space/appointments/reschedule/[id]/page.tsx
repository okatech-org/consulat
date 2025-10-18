'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { RescheduleAppointmentForm } from '@/components/appointments/reschedule-appointment-form';
import { ErrorCard } from '@/components/ui/error-card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

export default function RescheduleAppointmentPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations('appointments');

  const appointmentId = params.id as Id<'appointments'>;

  const appointment = useQuery(
    api.functions.appointment.getAppointment,
    appointmentId ? { appointmentId } : 'skip',
  );

  const isLoading = appointment === undefined;

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
          {t('actions.back')}
        </Link>
      }
    >
      {isLoading && <LoadingSkeleton variant="grid" />}
      {!appointment && !isLoading && (
        <ErrorCard
          title={t('reschedule.error.not_found')}
          description={t('reschedule.error.not_found_description')}
        />
      )}
      {appointment && !isLoading && (
        <RescheduleAppointmentForm appointment={appointment} />
      )}
    </PageContainer>
  );
}

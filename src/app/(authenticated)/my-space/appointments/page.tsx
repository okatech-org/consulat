import { getCurrentUser } from '@/actions/user';
import { AppointmentsTabs } from '@/components/appointments/appointments-tabs';
import { getUserAppointments } from '@/actions/appointments';
import { ErrorCard } from '@/components/ui/error-card';
import { PageContainer } from '@/components/layouts/page-container';
import { Calendar } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default async function UserAppointmentsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('appointments');

  if (!user) {
    return undefined;
  }

  const { error, data } = await getUserAppointments({ userId: user.id });

  if (error) {
    return <ErrorCard />;
  }

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      action={
        <Link
          className={buttonVariants({ variant: 'default' })}
          href={ROUTES.user.new_appointment}
        >
          <Calendar className="mr-2 size-4" />
          <span>{t('new.button')}</span>
        </Link>
      }
    >
      <AppointmentsTabs
        appointments={data ?? { upcoming: [], past: [], cancelled: [] }}
      />
    </PageContainer>
  );
}

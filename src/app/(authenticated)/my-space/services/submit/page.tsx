import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { ServiceSubmissionForm } from '@/components/services/service-submission-form';
import { getTranslations } from 'next-intl/server';
import { tryCatch } from '@/lib/utils';
import { ServiceErrorCard } from '@/components/services/service-error-card';
import { getFullService } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { api } from '@/trpc/server';

export default async function ServiceSubmissionPage({
  searchParams,
}: {
  searchParams: { serviceId: string };
}) {
  const awaitedParams = await searchParams;
  const serviceId = awaitedParams.serviceId;
  const t = await getTranslations('services');
  const userProfile = await api.profile.getCurrent();

  const { data: serviceDetails, error } = await tryCatch(getFullService(serviceId));

  if (!serviceDetails || !userProfile || error) {
    return (
      <div className="container mx-auto py-6">
        <Link href={ROUTES.user.services}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.backToServices')}
          </Button>
        </Link>
        <ServiceErrorCard backText={t('actions.backToServices')} />
      </div>
    );
  }

  return <ServiceSubmissionForm service={serviceDetails} userProfile={userProfile} />;
}

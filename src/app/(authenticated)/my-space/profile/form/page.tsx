import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import { getActiveCountries } from '@/actions/countries';
import { api } from '@/trpc/server';
import CardContainer from '@/components/layouts/card-container';
import { getTranslations } from 'next-intl/server';

export default async function ProfilePage() {
  const tInputs = await getTranslations('inputs');
  const profile = await api.profile.getCurrent();

  const availableCountries = await getActiveCountries();

  return (
    <PageContainer title={tInputs('newProfile.title')}>
      <Suspense fallback={<LoadingSkeleton />}>
        {profile && (
          <RegistrationForm availableCountries={availableCountries} profile={profile} />
        )}
        {!profile && <CardContainer title="Profile non trouvé"></CardContainer>}
      </Suspense>
    </PageContainer>
  );
}

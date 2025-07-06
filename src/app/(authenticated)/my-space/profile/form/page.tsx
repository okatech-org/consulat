'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import { useCurrentProfile } from '@/hooks/use-profile';
import { api } from '@/trpc/react';
import CardContainer from '@/components/layouts/card-container';
import { useTranslations } from 'next-intl';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function ProfileFormPageClient() {
  const tInputs = useTranslations('inputs');
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: availableCountries, isLoading: countriesLoading } =
    api.countries.getActive.useQuery();

  if (profileLoading || countriesLoading) {
    return (
      <PageContainer title={tInputs('newProfile.title')}>
        <LoadingSkeleton variant="form" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={tInputs('newProfile.title')}>
      {profile && availableCountries && (
        <RegistrationForm availableCountries={availableCountries} profile={profile} />
      )}
      {!profile && <CardContainer title="Profile non trouvé"></CardContainer>}
    </PageContainer>
  );
}

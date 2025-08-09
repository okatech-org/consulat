'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import CardContainer from '@/components/layouts/card-container';
import { api } from '@/trpc/react';
import { useTranslations } from 'next-intl';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function ProfileFormPage() {
  const tInputs = useTranslations('inputs');
  const { data: profile, isLoading: profileLoading } = api.profile.getCurrent.useQuery();
  const { data: availableCountries } = api.countries.getActive.useQuery();

  if (profileLoading) {
    return (
      <PageContainer title={tInputs('newProfile.title')}>
        <LoadingSkeleton variant="form" className="!w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={tInputs('newProfile.title')}>
      {!profile && <CardContainer title="Profile non trouvé"></CardContainer>}

      {profile && (
        <RegistrationForm
          availableCountries={availableCountries ?? []}
          profile={profile}
        />
      )}
    </PageContainer>
  );
}

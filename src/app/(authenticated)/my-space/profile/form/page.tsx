'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import CardContainer from '@/components/layouts/card-container';
import { useUserData } from '@/hooks/use-role-data';
import { api } from '@/trpc/react';
import { useTranslations } from 'next-intl';

export default function ProfileFormPage() {
  const tInputs = useTranslations('inputs');
  const { profile } = useUserData();
  const { data: availableCountries } = api.countries.getActive.useQuery();

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

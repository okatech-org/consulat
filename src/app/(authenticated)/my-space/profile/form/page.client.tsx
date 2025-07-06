'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import { useCurrentProfile } from '@/hooks/use-profile';
import { api } from '@/trpc/react';
import CardContainer from '@/components/layouts/card-container';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileFormPageClient() {
  const tInputs = useTranslations('inputs');
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: availableCountries, isLoading: countriesLoading } =
    api.countries.getActive.useQuery();

  if (profileLoading || countriesLoading) {
    return (
      <PageContainer title={tInputs('newProfile.title')}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
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

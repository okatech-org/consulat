'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import CardContainer from '@/components/layouts/card-container';
import { useTranslations } from 'next-intl';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ProfileFormPage() {
  const tInputs = useTranslations('inputs');
  const { user } = useCurrentUser();

  const profile = useQuery(
    api.functions.profile.getCurrentProfile,
    user ? { profileId: user.profileId } : 'skip',
  );

  if (profile === undefined) {
    return (
      <PageContainer title={tInputs('newProfile.title')}>
        <LoadingSkeleton variant="form" className="!w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={tInputs('newProfile.title')}>
      {!profile && <CardContainer title="Profile non trouvé"></CardContainer>}

      {profile && <RegistrationForm profile={profile} />}
    </PageContainer>
  );
}

'use client';

import { useChildProfile } from '@/hooks/use-child-profiles';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';

import {
  calculateChildProfileCompletion,
  getChildProfileFieldsStatus,
} from '@/lib/utils';
import { ProfileHeader } from '../../profile/_utils/components/profile-header';
import { ProfileStatusAlert } from '../../profile/_utils/components/profile-status-alert';
import { ChildProfileTabs } from '../_components/profile-tabs';
import { ProfileCompletion } from '../../profile/_utils/components/profile-completion';
import { SubmitProfileButton } from '../../profile/_utils/components/submit-profile-button';
import { PageContainer } from '@/components/layouts/page-container';

interface ChildProfilePageClientProps {
  profileId: string;
}

export default function ChildProfilePageClient({
  profileId,
}: ChildProfilePageClientProps) {
  const { profile, isLoading, isError } = useChildProfile(profileId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive mb-4">Profil enfant non trouvé</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  const completionRate = calculateChildProfileCompletion(profile);
  const fieldStatus = getChildProfileFieldsStatus(profile);

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <ProfileHeader profile={profile} inMySpace={true} />
        <ProfileStatusAlert
          status={profile.status}
          notes={undefined}
          requestId={undefined}
        />
      </div>
      <div className="grid grid-cols-8 gap-4">
        <ChildProfileTabs profile={profile} />
        <div className={'col-span-full flex flex-col gap-4 lg:col-span-2'}>
          {/* Notes section temporairement désactivé */}
          <ProfileCompletion completionRate={completionRate} fieldStatus={fieldStatus} />

          {![
            'SUBMITTED',
            'PENDING',
            'VALIDATED',
            'READY_FOR_PICKUP',
            'COMPLETED',
          ].includes(profile.status) && (
            <div className="flex flex-col items-center">
              <SubmitProfileButton
                canSubmit={completionRate === 100}
                profileId={profile.id}
                isChild={true}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

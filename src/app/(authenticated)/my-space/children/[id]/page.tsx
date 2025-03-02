import { NotesList } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/requests/review-notes';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getUserFullProfileById } from '@/lib/user/getters';
import {
  calculateChildProfileCompletion,
  getChildProfileFieldsStatus,
  tryCatch,
} from '@/lib/utils';
import { Suspense } from 'react';
import { ProfileHeader } from '../../profile/_utils/components/profile-header';
import { ProfileStatusAlert } from '../../profile/_utils/components/profile-status-alert';
import { ChildProfileTabs } from '../_components/profile-tabs';
import { ProfileCompletion } from '../../profile/_utils/components/profile-completion';
import { SubmitProfileButton } from '../../profile/_utils/components/submit-profile-button';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  console.log(id);

  if (!id) return undefined;

  const { data: profile } = await tryCatch(getUserFullProfileById(id));

  const completionRate = calculateChildProfileCompletion(profile);
  const fieldStatus = getChildProfileFieldsStatus(profile);

  if (!profile) {
    return undefined;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="flex flex-col gap-4">
        <ProfileHeader profile={profile} />
        <ProfileStatusAlert
          status={profile.status}
          notes={profile.requestsFor?.notes?.find((n) => n.type === 'FEEDBACK')?.content}
          requestId={profile.requestsFor?.id}
        />
      </div>
      <div className="grid grid-cols-8 gap-4">
        {profile && <ChildProfileTabs profile={profile} />}
        <div className={'col-span-full flex flex-col gap-4 lg:col-span-2'}>
          {profile.requestsFor?.notes && (
            <NotesList
              notes={profile.requestsFor.notes.filter((note) => note.type === 'FEEDBACK')}
            />
          )}
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
              />
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}

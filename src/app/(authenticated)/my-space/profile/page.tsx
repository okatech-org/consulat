import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import { PageContainer } from '@/components/layouts/page-container';
import { NotesList } from '@/components/requests/review-notes';
import { buttonVariants } from '@/components/ui/button';
import { calculateProfileCompletion } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import { Link, PlusIcon } from 'lucide-react';
import { ProfileHeader } from './_utils/components/profile-header';
import { ProfileProgressBar } from './_utils/components/profile-progress-bar';
import { ProfileStatusAlert } from './_utils/components/profile-status-alert';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';

export default async function ProfilePage() {
  const session = await auth();
  const profile = await api.profile.getCurrent();

  const registrationRequest = await api.profile.getRegistrationRequest({
    profileId: session?.user?.profileId ?? '',
  });

  if (!profile) {
    return (
      <PageContainer>
        <div className="flex flex-col gap-4">
          <p>
            Vous n&apos;avez pas de profil consulaire. Veuillez en créer un pour
            commencer.
          </p>
          <Link
            href={ROUTES.registration}
            className={buttonVariants({ variant: 'default' })}
          >
            <PlusIcon className="size-icon mr-1" />
            Créer un profil
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-full lg:col-span-5">
          <ProfileHeader profile={profile} inMySpace={true} />
        </div>
        <div className="col-span-full lg:col-span-3">
          <ProfileStatusAlert
            status={profile.status}
            notes={
              registrationRequest?.notes?.find((n) => n.type === 'FEEDBACK')?.content
            }
            requestId={registrationRequest?.id}
          />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-full flex flex-col gap-4 lg:col-span-5">
          <ProfileTabs profile={profile} />
        </div>
        <div className={'col-span-full flex flex-col gap-4 lg:col-span-3'}>
          {registrationRequest?.notes && registrationRequest?.notes?.length > 0 && (
            <NotesList
              notes={registrationRequest.notes.filter((note) => note.type === 'FEEDBACK')}
            />
          )}
          <ProfileProgressBar profile={profile} />

          {![
            'SUBMITTED',
            'PENDING',
            'VALIDATED',
            'READY_FOR_PICKUP',
            'COMPLETED',
          ].includes(profile.status) && (
            <div className="flex flex-col items-center">
              <SubmitProfileButton
                canSubmit={calculateProfileCompletion(profile) === 100}
                profileId={profile.id}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

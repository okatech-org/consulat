'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { NotesList } from '@/components/requests/review-notes';
import { calculateProfileCompletion } from '@/lib/utils';
import { ProfileHeader } from './_utils/components/profile-header';
import { ProfileProgressBar } from './_utils/components/profile-progress-bar';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function ProfilePage() {
  const { data: profile, isLoading } = api.profile.getCurrent.useQuery();
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSkeleton variant="form" className="!w-full" />
      </PageContainer>
    );
  }

  const registrationRequest = profile?.registrationRequest;

  if (!profile) {
    return (
      <PageContainer title="Aucun profil trouvé">
        <div className="flex flex-col gap-4">
          <p>Vous n&apos;avez pas de profil. Veuillez en créer un.</p>
          <Link
            href={ROUTES.user.profile_form}
            className={buttonVariants({ variant: 'outline' })}
          >
            Créer un profil
          </Link>
        </div>
      </PageContainer>
    );
  }

  const canSubmit = () => {
    if (profile.status !== 'DRAFT') {
      return false;
    }

    if (profile.validationRequestId) {
      return false;
    }

    if (calculateProfileCompletion(profile) !== 100) {
      return false;
    }

    return true;
  };

  return (
    <PageContainer>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-full">
          <ProfileHeader profile={profile} inMySpace={true} />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-full flex flex-col gap-4 lg:col-span-5">
          <ProfileTabs profile={profile} />
        </div>
        <div className={'col-span-full flex flex-col gap-4 lg:col-span-3'}>
          {registrationRequest && registrationRequest.notes?.length > 0 && (
            <NotesList
              notes={registrationRequest.notes.filter((note) => note.type === 'FEEDBACK')}
            />
          )}
          <ProfileProgressBar profile={profile} />

          <SubmitProfileButton canSubmit={canSubmit()} profileId={profile.id} />
        </div>
      </div>
    </PageContainer>
  );
}

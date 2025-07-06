'use client';

import { api } from '@/trpc/react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { calculateProfileCompletion } from '@/lib/utils';
import { NotesList } from '@/components/requests/review-notes';
import { ProfileProgressBar } from './_utils/components/profile-progress-bar';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';
import { ProfileHeader } from './_utils/components/profile-header';
import { ProfileStatusAlert } from './_utils/components/profile-status-alert';
import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useCurrentUser } from '@/contexts/user-context';

export default function ProfilePage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = api.profile.getCurrent.useQuery(
    undefined,
    { enabled: !!user },
  );

  const { data: registrationRequest, isLoading: registrationRequestLoading } =
    api.profile.getRegistrationRequest.useQuery(
      { profileId: profile?.id ?? '' },
      { enabled: !!profile?.id },
    );

  const { data: organizationInfos, isLoading: organizationInfosLoading } =
    api.organizations.getCountryInfos.useQuery(
      {
        organizationId: registrationRequest?.organizationId ?? '',
        countryCode: user?.countryCode ?? '',
      },
      { enabled: !!registrationRequest?.organizationId && !!user?.countryCode },
    );

  if (
    profileLoading ||
    userLoading ||
    registrationRequestLoading ||
    organizationInfosLoading
  ) {
    return (
      <PageContainer>
        <LoadingSkeleton variant="grid" aspectRatio="4/3" />
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer title="Profil non trouvé">
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

  const completionRate = calculateProfileCompletion(profile);

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
            organizationName={organizationInfos?.name}
            // organizationAddress={organizationInfos?.settings?.contact?.address}
            requestId={registrationRequest?.id}
          />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4">
        {profile && (
          <div className="col-span-full flex flex-col gap-4 lg:col-span-5">
            <ProfileTabs profile={profile} />
          </div>
        )}
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
                canSubmit={completionRate === 100}
                profileId={profile.id}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

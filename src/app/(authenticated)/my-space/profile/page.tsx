import React, { Suspense } from 'react';
import { getProfileRegistrationRequest, getUserFullProfile } from '@/lib/user/getters';
import { getCurrentUser } from '@/actions/user';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { calculateProfileCompletion } from '@/lib/utils';
import { NotesList } from '@/components/requests/review-notes';
import { ProfileProgressBar } from './_utils/components/profile-progress-bar';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';
import { ProfileHeader } from './_utils/components/profile-header';
import { ProfileStatusAlert } from './_utils/components/profile-status-alert';
import { getOrganisationCountryInfos } from '@/actions/organizations';
import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import { getActiveCountries } from '@/actions/countries';

type ProfilePageProps = {
  searchParams: Promise<{
    form: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [currentUser, searchParamsResult] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (!currentUser) return undefined;

  const profile = await getUserFullProfile(currentUser.id);

  if (!profile) return undefined;

  if (searchParamsResult.form) {
    const availableCountries = await getActiveCountries();
    return <RegistrationForm availableCountries={availableCountries} profile={profile} />;
  }

  const registrationRequest = await getProfileRegistrationRequest(profile.id);
  const completionRate = calculateProfileCompletion(profile);

  const organisationInfos =
    registrationRequest?.organizationId && currentUser.countryCode
      ? await getOrganisationCountryInfos(
          registrationRequest?.organizationId,
          currentUser.countryCode,
        )
      : null;

  return (
    <PageContainer>
      <Suspense fallback={<LoadingSkeleton />}>
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
              organizationName={organisationInfos?.name}
              organizationAddress={organisationInfos?.settings?.contact?.address}
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
                notes={registrationRequest.notes.filter(
                  (note) => note.type === 'FEEDBACK',
                )}
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
      </Suspense>
    </PageContainer>
  );
}

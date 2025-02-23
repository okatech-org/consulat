import React, { Suspense } from 'react';
import { getRegistrationRequestsFromUser, getUserFullProfile } from '@/lib/user/getters';
import { getCurrentUser } from '@/actions/user';
import { ROUTES } from '@/schemas/routes';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { InfoIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { calculateProfileCompletion, getProfileFieldsStatus } from '@/lib/utils';
import { NotesList } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/requests/review-notes';
import { ProfileCompletion } from './_utils/components/profile-completion';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';
import CardContainer from '@/components/layouts/card-container';
import { ProfileHeader } from './_utils/components/profile-header';
import { ProfileStatusAlert } from './_utils/components/profile-status-alert';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const t = await getTranslations('profile');

  if (!user) return undefined;

  const profile = await getUserFullProfile(user.id);
  const registrationRequest = await getRegistrationRequestsFromUser(user.id);

  const completionRate = calculateProfileCompletion(profile);
  const fieldStatus = getProfileFieldsStatus(profile);

  if (!profile) {
    return (
      <CardContainer title={t('title')} contentClass="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">{t('no_profile')}</p>
          <Link
            href={ROUTES.registration}
            className={
              buttonVariants({
                variant: 'default',
              }) + 'w-max'
            }
          >
            <Plus className="size-4" />
            {t('actions.create')}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <InfoIcon className="size-5 text-primary" />
          <h3 className="font-medium">{t('no_profile_help')}</h3>
        </div>
      </CardContainer>
    );
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="flex flex-col gap-4">
        <ProfileHeader profile={profile} />
        <ProfileStatusAlert
          status={profile.status}
          notes={registrationRequest?.notes?.find((n) => n.type === 'FEEDBACK')?.content}
          organizationName={registrationRequest?.organization?.name}
          organizationAddress={
            registrationRequest?.organization?.metadata?.FR?.settings?.contact?.address
              ?.firstLine
          }
        />
      </div>
      <div className="grid grid-cols-8 gap-4">
        {profile && <ProfileTabs profile={profile} />}
        <div className={'col-span-full flex flex-col gap-4 lg:col-span-2'}>
          {registrationRequest?.notes && (
            <NotesList
              notes={registrationRequest.notes.filter((note) => note.type === 'FEEDBACK')}
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

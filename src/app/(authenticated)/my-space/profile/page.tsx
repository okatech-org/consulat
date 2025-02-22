import React, { Suspense } from 'react';
import { getUserFullProfile } from '@/lib/user/getters';
import { getCurrentUser } from '@/actions/user';
import { ROUTES } from '@/schemas/routes';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { InfoIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { calculateProfileCompletion, getProfileFieldsStatus } from '@/lib/utils';
import { NotesList } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/requests/review-notes';
import { ProfileCompletion } from './_utils/components/profile-completion';
import { ProfileHeaderClient } from './_utils/components/profile-header-client';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const t = await getTranslations('profile');

  if (!user) return undefined;

  const profile = await getUserFullProfile(user.id);

  const completionRate = calculateProfileCompletion(profile);
  const fieldStatus = getProfileFieldsStatus(profile);

  if (!profile) {
    return (
      <div className={'container flex flex-col gap-4'}>
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className={'flex flex-col items-center gap-4'}>
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
          </CardContent>
        </Card>
        <div className="flex items-center gap-2">
          <InfoIcon className="size-5 text-primary" />
          <h3 className="font-medium">{t('no_profile_help')}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="flex flex-col gap-4">
          <ProfileHeaderClient profile={profile} />
        </div>
        <div className="grid grid-cols-8 gap-4">
          {profile && <ProfileTabs profile={profile} />}
          <div className={'col-span-full flex flex-col gap-4 lg:col-span-2'}>
            {profile.notes.filter((note) => note.type === 'FEEDBACK').length > 0 && (
              <NotesList
                notes={profile.notes.filter((note) => note.type === 'FEEDBACK')}
              />
            )}
            <ProfileCompletion
              completionRate={completionRate}
              fieldStatus={fieldStatus}
            />

            <div className="flex flex-col items-center">
              <SubmitProfileButton
                canSubmit={completionRate === 100 && profile.status !== 'SUBMITTED'}
                profileId={profile.id}
              />
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

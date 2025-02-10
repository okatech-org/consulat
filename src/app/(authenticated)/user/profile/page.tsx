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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotesList } from '@/app/(authenticated)/admin/_utils/components/profile/profile-notes';
import { BasicInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/basic-info-section';
import { ContactInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/contact-info-section';
import { FamilyInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/family-info-section';
import { ProfessionalInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/professional-info-section';
import { DocumentsSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/documents-section';
import { ProfileHeaderClient } from '@/app/(authenticated)/user/profile/_utils/components/profile-header-client';
import { ProfileCompletion } from '@/app/(authenticated)/user/profile/_utils/components/profile-completion';
import { SubmitProfileButton } from '@/app/(authenticated)/user/profile/_utils/components/submit-profile-button';
import { ProfileTabs } from './_utils/components/profile-tabs';

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

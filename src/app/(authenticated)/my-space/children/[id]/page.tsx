import { NotesList } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/requests/review-notes';
import CardContainer from '@/components/layouts/card-container';
import { buttonVariants } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getUserFullProfileById } from '@/lib/user/getters';
import {
  calculateProfileCompletion,
  getProfileFieldsStatus,
  tryCatch,
} from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import { Link, Plus, InfoIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ProfileCompletion } from '../_components/profile-completion';
import { ProfileHeader } from '../_components/profile-header';
import { ProfileStatusAlert } from '../_components/profile-status-alert';
import { ProfileTabs } from '../_components/profile-tabs';
import { SubmitProfileButton } from '../_components/submit-profile-button';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const t = await getTranslations('profile');

  if (!id) return undefined;

  const { data: profile } = await tryCatch(getUserFullProfileById(id));

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
          notes={profile.requestsFor?.notes?.find((n) => n.type === 'FEEDBACK')?.content}
          requestId={profile.requestsFor?.id}
        />
      </div>
      <div className="grid grid-cols-8 gap-4">
        {profile && <ProfileTabs profile={profile} />}
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

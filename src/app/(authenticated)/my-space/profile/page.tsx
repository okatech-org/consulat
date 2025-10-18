'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { NotesList } from '@/components/requests/review-notes';
import { ProfileHeader } from './_utils/components/profile-header';
import { ProfileProgressBar } from './_utils/components/profile-progress-bar';
import { ProfileTabs } from './_utils/components/profile-tabs';
import { SubmitProfileButton } from './_utils/components/submit-profile-button';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ProfilePage() {
  const profile = useQuery(api.functions.profile.getCurrentProfile);

  // Gérer le chargement
  if (profile === undefined) {
    return (
      <PageContainer>
        <LoadingSkeleton variant="form" className="!w-full" />
      </PageContainer>
    );
  }

  const registrationRequest = profile?.registrationRequest || null;

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
          {(() => {
            const rawNotes: Array<Record<string, unknown>> = Array.isArray(
              (registrationRequest as { notes?: unknown })?.notes,
            )
              ? ((
                  (registrationRequest as { notes?: unknown })?.notes as Array<unknown>
                ).filter(
                  (n): n is Record<string, unknown> =>
                    typeof n === 'object' && n !== null,
                ) as Array<Record<string, unknown>>)
              : [];
            const feedbackNotes = rawNotes.filter(
              (n) =>
                typeof n['type'] === 'string' &&
                (n['type'] as string).toLowerCase() === 'feedback',
            );
            return feedbackNotes.length > 0 ? (
              <NotesList notes={feedbackNotes as never[]} />
            ) : null;
          })()}
          <ProfileProgressBar profile={profile} />

          <SubmitProfileButton profile={profile} />
        </div>
      </div>
    </PageContainer>
  );
}

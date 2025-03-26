'use client';

import { FullProfile } from '@/types/profile';
import { ProfileView } from '../_components/profile-view';
import { ProfileContactForm } from '../_components/profile-contact-form';

interface ProfileDetailsViewProps {
  profile: FullProfile;
  hasFullAccess: boolean;
  canContact: boolean;
}

export function ProfileDetailsView({
  profile,
  hasFullAccess,
  canContact,
}: ProfileDetailsViewProps) {
  return (
    <>
      <ProfileView profile={profile} hasFullAccess={hasFullAccess} />

      {canContact && (
        <div className="mt-8">
          <ProfileContactForm
            profileId={profile.id}
            recipientName={`${profile.firstName} ${profile.lastName}`}
          />
        </div>
      )}
    </>
  );
}

'use client';

import { FullProfile } from '@/types/profile';
import { ProfileView } from '../_components/profile-view';
import { ProfileContactForm } from '../_components/profile-contact-form';
import { ServiceRequest } from '@prisma/client';

interface ProfileDetailsViewProps {
  profile: FullProfile;
  hasFullAccess: boolean;
  canContact: boolean;
  requests?: ServiceRequest[];
}

export function ProfileDetailsView({
  profile,
  hasFullAccess,
  canContact,
  requests,
}: ProfileDetailsViewProps) {
  return (
    <>
      <ProfileView profile={profile} hasFullAccess={hasFullAccess} requests={requests} />

      {canContact && (
        <div className="mt-8">
          <ProfileContactForm
            userId={profile.userId ?? profile.user?.id ?? ''}
            recipientEmail={profile.user?.email ?? ''}
            recipientName={`${profile.firstName} ${profile.lastName}`}
          />
        </div>
      )}
    </>
  );
}

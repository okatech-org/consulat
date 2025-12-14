'use client';

import { useTranslations } from 'next-intl';
import { Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStatusBadge } from './profile-status-badge';
import { ConsularCardPreview } from '@/app/(authenticated)/my-space/profile/_utils/components/consular-card-preview';
import CardContainer from '@/components/layouts/card-container';
import { generateVCardString } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import type { CompleteChildProfile, CompleteProfile } from '@/convex/lib/types';
import { ProfileStatus } from '@/convex/lib/constants';

interface ChildProfileHeaderProps {
  profile: CompleteChildProfile;
  inMySpace?: boolean;
}

export function ChildProfileHeader({ profile, inMySpace = false }: ChildProfileHeaderProps) {
  const t = useTranslations('profile');

  // Générer les initiales à partir du profil
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  // Adapter for ConsularCardPreview which expects CompleteProfile
  // We map CompleteChildProfile to CompleteProfile structure for the shared component
  // We assume childProfile structure matches CompleteProfile enough for the card preview
  // specifically: status, personal, consularCard, and we map documents.identityPicture to identityPicture
  const profileForCard = {
    ...profile,
    identityPicture: profile.documents?.identityPicture,
  } as unknown as CompleteProfile;

  const identityPictureUrl = profile.documents?.identityPicture?.fileUrl;

  return (
    <CardContainer contentClass="flex items-center gap-2 px-2 py-3 flex-row md:gap-6 md:px-6 md:py-6">
      <Avatar className="size-16 bg-muted md:size-32">
        {identityPictureUrl ? (
          <AvatarImage
            src={identityPictureUrl}
            alt={profile.personal.firstName || ''}
          />
        ) : (
          <AvatarFallback>
            {getInitials(profile.personal.firstName, profile.personal.lastName) ||
              '?'}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 w-full md:text-left">
        <div className="flex flex-col gap-y-1 gap-x-2 md:flex-row md:gap-x-4 md:gap-y-0">
          <h1 className="text-lg font-bold md:text-3xl">
            {`${profile.personal.firstName} ${profile.personal.lastName}`}
          </h1>
          {inMySpace && <ProfileStatusBadge status={profile.status as ProfileStatus} />}
        </div>

        <div className="mt-2 flex w-full flex-row flex-wrap items-center gap-1 md:mt-4 md:gap-2">
           {/* Sharing actions removed as Child Profile might not have contact info structured the same or be shareable in the same way yet.
               Can be added back if needed. */}
          {inMySpace && <ConsularCardPreview profile={profileForCard} />}
        </div>
      </div>
    </CardContainer>
  );
}

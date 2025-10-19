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
import type { CompleteProfile } from '@/convex/lib/types';
import { ProfileStatus } from '@/convex/lib/constants';

interface ProfileHeaderProps {
  profile: CompleteProfile;
  inMySpace?: boolean;
}

export function ProfileHeader({ profile, inMySpace = false }: ProfileHeaderProps) {
  const t = useTranslations('profile');

  const onShare = async () => {
    if (!profile) return;

    const vCardData = {
      firstName: profile.personal?.firstName || '',
      lastName: profile.personal?.lastName || '',
      emails: profile.contacts?.email ? [{ value: profile.contacts.email }] : [],
      phones: profile.contacts?.phone ? [profile.contacts.phone] : [],
      photoUrl: profile.identityPicture?.fileUrl || undefined,
    };

    const vCard = generateVCardString(vCardData);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.personal?.firstName?.trim() || 'Contact',
          text: 'Carte de contact consulaire',
          url: `${ROUTES.listing.profile(profile._id)}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.personal?.firstName?.trim() || 'contact'}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const onDownload = () => {
    if (!profile) return;

    const vCardData = {
      firstName: profile.personal?.firstName || '',
      lastName: profile.personal?.lastName || '',
      emails: profile.contacts?.email ? [{ value: profile.contacts.email }] : [],
      phones: [profile.contacts?.phone || ''],
      photoUrl: profile.identityPicture?.fileUrl || undefined,
    };

    const vCard = generateVCardString(vCardData);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.personal?.firstName?.trim() + ' ' + profile.personal?.lastName?.trim() || 'contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Générer les initiales à partir du profil
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };
  return (
    <CardContainer contentClass="flex items-center gap-2 px-2 py-3 flex-row md:gap-6 md:px-6 md:py-6">
      <Avatar className="size-16 bg-muted md:size-32">
        {profile?.identityPicture ? (
          <AvatarImage
            src={profile?.identityPicture.fileUrl}
            alt={profile?.personal?.firstName || ''}
          />
        ) : (
          <AvatarFallback>
            {getInitials(profile?.personal?.firstName, profile?.personal?.lastName) ||
              '?'}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 w-full md:text-left">
        <div className="flex flex-col gap-y-1 gap-x-2 md:flex-row md:gap-x-4 md:gap-y-0">
          <h1 className="text-lg font-bold md:text-3xl">
            {`${profile?.personal?.firstName} ${profile?.personal?.lastName}`}
          </h1>
          {inMySpace && <ProfileStatusBadge status={profile?.status as ProfileStatus} />}
        </div>

        <div className="mt-2 flex w-full flex-row flex-wrap items-center gap-1 md:mt-4 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:px-3"
            onClick={onShare}
            aria-label={t('actions.share')}
          >
            <Share2 className="size-4 mr-1" />
            {t('actions.share')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="md:px-3"
            onClick={onDownload}
            aria-label={t('actions.download')}
          >
            <Download className="size-4 mr-1" />
            {t('actions.download')}
          </Button>
          {inMySpace && <ConsularCardPreview profile={profile} />}
        </div>
      </div>
    </CardContainer>
  );
}

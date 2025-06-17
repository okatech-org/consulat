'use client';

import { useTranslations } from 'next-intl';
import { Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FullProfile } from '@/types';
import { ProfileStatusBadge } from './profile-status-badge';
import { ConsularCardPreview } from '@/app/(authenticated)/my-space/profile/_utils/components/consular-card-preview';
import CardContainer from '@/components/layouts/card-container';
import { generateVCardString } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';

interface ProfileHeaderProps {
  profile: FullProfile;
  inMySpace?: boolean;
}

export function ProfileHeader({ profile, inMySpace = false }: ProfileHeaderProps) {
  const t = useTranslations('profile');

  const onShare = async () => {
    if (!profile) return;

    const vCardData = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      emails: profile.email ? [{ value: profile.email }] : [],
      phones: profile.user?.phoneNumber ? [profile.user.phoneNumber] : [],
      photoUrl: profile.identityPicture?.fileUrl || undefined,
    };

    const vCard = generateVCardString(vCardData);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.firstName?.trim() || 'Contact',
          text: 'Carte de contact consulaire',
          url: `${ROUTES.listing.profile(profile.id)}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.firstName?.trim() || 'contact'}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const onDownload = () => {
    if (!profile) return;

    const vCardData = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      emails: profile.email ? [{ value: profile.email }] : [],
      phones: [profile.user?.phoneNumber || ''],
      photoUrl: profile.identityPicture?.fileUrl || undefined,
    };

    const vCard = generateVCardString(vCardData);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.firstName?.trim() + ' ' + profile.lastName?.trim() || 'contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CardContainer contentClass="flex flex-col items-center gap-2 px-2 py-3 md:flex-row md:gap-6 md:px-6 md:py-6">
      <Avatar className="size-16 bg-muted md:size-32">
        {profile?.identityPicture ? (
          <AvatarImage
            src={profile?.identityPicture.fileUrl}
            alt={profile?.firstName || ''}
          />
        ) : (
          <AvatarFallback>{profile?.lastName?.charAt(0) || '?'}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex flex-col items-center gap-y-1 gap-x-2 md:flex-row md:gap-x-4 md:gap-y-0">
          <h1 className="text-lg font-bold md:text-3xl">
            {`${profile?.firstName} ${profile?.lastName}`}
          </h1>
          {inMySpace && <ProfileStatusBadge status={profile?.status || 'DRAFT'} />}
        </div>

        <div className="mt-2 flex w-full flex-row flex-wrap items-center justify-center gap-1 md:mt-4 md:justify-start md:gap-2">
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

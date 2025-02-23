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

interface ProfileHeaderProps {
  profile: FullProfile;
  organisationInfos?: {
    logo?: string;
    name?: string;
  };
}

export function ProfileHeader({ profile, organisationInfos }: ProfileHeaderProps) {
  const t = useTranslations('profile');

  const onShare = async () => {
    if (!profile) return;

    const vCardData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      emails: profile.email ? [{ value: profile.email }] : [],
      phones: profile.phone
        ? [{ value: `${profile.phone.countryCode}${profile.phone.number}` }]
        : [],
      photoUrl: profile.identityPicture?.fileUrl || undefined,
    };

    const vCard = generateVCardString(vCardData);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.firstName || 'Contact',
          text: 'Carte de contact consulaire',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.firstName || 'contact'}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const onDownload = () => {
    if (!profile) return;

    const vCardData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      emails: profile.email ? [{ value: profile.email }] : [],
      phones: profile.phone
        ? [{ value: `${profile.phone.countryCode}${profile.phone.number}` }]
        : [],
      photoUrl: profile.identityPicture?.fileUrl || undefined,
    };

    const vCard = generateVCardString(vCardData);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.firstName + ' ' + profile.lastName || 'contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CardContainer contentClass="flex flex-col items-center gap-4 md:flex-row md:gap-6">
      <Avatar className="size-24 md:size-32">
        {profile?.identityPicture ? (
          <AvatarImage
            src={profile?.identityPicture.fileUrl}
            alt={profile?.firstName || ''}
          />
        ) : (
          <AvatarFallback>{profile?.lastName?.charAt(0) || '?'}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col items-center gap-x-2 md:flex-row md:gap-x-4">
          <h1 className="text-2xl font-bold md:text-3xl">
            {`${profile?.firstName} ${profile?.lastName}`}
          </h1>
          <ProfileStatusBadge status={profile?.status || 'DRAFT'} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="size-4" />
            {t('actions.share')}
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="size-4" />
            {t('actions.download')}
          </Button>
          <ConsularCardPreview
            profile={profile}
            organizationLogo={organisationInfos?.logo}
            organizationName={organisationInfos?.name}
            cardNumber={profile.cardNumber}
            issuedAt={profile.cardIssuedAt}
            expiresAt={profile.cardExpiresAt}
          />
        </div>
      </div>
    </CardContainer>
  );
}

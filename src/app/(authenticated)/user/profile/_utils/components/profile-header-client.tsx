'use client';

import { ProfileHeader } from './profile-header';
import { generateVCardString } from '@/lib/utils';
import { FullProfile } from '@/types';

interface ProfileHeaderClientProps {
  profile: FullProfile;
}

export function ProfileHeaderClient({ profile }: ProfileHeaderClientProps) {
  const handleShare = async () => {
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

  const handleDownload = () => {
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
    <ProfileHeader profile={profile} onShare={handleShare} onDownload={handleDownload} />
  );
}

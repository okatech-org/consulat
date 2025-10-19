'use client';

import { useTranslations } from 'next-intl';
import type { CompleteChildProfile } from '@/convex/lib/types';
import { EditableSection } from '../../../profile/_utils/components/editable-section';
import CardContainer from '@/components/layouts/card-container';
import { InfoField } from '@/components/ui/info-field';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import { ParentalRole } from '@/convex/lib/constants';

interface LinkInfoSectionProps {
  profile: CompleteChildProfile;
}

export function LinkInfoSection({ profile }: LinkInfoSectionProps) {
  const t_registration = useTranslations('registration');

  const getParentalRoleLabel = (role: ParentalRole) => {
    switch (role) {
      case ParentalRole.Father:
        return t_registration('form.roles.FATHER');
      case ParentalRole.Mother:
        return t_registration('form.roles.MOTHER');
      case ParentalRole.LegalGuardian:
        return t_registration('form.roles.LEGAL_GUARDIAN');
      default:
        return role;
    }
  };

  return (
    <EditableSection>
      <div className="space-y-6">
        {profile?.parents.map((linkInfo) => (
          <CardContainer
            key={linkInfo.profileId}
            title={getParentalRoleLabel(linkInfo.role)}
          >
            <div className="grid grid-cols-2 gap-4">
              {linkInfo.phoneNumber && (
                <InfoField
                  label={t_registration('form.phone')}
                  value={linkInfo.phoneNumber}
                  required
                  className={'col-span-2'}
                />
              )}
              {linkInfo.email && (
                <InfoField
                  label={t_registration('form.email')}
                  value={linkInfo.email}
                  required
                  className={'col-span-2'}
                />
              )}
              {linkInfo.firstName && linkInfo.lastName && (
                <InfoField
                  label={t_registration('form.full_name')}
                  value={linkInfo.firstName + ' ' + linkInfo.lastName}
                  required
                  className={'col-span-2'}
                />
              )}

              <div className="col-span-2">
                <ProfileLookupSheet profileId={linkInfo.profileId} />
              </div>
            </div>
          </CardContainer>
        ))}
      </div>
    </EditableSection>
  );
}

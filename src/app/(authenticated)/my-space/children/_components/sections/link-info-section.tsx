'use client';

import { useTranslations } from 'next-intl';
import { ParentalRole } from '@prisma/client';
import type { FullProfile } from '@/types';
import { EditableSection } from '../../../profile/_utils/components/editable-section';
import CardContainer from '@/components/layouts/card-container';
import { InfoField } from '@/components/ui/info-field';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';

interface LinkInfoSectionProps {
  profile: FullProfile;
}

export function LinkInfoSection({ profile }: LinkInfoSectionProps) {
  const t_registration = useTranslations('registration');

  const getParentalRoleLabel = (role: ParentalRole) => {
    switch (role) {
      case ParentalRole.FATHER:
        return t_registration('form.roles.FATHER');
      case ParentalRole.MOTHER:
        return t_registration('form.roles.MOTHER');
      case ParentalRole.LEGAL_GUARDIAN:
        return t_registration('form.roles.LEGAL_GUARDIAN');
      default:
        return role;
    }
  };

  return (
    <EditableSection isEditing={false} isLoading={false}>
      <div className="space-y-6">
        {profile.parentAuthorities.map((authority) => (
          <CardContainer key={authority.id} title={getParentalRoleLabel(authority.role)}>
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                label={t_registration('form.first_name')}
                value={authority.parentUser.name}
                required
                className={'col-span-1'}
              />
              <InfoField
                label={t_registration('form.email')}
                value={authority.parentUser.email}
                required
                className={'col-span-1'}
              />
              <InfoField
                label={t_registration('form.parent_role')}
                value={getParentalRoleLabel(authority.role)}
                required
                className={'col-span-1'}
              />
              {authority.parentUser.phoneNumber && (
                <InfoField
                  label={t_registration('form.phone')}
                  value={authority.parentUser.phoneNumber}
                  required
                  className={'col-span-2'}
                />
              )}
              <div className="col-span-2">
                <ProfileLookupSheet userId={authority.parentUser.id} />
              </div>
            </div>
          </CardContainer>
        ))}
      </div>
    </EditableSection>
  );
}

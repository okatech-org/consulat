'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import type { FullProfile } from '@/types';
import { Heart, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FamilyInfoDisplayProps {
  profile: FullProfile;
}

export function FamilyInfoDisplay({ profile }: FamilyInfoDisplayProps) {
  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-6">
      {/* État civil */}
      <div className="space-y-4">
        <InfoField
          label={t_profile('maritalStatus')}
          value={
            profile.maritalStatus
              ? t_inputs(`maritalStatus.options.${profile.maritalStatus}`)
              : undefined
          }
          icon={<Heart className="size-4" />}
          required
        />

        {/* Conjoint */}
        {profile.spouseFullName && (
          <InfoField
            label={t_profile('spouseFullName')}
            value={profile.spouseFullName}
            icon={<Heart className="size-4" />}
          />
        )}
      </div>

      <Separator />

      {/* Parents */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Parents</h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label={t_profile('fatherFullName')}
            value={profile.fatherFullName}
            icon={<User className="size-4" />}
            required
          />

          <InfoField
            label={t_profile('motherFullName')}
            value={profile.motherFullName}
            icon={<User className="size-4" />}
            required
          />
        </div>
      </div>
    </div>
  );
}

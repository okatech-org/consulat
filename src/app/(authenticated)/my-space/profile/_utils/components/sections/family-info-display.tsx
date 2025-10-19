'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import { Heart, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { CompleteProfile } from '@/convex/lib/types';

interface FamilyInfoDisplayProps {
  profile: CompleteProfile;
}

export function FamilyInfoDisplay({ profile }: FamilyInfoDisplayProps) {
  if (!profile) return null;

  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-6">
      {/* État civil */}
      <div className="space-y-4">
        <InfoField
          label={t_profile('maritalStatus')}
          value={
            profile?.family?.maritalStatus
              ? t_inputs(`maritalStatus.options.${profile?.family?.maritalStatus}`)
              : undefined
          }
          icon={<Heart className="size-4" />}
          required
        />

        {/* Conjoint */}
        {profile?.family?.spouse?.firstName && profile?.family?.spouse?.lastName && (
          <InfoField
            label={t_profile('spouseFullName')}
            value={`${profile?.family?.spouse?.firstName} ${profile?.family?.spouse?.lastName}`}
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
            value={`${profile?.family?.father?.firstName} ${profile?.family?.father?.lastName}`}
            icon={<User className="size-4" />}
            required
          />

          <InfoField
            label={t_profile('motherFullName')}
            value={`${profile?.family?.mother?.firstName} ${profile?.family?.mother?.lastName}`}
            icon={<User className="size-4" />}
            required
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import type { FullProfile } from '@/types';
import { Briefcase, Building, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProfessionalInfoDisplayProps {
  profile: FullProfile;
}

export function ProfessionalInfoDisplay({ profile }: ProfessionalInfoDisplayProps) {
  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-6">
      {/* Statut professionnel */}
      <InfoField
        label={t_profile('workStatus')}
        value={
          profile.workStatus
            ? t_inputs(`workStatus.options.${profile.workStatus}`)
            : undefined
        }
        icon={<Briefcase className="size-4" />}
        required
      />

      {/* Informations professionnelles */}
      {(profile.profession || profile.employer) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Informations professionnelles</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile.profession && (
                <InfoField
                  label={t_profile('profession')}
                  value={profile.profession}
                  icon={<Briefcase className="size-4" />}
                />
              )}

              {profile.employer && (
                <InfoField
                  label={t_profile('employer')}
                  value={profile.employer}
                  icon={<Building className="size-4" />}
                />
              )}
            </div>

            {/* Adresse de l'employeur */}
            {profile.employerAddress && (
              <InfoField
                label={t_profile('employerAddress')}
                value={profile.employerAddress}
                icon={<MapPin className="size-4" />}
              />
            )}
          </div>
        </>
      )}

      {/* Activité au Gabon */}
      {profile.activityInGabon && (
        <>
          <Separator />
          <InfoField
            label="Activité au Gabon"
            value={profile.activityInGabon}
            icon={<Briefcase className="size-4" />}
          />
        </>
      )}
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import { Briefcase, Building, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { CompleteProfile } from '@/convex/lib/types';

interface ProfessionalInfoDisplayProps {
  profile: CompleteProfile;
}

export function ProfessionalInfoDisplay({ profile }: ProfessionalInfoDisplayProps) {
  if (!profile) return null;
  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-6">
      {/* Statut professionnel */}
      <InfoField
        label={t_profile('workStatus')}
        value={
          profile.professionSituation?.workStatus
            ? t_inputs(`workStatus.options.${profile.professionSituation?.workStatus}`)
            : undefined
        }
        icon={<Briefcase className="size-4" />}
        required
      />

      {/* Informations professionnelles */}
      {(profile.professionSituation?.profession ||
        profile.professionSituation?.employer) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Informations professionnelles</h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile.professionSituation?.profession && (
                <InfoField
                  label={t_profile('profession')}
                  value={profile.professionSituation?.profession}
                  icon={<Briefcase className="size-4" />}
                />
              )}

              {profile.professionSituation?.employer && (
                <InfoField
                  label={t_profile('employer')}
                  value={profile.professionSituation?.employer}
                  icon={<Building className="size-4" />}
                />
              )}
            </div>

            {/* Adresse de l'employeur */}
            {profile.professionSituation?.employerAddress && (
              <InfoField
                label={t_profile('employerAddress')}
                value={profile.professionSituation?.employerAddress}
                icon={<MapPin className="size-4" />}
              />
            )}
          </div>
        </>
      )}

      {/* Activité au Gabon */}
      {profile.professionSituation?.activityInGabon && (
        <>
          <Separator />
          <InfoField
            label="Activité au Gabon"
            value={profile.professionSituation?.activityInGabon}
            icon={<Briefcase className="size-4" />}
          />
        </>
      )}
    </div>
  );
}

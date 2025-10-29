import { useTranslations } from 'next-intl';
import type { CompleteProfile } from '@/convex/lib/types';
import {
  CheckCircle2,
  XCircle,
  Briefcase,
  Building2,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { WorkStatus } from '@/convex/lib/constants';

interface ProfileProfessionalProps {
  profile: CompleteProfile;
}

export function ProfileProfessional({ profile }: ProfileProfessionalProps) {
  const t = useTranslations('admin.registrations.review');
  const t_inputs = useTranslations('inputs');

  const showEmployerInfo = profile.workStatus === WorkStatus.EMPLOYEE;
  const showProfessionInfo =
    profile.workStatus === WorkStatus.EMPLOYEE ||
    profile.workStatus === WorkStatus.ENTREPRENEUR;

  return (
    <div className="space-y-4">
      {/* Statut professionnel */}
      <CardContainer title={t('sections.work_status')}>
        <div className="flex items-center gap-3">
          <Briefcase className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {t_inputs('workStatus.label')}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {profile.workStatus
                  ? t_inputs(`workStatus.options.${profile.workStatus}`)
                  : '-'}
              </p>
            </div>
          </div>
          {profile.workStatus ? (
            <CheckCircle2 className="text-success size-5" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
        </div>
      </CardContainer>

      {/* Informations professionnelles */}
      {showProfessionInfo && (
        <CardContainer title={t('sections.professional_info')} contentClass="space-y-4">
          <div className="flex items-center gap-3">
            <Briefcase className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {t_inputs('profession.label')}
              </p>
              <p className="font-medium">{profile.profession || '-'}</p>
            </div>
            {profile.profession ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>

          {showEmployerInfo && (
            <>
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t_inputs('employer.label')}
                  </p>
                  <p className="font-medium">{profile.employer || '-'}</p>
                </div>
                {profile.employer ? (
                  <CheckCircle2 className="text-success size-5" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t_inputs('employerAddress.label')}
                  </p>
                  <p className="font-medium">{profile.employerAddress || '-'}</p>
                </div>
                {profile.employerAddress ? (
                  <CheckCircle2 className="text-success size-5" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
              </div>
            </>
          )}
        </CardContainer>
      )}

      {/* Activité au Gabon */}
      <CardContainer title={t('sections.gabon_activity')}>
        <div className="flex items-center gap-3">
          <GraduationCap className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {t_inputs('activityInGabon.label')}
            </p>
            <p className="font-medium">{profile.activityInGabon || '-'}</p>
          </div>
          {profile.activityInGabon ? (
            <CheckCircle2 className="text-success size-5" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
        </div>
      </CardContainer>
    </div>
  );
}

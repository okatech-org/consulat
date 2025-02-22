import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { CheckCircle2, Briefcase, Building2, MapPin, GraduationCap } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';

interface ProfileProfessionalProps {
  profile: FullProfile;
}

export function ProfileProfessional({ profile }: ProfileProfessionalProps) {
  const t = useTranslations('admin.registrations.review');

  const showEmployerInfo = profile.workStatus === 'EMPLOYEE';
  const showProfessionInfo = ['EMPLOYEE', 'ENTREPRENEUR'].includes(
    profile.workStatus || '',
  );

  return (
    <div className="space-y-4">
      {/* Statut professionnel */}
      <CardContainer title={t('sections.work_status')}>
        <div className="flex items-center gap-3">
          <Briefcase className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t('fields.work_status')}</p>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {t(`work_status.${profile.workStatus?.toLowerCase()}`)}
              </p>
            </div>
          </div>
          <CheckCircle2 className="text-success size-5" />
        </div>
      </CardContainer>

      {/* Informations professionnelles */}
      {showProfessionInfo && (
        <CardContainer title={t('sections.professional_info')} contentClass="space-y-4">
          <div className="flex items-center gap-3">
            <Briefcase className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('fields.profession')}</p>
              <p className="font-medium">{profile.profession || '-'}</p>
            </div>
            <CheckCircle2 className="text-success size-5" />
          </div>

          {showEmployerInfo && (
            <>
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('fields.employer')}</p>
                  <p className="font-medium">{profile.employer || '-'}</p>
                </div>
                <CheckCircle2 className="text-success size-5" />
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t('fields.employer_address')}
                  </p>
                  <p className="font-medium">{profile.employerAddress || '-'}</p>
                </div>
                <CheckCircle2 className="text-success size-5" />
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
            <p className="text-sm text-muted-foreground">{t('fields.last_activity')}</p>
            <p className="font-medium">{profile.activityInGabon || '-'}</p>
          </div>
          {profile.activityInGabon && <CheckCircle2 className="text-success size-5" />}
        </div>
      </CardContainer>
    </div>
  );
}

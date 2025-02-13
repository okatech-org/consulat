import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Briefcase, Building2, MapPin, GraduationCap } from 'lucide-react';

interface ProfileProfessionalProps {
  profile: FullProfile;
}

export function ProfileProfessional({ profile }: ProfileProfessionalProps) {
  const t = useTranslations('actions.profiles.review');

  const showEmployerInfo = profile.workStatus === 'EMPLOYEE';
  const showProfessionInfo = ['EMPLOYEE', 'ENTREPRENEUR'].includes(
    profile.workStatus || '',
  );

  return (
    <div className="space-y-4">
      {/* Statut professionnel */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.work_status')}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Informations professionnelles */}
      {showProfessionInfo && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.professional_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <p className="text-sm text-muted-foreground">
                      {t('fields.employer')}
                    </p>
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
          </CardContent>
        </Card>
      )}

      {/* Activité au Gabon */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.gabon_activity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <GraduationCap className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('fields.last_activity')}</p>
              <p className="font-medium">{profile.activityInGabon || '-'}</p>
            </div>
            {profile.activityInGabon && <CheckCircle2 className="text-success size-5" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

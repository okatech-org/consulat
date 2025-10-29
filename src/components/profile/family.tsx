import { useTranslations } from 'next-intl';
import type { CompleteProfile } from '@/convex/lib/types';
import { CheckCircle2, XCircle, Users, User } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { Badge } from '@/components/ui/badge';
import { MaritalStatus } from '@/convex/lib/constants';

interface ProfileFamilyProps {
  profile: CompleteProfile;
}

export function ProfileFamily({ profile }: ProfileFamilyProps) {
  const t = useTranslations('admin.registrations.review');
  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-4">
      {/* État civil */}
      <CardContainer title={t('sections.civil_status')} contentClass="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {t_inputs('maritalStatus.label')}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {profile.maritalStatus
                  ? t_inputs(`maritalStatus.options.${profile.maritalStatus}`)
                  : '-'}
              </p>
              {profile.maritalStatus === MaritalStatus.MARRIED &&
                profile.spouseFullName && (
                  <Badge variant="outline">{profile.spouseFullName}</Badge>
                )}
            </div>
          </div>
          {profile.maritalStatus ? (
            <CheckCircle2 className="text-success size-5" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
        </div>

        {/* Afficher le nom du conjoint si marié */}
        {profile.maritalStatus === MaritalStatus.MARRIED && (
          <div className="flex items-center gap-3">
            <User className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {t_inputs('spouse.fullName.label')}
              </p>
              <p className="font-medium">{profile.spouseFullName || '-'}</p>
            </div>
            {profile.spouseFullName ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>
        )}
      </CardContainer>

      {/* Parents */}
      <CardContainer title={t('sections.parents')} contentClass="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {t_inputs('father.fullName.label')}
              </p>
              <p className="font-medium">{profile.fatherFullName || '-'}</p>
            </div>
            {profile.fatherFullName ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <User className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {t_inputs('mother.fullName.label')}
              </p>
              <p className="font-medium">{profile.motherFullName || '-'}</p>
            </div>
            {profile.motherFullName ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>
        </div>
      </CardContainer>
    </div>
  );
}

import { useTranslations } from 'next-intl'
import { FullProfile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, User, Users, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProfileFamilyProps {
  profile: FullProfile
}

export function ProfileFamily({ profile }: ProfileFamilyProps) {
  const t = useTranslations('admin.profiles.review')

  return (
    <div className="space-y-4">
      {/* État civil */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.civil_status')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('fields.marital_status')}</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {t(`marital_status.${profile.maritalStatus?.toLowerCase()}`)}
                </p>
                {profile.maritalStatus === 'MARRIED' && profile.spouseFullName && (
                  <Badge variant="outline">{profile.spouseFullName}</Badge>
                )}
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        </CardContent>
      </Card>

      {/* Parents */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.parents')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('fields.father')}</p>
                <p className="font-medium">{profile.fatherFullName || '-'}</p>
              </div>
              {profile.fatherFullName ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('fields.mother')}</p>
                <p className="font-medium">{profile.motherFullName || '-'}</p>
              </div>
              {profile.motherFullName ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact d'urgence */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.emergency_contact')}</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.emergencyContact ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('fields.full_name')}</p>
                  <p className="font-medium">{profile.emergencyContact.fullName}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('fields.relationship')}</p>
                  <p className="font-medium">{profile.emergencyContact.relationship}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('fields.phone')}</p>
                  <p className="font-medium">{profile.emergencyContact.phone}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">{t('no_emergency_contact')}</p>
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
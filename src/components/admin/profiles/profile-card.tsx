import { useTranslations } from 'next-intl'
import { FullProfile } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProfileStatusBadge } from '@/components/profile/profile-status-badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ProfileCardProps {
  profile: FullProfile
  onClick: () => void
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const t = useTranslations('admin.profiles')
  const t_countries = useTranslations('countries')

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center space-y-0 gap-4">
        <Avatar className="h-10 w-10">
          {profile.identityPicture ? (
            <AvatarImage src={profile.identityPicture} alt={profile.firstName} />
          ) : (
            <AvatarFallback>{profile.firstName[0]}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">
            {profile.firstName} {profile.lastName}
          </h3>
          <ProfileStatusBadge status={profile.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          {t('fields.nationality')}: {t_countries(profile.nationality)}
        </p>
        <p>
          {t('fields.birth')}: {format(new Date(profile.birthDate), 'PPP', { locale: fr })}
        </p>
        <p>
          {t('fields.submitted')}: {format(new Date(profile.updatedAt), 'PPP', { locale: fr })}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClick}>
          {t('actions.review')}
        </Button>
      </CardFooter>
    </Card>
  )
}
import { useTranslations } from 'next-intl'
import {
  Share2,
  Download,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge, BadgeVariant } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FullProfile } from '@/types'
import { ConsularCardPreview } from '@/components/profile/consular-card-preview'

interface ProfileHeaderProps {
  profile: FullProfile
  onShare?: () => void
  onDownload?: () => void
}

export function ProfileHeader({
                                profile,
                                onShare,
                                onDownload
                              }: ProfileHeaderProps) {
  const t = useTranslations('profile')
  const t_countries = useTranslations('countries')

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Avatar className="size-24 md:size-32">
            {profile?.identityPicture ? (
              <AvatarImage
                src={profile?.identityPicture}
                alt={profile?.firstName || ''}
              />
            ) : (
              <AvatarFallback>
                {profile?.lastName?.charAt(0) || '?'}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col items-center gap-x-2 md:flex-row md:gap-x-4">
              <h1 className="text-2xl font-bold md:text-3xl">
                {`${profile?.firstName} ${profile?.lastName}`}
              </h1>
              <Badge
                variant={profile?.status?.toLowerCase() as BadgeVariant}
                className="h-6"
              >
                {t(`status.${profile?.status?.toLowerCase()}`)}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.nationality && (
                <span className="flex items-center justify-center gap-1 md:justify-start">
                  <Shield className="size-4" />
                  {t('fields.nationality')}: {t_countries(profile.nationality)}
                </span>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
              >
                <Share2 className="size-4" />
                {t('actions.share')}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="size-4" />
                {t('actions.download')}
              </Button>

              <ConsularCardPreview profile={profile} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'PROFILE_CREATED' | 'PROFILE_UPDATED' | 'PROFILE_VALIDATED' | 'DOCUMENT_UPLOADED'
  user: {
    name: string | null
    image: string | null
  }
  createdAt: Date
  metadata?: {
    profileId?: string
    documentType?: string
  }
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const t = useTranslations('actions.dashboard.activity')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <Avatar className="size-9">
                <AvatarImage src={activity.user.image || undefined} />
                <AvatarFallback>
                  {activity.user.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">
                  {t(`types.${activity.type.toLowerCase()}`, {
                    user: activity.user.name,
                    document: activity.metadata?.documentType
                      ? t(`documents.${activity.metadata.documentType.toLowerCase()}`)
                      : undefined
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(activity.createdAt), 'PPp', { locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
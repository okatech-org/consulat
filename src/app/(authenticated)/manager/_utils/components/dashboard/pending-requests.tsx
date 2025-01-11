// src/components/actions/dashboard/pending-requests.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from 'next-intl'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceRequestStatus } from '@prisma/client'

export function PendingRequests() {
  const t = useTranslations('actions.dashboard')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pending_requests.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Liste des demandes en attente */}
          <RequestItem
            name="John Doe"
            type="PASSPORT"
            status="SUBMITTED"
            date="2024-03-20"
          />
          {/* Ajouter d'autres demandes */}
        </div>
      </CardContent>
    </Card>
  )
}

function RequestItem({ name, type, status, date }: {
  name: string,
  type: string,
  status: ServiceRequestStatus,
  date: string
}) {
  const t = useTranslations('common')

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">
          {t(`request_types.${type.toLowerCase()}`)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={status === 'SUBMITTED' ? 'warning' : 'default'}>
          {t(`status.${status.toLowerCase()}`)}
        </Badge>
        <Button size="sm">
          {t('actions.review')}
        </Button>
      </div>
    </div>
  )
}
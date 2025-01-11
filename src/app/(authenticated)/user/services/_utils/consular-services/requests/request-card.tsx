'use client'

import { useTranslations } from 'next-intl'
import { ServiceRequest } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

interface RequestCardProps {
  request: ServiceRequest & {
    service: { type: string; title: string }
    appointment?: { date: Date } | null
  }
}

export function RequestCard({ request }: RequestCardProps) {
  const t = useTranslations('consular.services.requests')
  const t_base = useTranslations('consular.services')

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t_base(`types.${request.service.type.toLowerCase()}`)}
          </CardTitle>
          <Badge variant={getStatusVariant(request.status)}>
            {t(`status.${request.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {request.service.title}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {t('submitted_on', {
              date: format(new Date(request.createdAt), 'PPP', { locale: fr }),
            })}
          </span>
        </div>

        {request.appointment && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {t('appointment_on', {
                date: format(new Date(request.appointment.date), 'PPP', {
                  locale: fr,
                }),
              })}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto gap-2">
          {t('actions.view')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function getStatusVariant(status: string): 'default' | 'success' | 'destructive' | 'warning' {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
      return 'destructive'
    case 'PENDING':
      return 'warning'
    default:
      return 'default'
  }
}
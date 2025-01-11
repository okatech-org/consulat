'use client'

import { ConsularService } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Clock, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/schemas/routes'

interface ServiceCardProps {
  service: ConsularService
  disabled?: boolean
}

export function ServiceCard({ service, disabled }: ServiceCardProps) {
  const t = useTranslations('consular.services')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t(`types.${service.type.toLowerCase()}`)}
          </CardTitle>
          <Badge variant={disabled ? "outline" : "default"}>
            {disabled ? t('status.unavailable') : t('status.available')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {service.description}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{service.estimatedTime || t('estimated_time.unknown')}</span>
        </div>

        {service.requiredDocuments.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>
              {t('required_documents', { count: service.requiredDocuments.length })}
            </span>
          </div>
        )}

        {disabled && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{t('messages.complete_profile')}</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={ROUTES.service_view(service.id)}
          className={buttonVariants({
            variant: 'default',
            className: `w-full ${disabled ? "cursor-not-allowed" : ""}`,
          })}
        >
          {t('actions.view')}
        </Link>
      </CardFooter>
    </Card>
  )
}
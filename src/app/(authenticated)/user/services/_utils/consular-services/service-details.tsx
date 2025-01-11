'use client'
import { useTranslations } from 'next-intl'
import { ConsularService, UserDocument } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  CreditCard,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'

interface ServiceDetailsProps {
  service: ConsularService
  documents: UserDocument[]
}

export function ServiceDetails({ service, documents }: ServiceDetailsProps) {
  const t = useTranslations('consular.services')
  const router = useRouter()

  // Vérifier quels components sont déjà fournis
  const existingDocuments = service.requiredDocuments.filter(
    doc => documents?.some(d => d.type === doc)
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          {t(`types.${service.type.toLowerCase()}`)}
        </h1>
        <p className="text-muted-foreground">{service.description}</p>
      </div>

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle>{t('details.main_info')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('details.duration')}</p>
              <p className="text-sm text-muted-foreground">
                {service.estimatedTime || t('estimated_time.unknown')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('details.price')}</p>
              <p className="text-sm text-muted-foreground">
                {service.price
                  ? t('details.price_value', { price: service.price })
                  : t('details.price_free')
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{t('details.components')}</p>
              <p className="text-sm text-muted-foreground">
                {t('details.required_documents_count', {
                  count: service.requiredDocuments.length
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents requis */}
      <Card>
        <CardHeader>
          <CardTitle>{t('details.required_documents')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {service.requiredDocuments.map(doc => {
            const isProvided = existingDocuments.includes(doc)

            return (
              <div
                key={doc}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {isProvided ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                  <div>
                    <p className="font-medium">
                      {t(`documents.types.${doc.toLowerCase()}`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`documents.descriptions.${doc.toLowerCase()}`)}
                    </p>
                  </div>
                </div>
                <Badge variant={isProvided ? "success" : "warning"}>
                  {isProvided
                    ? t('details.document_provided')
                    : t('details.document_to_provide')
                  }
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-end">
        <Button
          onClick={() => router.push(ROUTES.service_start(service.id))}
          size="lg"
        >
          {t('actions.start_procedure')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
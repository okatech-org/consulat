'use client'

import { ServiceFormData, ServiceStepConfig } from '@/types/consular-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import {
  AppointmentReview,
  DocumentsReview,
  InformationReview,
} from '@/components/consular-services/service-form/review'

interface ReviewStepProps {
  service: {
    steps: ServiceStepConfig[]
  }
  data: ServiceFormData
  onEdit: (step: number) => void
}

export function ReviewStep({ service, data, onEdit }: ReviewStepProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="space-y-6">
      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('review.documents')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEdit(0)}>
            <Pencil className="h-4 w-4" />
            {t('actions.edit')}
          </Button>
        </CardHeader>
        <CardContent>
          <DocumentsReview documents={data.documents} />
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('review.information')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
            <Pencil className="h-4 w-4" />
            {t('actions.edit')}
          </Button>
        </CardHeader>
        <CardContent>
          <InformationReview
            data={data.information}
            fields={service.steps[1].fields || []}
          />
        </CardContent>
      </Card>

      {/* Rendez-vous si présent */}
      {data.appointment && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('review.appointment')}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
              <Pencil className="h-4 w-4" />
              {t('actions.edit')}
            </Button>
          </CardHeader>
          <CardContent>
            <AppointmentReview appointment={data.appointment} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
'use client'

import { UseFormReturn } from 'react-hook-form'
import { ServiceField, ServiceFormData } from '@/types/consular-service'
import { DynamicField } from './dynamic-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { InfoIcon } from 'lucide-react'

interface InformationStepProps {
  fields: ServiceField[]
  form: UseFormReturn<ServiceFormData>
  isSubmitting: boolean
}

export function InformationStep({ fields, form, isSubmitting }: InformationStepProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {t('prefilled_fields_info')}
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {fields.map((field) => (
              <DynamicField
                key={field.name}
                data={field}
                form={form}
                isPreFilled={!!form.getValues().information[field.name]}
                disabled={isSubmitting}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { ServiceField } from '@/types/consular-service'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslations } from 'next-intl'

interface InformationReviewProps {
  data: Record<string, any>
  fields: ServiceField[]
}

export function InformationReview({ data, fields }: InformationReviewProps) {
  const t = useTranslations('consular.services.form')

  const formatFieldValue = (field: ServiceField, value: any) => {
    if (!value) return t('not_provided')

    switch (field.type) {
      case 'date':
        return format(new Date(value), 'PPP', { locale: fr })
      case 'select':
        const option = field.options?.find(opt => opt.value === value)
        return option?.label || value
      case 'tel':
        // Formater le numéro de téléphone si nécessaire
        return value
      default:
        return value
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </p>
          <p className="font-medium">
            {formatFieldValue(field, data[field.name])}
          </p>
        </div>
      ))}
    </div>
  )
}
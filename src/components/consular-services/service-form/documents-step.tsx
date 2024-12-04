'use client'

import { UseFormReturn } from 'react-hook-form'
import { ServiceDocument, ServiceFormData } from '@/types/consular-service'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { FormField } from '@/components/ui/form'
import { useTranslations } from 'next-intl'

interface DocumentsStepProps {
  documents: ServiceDocument[]
  form: UseFormReturn<ServiceFormData>
  isSubmitting: boolean
}

export function DocumentsStep({ documents, form, isSubmitting }: DocumentsStepProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t('documents.alert.title')}</AlertTitle>
        <AlertDescription>{t('documents.alert.description')}</AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {documents.map((doc) => (
          <FormField
            key={doc.type}
            control={form.control}
            name={`documents.${doc.type}`}
            render={({ field }) => (
              <DocumentUploadField
                id={doc.type}
                label={t(`documents.types.${doc.type.toLowerCase()}`)}
                description={doc.description}
                required={doc.required}
                accept={doc.acceptedFormats?.join(',')}
                maxSize={doc.maxSize}
                field={field}
                form={form}
                disabled={isSubmitting}
              />
            )}
          />
        ))}
      </div>
    </div>
  )
}
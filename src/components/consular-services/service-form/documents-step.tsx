import { DocumentType } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { ServiceField, ServiceFieldType, ServiceStep } from '@/types/consular-service'
import { generateFormSchema } from '@/lib/form/schema-generator'
import { Form, FormField } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { FormNavigation } from '@/components/consular-services/service-form/form-navigation'
import { MobileProgress } from '@/components/registration/mobile-progress'
import { DocumentStatus } from '@/components/ui/info-field'
import { Separator } from '@/components/ui/separator'

interface DocumentsStepProps {
  requiredDocuments: DocumentType[]
  profilDocuments?:  Partial<Record<DocumentType, string>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (Data: any) => void
  isLoading?: boolean
  formRef: React.RefObject<HTMLFormElement>
  navigation?: {
    steps: ServiceStep[]
    currentStep: number
    handleFinalSubmit: () => void
    handleNext: () => void
    handlePrevious: () => void
  }
}

export function DocumentsStep({
                                requiredDocuments,
                                onSubmit,
                                formRef,
                                profilDocuments,
                                navigation,
                                isLoading = false,
                              }: DocumentsStepProps) {
  const t = useTranslations('consular')
  const ref = React.useRef<HTMLFormElement>(null)

  const documentsFields: ServiceField[] = requiredDocuments.map((name) => {
    const field: ServiceField = {
      name,
      type: ServiceFieldType.FILE,
      required: true,
      label: t(`documents.types.${name.toLowerCase()}`),
      description: t(`documents.descriptions.${name.toLowerCase()}`),
      defaultValue: profilDocuments?.[name],
    }

    return field
  })

  const documentsSchema = generateFormSchema(documentsFields)

  const documentsForm = useForm<typeof documentsSchema>({
    resolver: zodResolver(documentsSchema),
  })

  function handleFormSubmit(data: typeof documentsSchema) {
    onSubmit(data)
  }

  return (
    <Form {...documentsForm}>
      <form ref={ref} onSubmit={documentsForm.handleSubmit(handleFormSubmit)} className={"space-y-4"}>
        <Card className="overflow-hidden">
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="sync">
              {profilDocuments && Object.keys(profilDocuments).map((key) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={"md:col-span-2 space-y-3"}
                >
                  <DocumentStatus
                    type={t(`documents.types.${key.toLowerCase()}`)}
                    isUploaded={profilDocuments[key as DocumentType] !== undefined}
                    customText={t('documents.status.already_provided')}
                  />
                  <Separator />
                </motion.div>
              ))
              }
              {documentsFields.map((item, index) => (
                <motion.div
                  key={item.name + index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FormField
                    control={documentsForm.control}
                    name={// eslint-disable-next-line @typescript-eslint/no-explicit-any
                      item.name as any
                    }
                    render={({ field }) => (
                      <DocumentUploadField
                        id={item.name}
                        field={field}
                        label={item.label}
                        required={item.required}
                        description={item.description}
                        form={documentsForm}
                      />
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
        {navigation && (
          <>
            <FormNavigation
              currentStep={navigation.currentStep}
              totalSteps={navigation.steps.length}
              isLoading={isLoading}
              onNext={() => {
                formRef.current?.dispatchEvent(new Event('submit', { cancelable: true }))
              }}
              onPrevious={navigation.handlePrevious}
              isValid={true}
              onSubmit={navigation.handleFinalSubmit}
            />

            {/* Progression mobile */}
            <MobileProgress
              currentStep={navigation.currentStep}
              totalSteps={navigation.steps.length}
              stepTitle={navigation.steps[navigation.currentStep].title}
              isOptional={false}
            />
          </>
        )}
      </form>
    </Form>
  )
}
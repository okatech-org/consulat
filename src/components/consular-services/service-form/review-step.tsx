import { useTranslations } from 'next-intl'
import { ServiceStep } from '@/types/consular-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { FormNavigation } from './form-navigation'
import { MobileProgress } from '@/components/registration/mobile-progress'
import React from 'react'
import { DocumentStatus, InfoField } from '@/components/ui/info-field'

interface ReviewStepProps {
  steps: ServiceStep[]
  onEdit: (stepIndex: number) => void
  isLoading?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formValues?: Record<string, Record<string, any> | undefined>
  navigation?: {
    steps: ServiceStep[]
    currentStep: number
    handleFinalSubmit: () => void
    handleNext: () => void
    handlePrevious: () => void
  }
}

export function ReviewStep({
                             steps,
                             navigation,
                             onEdit,
                             formValues,
                             isLoading = false,
                           }: ReviewStepProps) {
  const t = useTranslations('common')

  function getFieldValue(stepKey: string, fieldName: string) {
    if (!formValues) {
      return undefined
    }

    return formValues[stepKey]?.[fieldName]
  }

  return (
    <div className="space-y-6">
      {/* Filtrer les étapes pour exclure l'étape de revue elle-même */}
      {steps.filter(step => step.id !== "review").map((step, index) => (
        <Card key={step.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-md">{step.title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              {t('actions.edit')}
            </Button>
          </CardHeader>
          <CardContent>
            {/* Afficher les champs selon leur type */}
            {step.fields?.map((field, fieldIndex) => {
              if (field.type === "file") {
                return (
                  <DocumentStatus
                    key={fieldIndex + field.name}
                    type={field.label}
                    isUploaded={field.defaultValue}
                    required={field.required}
                  />
                )
              }

              if (field.type === "date") {
                return (
                  <InfoField
                    required={field.required}
                    label={field.label}
                    key={fieldIndex + field.name}
                    value={getFieldValue(step.id, field.name) ? new Date(getFieldValue(step.id, field.name)).toLocaleDateString() : undefined}
                  />
                )
              }

              return (
                <InfoField
                  required={field.required}
                  label={field.label}
                  key={fieldIndex + field.name}
                  value={getFieldValue(step.id, field.name)}
                />
              )
            })}
          </CardContent>
        </Card>
      ))}

      {navigation && (
        <>
          <FormNavigation
            currentStep={navigation.currentStep}
            totalSteps={navigation.steps.length}
            isLoading={isLoading}
            onNext={navigation.handleNext}
            onPrevious={navigation.handlePrevious}
            isValid={true}
            onSubmit={navigation.handleFinalSubmit}
          />

          <MobileProgress
            currentStep={navigation.currentStep}
            totalSteps={navigation.steps.length}
            stepTitle={navigation.steps[navigation.currentStep].title}
            isOptional={false}
          />
        </>
      )}
    </div>
  )
}
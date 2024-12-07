import { useTranslations } from 'next-intl'
import { ServiceStep } from '@/types/consular-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { FormNavigation } from '@/components/consular-services/service-form/form-navigation'
import { MobileProgress } from '@/components/registration/mobile-progress'
import React from 'react'
import { DocumentStatus, InfoField} from '@/components/ui/info-field'

interface ReviewStepProps {
  steps: ServiceStep[]
  onEdit: (stepIndex: number) => void,
  isLoading?: boolean
  navigation?: {
    steps: ServiceStep[]
    currentStep: number
    handleFinalSubmit: () => void
    handleNext: () => void
    handlePrevious: () => void
  }
}

export function ReviewStep({ steps, navigation, onEdit, isLoading = false }: ReviewStepProps) {
  const t = useTranslations('common.actions')

  return (
    <div className="space-y-6">
      {steps.filter(item => item.key !== "review").map((step, index) => (
        <Card key={step.key}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{step.title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              {t('edit')}
            </Button>
          </CardHeader>
          <CardContent>
            {step.fields?.map((field, index) => {
              if (field.type === "file") {
                return <DocumentStatus
                  key={index + field.name}
                  type={field.label}
                  isUploaded={!!field.defaultValue}
                  required={true}
                />
              }

              if (field.type === "date") {
                return <InfoField
                  required={true}
                  label={field.label}
                  key={index + field.name}
                  value={new Date(field.defaultValue).toLocaleDateString()}
                />
              }

              return <InfoField
                required={true}
                label={field.label}
                key={index + field.name}
                value={field.defaultValue}
              />
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

          {/* Progression mobile */}
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
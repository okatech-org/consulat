// src/components/consular-services/service-form/index.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ServiceFormData,
  ServiceFormSchema,
  ServiceStepConfig,
  ServiceStepType
} from '@/types/consular-service'
import { FullProfile } from '@/types'
import { DocumentsStep } from '@/components/consular-services/service-form/documents-step'
import { StepIndicator } from '@/components/consular-services/service-form/step-indicator'
import { InformationStep } from '@/components/consular-services/service-form/information-step'
import { AppointmentStep } from '@/components/consular-services/service-form/appointment-step'
import { ReviewStep } from '@/components/consular-services/service-form/review-step'
import { FormNavigation } from '@/components/registration/navigation'

interface ServiceFormProps {
  service: {
    id: string
    steps: ServiceStepConfig[]
    requiresAppointment: boolean
  }
  profile: FullProfile | null
  defaultValues?: Partial<ServiceFormData>
}

export function ServiceForm({ service, profile, defaultValues }: ServiceFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formulaire principal avec validation Zod
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      documents: {},
      information: {},
      ...defaultValues
    }
  })

  // Pré-remplir les champs depuis le profil
  useEffect(() => {
    if (profile) {
      const currentStepConfig = service.steps[currentStep]
      if (currentStepConfig.type === ServiceStepType.INFORMATION) {
        const prefillData = currentStepConfig.fields?.reduce((acc, field) => {
          if (field.profileField && profile[field.profileField]) {
            acc[field.name] = profile[field.profileField]
          }
          return acc
        }, {} as Record<string, any>)

        if (prefillData) {
          form.reset({ ...form.getValues(), information: prefillData })
        }
      }
    }
  }, [currentStep, profile, service.steps, form])

  // Rendu de l'étape courante
  const renderCurrentStep = () => {
    const stepConfig = service.steps[currentStep]

    switch (stepConfig.type) {
      case ServiceStepType.DOCUMENTS:
        return (
          <DocumentsStep
            documents={stepConfig.documents || []}
            form={form}
            isSubmitting={isSubmitting}
          />
        )

      case ServiceStepType.INFORMATION:
        return (
          <InformationStep
            fields={stepConfig.fields || []}
            form={form}
            isSubmitting={isSubmitting}
          />
        )

      case ServiceStepType.APPOINTMENT:
        return (
          <AppointmentStep
            form={form}
            isSubmitting={isSubmitting}
          />
        )

      case ServiceStepType.REVIEW:
        return (
          <ReviewStep
            service={service}
            data={form.getValues()}
            onEdit={setCurrentStep}
          />
        )

      default:
        return null
    }
  }

  // Navigation entre les étapes
  const handleNext = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      if (currentStep === service.steps.length - 1) {
        await handleSubmit()
      } else {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  // Soumission finale
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const data = form.getValues()

      // Logique de soumission...

    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator
        steps={service.steps}
        currentStep={currentStep}
        onChange={setCurrentStep}
      />

      {renderCurrentStep()}

      <FormNavigation
        currentStep={currentStep}
        totalSteps={service.steps.length}
        onNext={handleNext}
        onPrevious={() => setCurrentStep(prev => prev - 1)}
        isLoading={isSubmitting}
      />
    </div>
  )
}
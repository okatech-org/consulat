'use client'

import { ConsularService, ServiceField, ServiceFieldType, ServiceStep } from '@/types/consular-service'
import { useTranslations } from 'next-intl'
import { DocumentsStep } from './documents-step'
import { StepIndicator } from './step-indicator'
import { FullProfile } from '@/types'
import { DocumentType } from '@prisma/client'
import React, { useState } from 'react'
import { AppointmentStep } from '@/components/consular-services/service-form/appointment-step'
import DynamicStep from '@/components/consular-services/service-form/dynamic-step'
import { ReviewStep } from '@/components/consular-services/service-form/review-step'
import { useToast } from '@/hooks/use-toast'

interface ServiceFormProps {
  service: ConsularService
  profile: FullProfile | null
  defaultValues?: Record<string, unknown>
  isLoading?: boolean
  isComplete?: boolean
}

export function ServiceForm({
                              service,
                              profile,
                              defaultValues,
                            }: ServiceFormProps) {
  const t = useTranslations('consular.services.form')
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const currentFormRef = React.useRef<HTMLFormElement>(null)
  const [documentsForm, setDocumentsForm] = useState<Record<DocumentType, File | undefined>>()
  const [appointmentForm, setAppointmentForm] = useState<{
    date: string
    time: string
    duration: number
  }>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dynamicStepsForm, setDynamicStepsForm] = useState<Record<string, any>>();
  const {toast} = useToast()

  // Construire les étapes du formulaire
  const steps: ServiceStep[] = []

  if (service.requiredDocuments) {
    steps.push({
      key: 'documents',
      title: t('steps.documents'),
      description: t('steps.documents_description'),
      isComplete: false,
      component: renderDocumentsStep(),
      fields: service.requiredDocuments.map((name) => {
        return {
          name,
          type: ServiceFieldType.FILE,
          required: true,
          label: t(`documents.types.${name.toLowerCase()}`),
          description: t(`documents.descriptions.${name.toLowerCase()}`),
          defaultValue: documentsForm?.[name],
        }
      })
    })
  }

  if (service.steps.length > 0) {
    service.steps.forEach((step) => {
      if (!step.fields) {
        return
      }

      steps.push({
        key: step.id ?? `step-${steps.length + 1}`,
        title: step.title,
        description: step.description ?? '',
        isComplete: false,
        fields: JSON.parse(step.fields as unknown as string).map((field: ServiceField) => {
          return {
            ...field,
            required: true,
            defaultValue: dynamicStepsForm?.[field.name],
          }
        }),
        component: <DynamicStep
          fields={formatServiceFields(step.fields as unknown as string)}
          onSubmit={data => {
          setDynamicStepsForm(prev => {
            return {
              ...prev,
              [step.key ?? `step-${steps.length + 1}`]: data
            }
          })
            handleNext()
        }}
          navigation={{
            steps,
            currentStep,
            handleFinalSubmit: handleSubmit,
            handleNext,
            handlePrevious
          }}
        />,
      })
    })
  }

  if (service.requiresAppointment) {
    steps.push({
      key: 'appointment',
      title: t('steps.appointment'),
      description: t('steps.appointment_description'),
      isComplete: false,
      fields: [
        {
          name: 'date',
          type: ServiceFieldType.DATE,
          required: true,
          label: t('appointment.appointment_date'),
          defaultValue: appointmentForm?.date,
        },
        {
          name: 'duration',
          type: ServiceFieldType.NUMBER,
          required: true,
          label: t('appointment.appointment_duration'),
          defaultValue: appointmentForm?.duration,
        }
      ],
      component: <AppointmentStep
        isLoading={isLoading}
        onSubmit={(data) => {
          setAppointmentForm(data)
          handleNext()
        }}
        navigation={{
          steps,
          currentStep,
          handleFinalSubmit: handleSubmit,
          handleNext,
          handlePrevious
        }}
      />,
    })
  }

  steps.push({
    key: 'review',
    title: t('steps.review'),
    description: t('steps.review_description'),
    isComplete: false,
    component: <ReviewStep
      steps={steps}
      onEdit={(index) => setCurrentStep(index)}
      isLoading={isLoading}
      navigation={{
        steps,
        currentStep,
        handleFinalSubmit: handleSubmit,
        handleNext,
        handlePrevious
      }}
    />,
  })

  function formatServiceFields(fields: string) {
    const fieldArray = JSON.parse(fields)

    return fieldArray.map((field: ServiceField) => {
      return {
        ...field,
        required: true,
        defaultValue: defaultValues?.[field.name],
      }
    })
  }

  function renderDocumentsStep() {
    const profileDocuments = {
      [DocumentType.PASSPORT]: profile?.passport?.fileUrl,
      [DocumentType.PROOF_OF_ADDRESS]: profile?.addressProof?.fileUrl,
      [DocumentType.RESIDENCE_PERMIT]: profile?.residencePermit?.fileUrl,
      [DocumentType.IDENTITY_PHOTO]: profile?.identityPicture,
      [DocumentType.BIRTH_CERTIFICATE]: profile?.birthCertificate?.fileUrl,
    } as Record<DocumentType, string>
    return (
      <DocumentsStep
        formRef={currentFormRef}
        requiredDocuments={service.requiredDocuments}
        profilDocuments={profileDocuments}
        onSubmit={(data) => {
          setDocumentsForm(data)
          handleNext()
        }}
        isLoading={isLoading}
        navigation={{
          steps,
          currentStep,
          handleFinalSubmit: handleSubmit,
          handleNext,
          handlePrevious
        }}
      />
    )
  }


  function handleNext() {
    setCurrentStep(currentStep + 1)
  }

  function handlePrevious() {
    setCurrentStep(currentStep - 1)
  }

  async function handleSubmit() {
    setIsLoading(true);
    try {
      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: "success"
      });
    } catch (error) {
      toast({
        title: t('error.title'),
        description: error instanceof Error ? error.message : t('error.unknown'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Rendu de l'étape courante
  const renderCurrentStep = () => {
    return steps[currentStep].component
  }

  return (
    <div className={"mb-8 space-y-6"}>
      <div>
        <div className="text-center">
          <h1 className="text-2xl font-bold md:text-3xl">
            {service.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {service.description}
          </p>
        </div>

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
        />
      </div>
      {renderCurrentStep()}
    </div>
  )
}
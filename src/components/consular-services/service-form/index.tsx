'use client'

import { ServiceField, ServiceFieldType, ServiceStep } from '@/types/consular-service'
import { useTranslations } from 'next-intl'
import { DocumentsStep } from './documents-step'
import { StepIndicator } from './step-indicator'
import { FullProfile } from '@/types'
import { DocumentType, ConsularService } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { AppointmentStep } from '@/components/consular-services/service-form/appointment-step'
import DynamicStep from '@/components/consular-services/service-form/dynamic-step'
import { ReviewStep } from '@/components/consular-services/service-form/review-step'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'
import { createFormStorage } from '@/lib/form-storage'

interface ServiceFormProps {
  service: ConsularService & {
    steps: ServiceStep[]
    requiredDocuments: DocumentType[]
    requiresAppointment: boolean
  }
  profile: FullProfile | null
  defaultValues?: Record<string, unknown>
  consulateId: string
}

export function ServiceForm({
                              service,
                              profile,
                              defaultValues,
                              consulateId
                            }: ServiceFormProps) {
  const t = useTranslations('consular.services.form')
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { saveData, loadSavedData, clearData } = createFormStorage('service_form_data');
  const { saveData: saveDocuments, loadSavedData: loadSaveDocuments, clearData: clearDocuments } = createFormStorage('service_form_documents');
  const { saveData: saveAppointment, loadSavedData: loadAppointment, clearData: clearAppointment } = createFormStorage('service_form_appointment');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stepsData, setStepsData] = useState<Record<string, any>>(() => {
    // Charger les données sauvegardées au montage du composant
    return loadSavedData() || {};
  });
  const currentFormRef = React.useRef<HTMLFormElement>(null)
  const [documentsForm, setDocumentsForm] = useState<Record<DocumentType, File | undefined>>(
    loadSaveDocuments()
  )
  const [appointmentForm, setAppointmentForm] = useState<{
    date: string
    time: string
    duration: number
  }>(
    loadAppointment()
  )
  const {toast} = useToast()

  // Données des étapes dynamiques
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepSubmit = (stepKey: string, data: any) => {
    switch (stepKey) {
      case 'documents':
        setDocumentsForm(data)
        saveDocuments(data)
        break
      case 'appointment':
        setAppointmentForm(data)
        saveAppointment(data)
        break
      default:
        const updatedData = {
          ...stepsData,
          [stepKey]: data
        }
        setStepsData(updatedData);
    }

    handleNext();
  };

  // Construire les étapes du formulaire
  const steps: ServiceStep[] = []

  if (service.requiredDocuments) {
    steps.push({
      id: 'documents',
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
      }),
      defaultValues: documentsForm
    })
  }

  if (service.steps.length > 0) {
    service.steps.forEach((step) => {
      if (!step.fields) {
        return
      }

      steps.push({
        id: step.id,
        title: step.title,
        description: step.description ?? '',
        isComplete: false,
        fields: JSON.parse(step.fields as unknown as string).map((field: ServiceField) => {
          return {
            ...field,
            required: true,
          }
        }),
        defaultValues: stepsData[step.id],
        component: <DynamicStep
          fields={formatServiceFields(step.fields as unknown as string)}
          onSubmit={(data) => handleStepSubmit(step.id, data)}
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
      id: 'appointment',
      title: t('steps.appointment'),
      description: t('steps.appointment_description'),
      isComplete: false,
      fields: [
        {
          name: 'date',
          type: ServiceFieldType.DATE,
          required: true,
          label: t('appointment.appointment_date'),
        },
        {
          name: 'duration',
          type: ServiceFieldType.NUMBER,
          required: true,
          label: t('appointment.appointment_duration'),
        }
      ],
      defaultValues: appointmentForm,
      component: <AppointmentStep
        consulateId={consulateId}
        isLoading={isLoading}
        onSubmit={(data) => handleStepSubmit('appointment', data)}
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
    id: 'review',
    title: t('steps.review'),
    description: t('steps.review_description'),
    isComplete: false,
    component: <ReviewStep
      formValues={{
        ...stepsData,
        appointment: appointmentForm,
        documents: documentsForm
      }}
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
        onSubmit={(data) => handleStepSubmit('documents', data)}
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
      // 1. Préparer les données du formulaire
      const formData = new FormData();

      // 2. Ajouter les documents
      if (documentsForm) {
        Object.entries(documentsForm).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });
      }

      // 3. Ajouter les données des étapes dynamiques
      if (service.steps.length > 0) {
        formData.append('dynamicSteps', JSON.stringify(stepsData));
      }

      // 4. Ajouter les données du rendez-vous si présentes
      if (appointmentForm) {
        formData.append('appointment', JSON.stringify(appointmentForm));
      }

      // 5. Ajouter l'ID du service
      formData.append('serviceId', service.id);

      // 6. Appeler l'API pour soumettre la demande
      const response = await fetch('/api/services/submit', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(t('errors.submission_failed'));
      }

      // 7. Notification de succès
      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: "success"
      });

      clearData();
      clearDocuments();
      clearAppointment();

      // 8. Redirection après succès
      router.push(ROUTES.services);

    } catch (error) {
      // Gestion des erreurs
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

  useEffect(() => {
    saveData(stepsData);
  }, [saveData, stepsData]);

  useEffect(() => {
    return () => {
      clearData();
      clearDocuments();
      clearAppointment();
    }
  }, [clearAppointment, clearData, clearDocuments])

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
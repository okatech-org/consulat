'use client'

import { ServiceField, ServiceFieldType, ServiceStep } from '@/types/consular-service'
import { useTranslations } from 'next-intl'
import { DocumentsStep } from './documents-step'
import { StepIndicator } from './step-indicator'
import { AppUserDocument, FullProfile, ProfileKey } from '@/types'
import { DocumentType, ConsularService, DocumentStatus, UserDocument } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { AppointmentStep } from '@/app/(authenticated)/user/services/_utils/consular-services/service-form/appointment-step'
import DynamicStep from '@/app/(authenticated)/user/services/_utils/consular-services/service-form/dynamic-step'
import { ReviewStep } from '@/app/(authenticated)/user/services/_utils/consular-services/service-form/review-step'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'
import { createFormStorage } from '@/lib/form-storage'
import { submitServiceRequest } from '@/app/(authenticated)/user/services/_utils/actions/submit'

interface ServiceFormProps {
  service: ConsularService & {
    steps: ServiceStep[]
    requiredDocuments: DocumentType[]
    requiresAppointment: boolean
  }
  documents: AppUserDocument[]
  profile: FullProfile | null
  defaultValues?: Record<string, unknown>
  consulateId: string
}

function mapProfileDocuments(profile: FullProfile) {
  return {
    [DocumentType.PASSPORT]: profile.passport,
    [DocumentType.BIRTH_CERTIFICATE]: profile.birthCertificate,
    [DocumentType.RESIDENCE_PERMIT]: profile.residencePermit,
    [DocumentType.PROOF_OF_ADDRESS]: profile.addressProof,
    [DocumentType.IDENTITY_PHOTO]: profile.identityPicture ? {
      type: DocumentType.IDENTITY_PHOTO,
      fileUrl: profile.identityPicture,
      status: DocumentStatus.PENDING
    } : null
  }
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
  const profileDocuments = React.useMemo(() => {
    if (profile) {
      return mapProfileDocuments(profile);
    }
    return {} as Record<DocumentType, UserDocument>;
  }, [profile]);

  // Préparer les valeurs par défaut pour le formulaire des components
  const defaultDocumentValues = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: Partial<Record<any, any>> = {};

    service.requiredDocuments.forEach((docType: DocumentType) => {
      const profileDoc = profileDocuments[docType as keyof typeof profileDocuments];
      if (profileDoc && profileDoc.fileUrl) {
        values[docType] = profileDoc.fileUrl;
      }
    });

    return values;
  }, [service.requiredDocuments, profileDocuments]);

  const { saveData, loadSavedData, clearData } = createFormStorage('service_form_data');
  const { saveData: saveDocuments, loadSavedData: loadSaveDocuments, clearData: clearDocuments } = createFormStorage('service_form_documents');
  const { saveData: saveAppointment, loadSavedData: loadAppointment, clearData: clearAppointment } = createFormStorage('service_form_appointment');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stepsData, setStepsData] = useState<Record<string, any>>(() => {
    // Charger les données sauvegardées au montage du composant
    return loadSavedData() || {};
  });
  const currentFormRef = React.useRef<HTMLFormElement>(null)
  const [documentsForm, setDocumentsForm] = useState<Record<DocumentType, File>>(loadSaveDocuments())
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
        setStepsData((prevData) => ({
          ...prevData,
          [stepKey]: data
        }))
    }

    handleNext()
  }


  const renderDynamicStep = (step: ServiceStep) => {
    const profileValues = getProfileValues(step)
    const initialValues = {
      ...profileValues,
      ...defaultValues
    }

    return (
      <DynamicStep
        fields={formatServiceFields(step.fields as unknown as string)}
        onSubmit={(data) => handleStepSubmit(step.id, data)}
        defaultValues={initialValues}
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


  // Fonction pour extraire les valeurs du profil selon les profileFields
  const getProfileValues = (step: ServiceStep) => {
    if (!profile || !step.profileFields) return {}

    const profileFieldsMap = JSON.parse(step.profileFields as string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = {} as Record<ProfileKey, any>

    Object.entries(profileFieldsMap).forEach(([formField, profileField]) => {
      // Accéder aux champs imbriqués du profil si nécessaire
      const value = profile[profileField as ProfileKey]

      if (value !== undefined) {
        values[formField as ProfileKey] = value
      }

    })

    return values
  }

  // Construire les étapes du formulaire
  const steps: ServiceStep[] = []

  if (service.requiredDocuments) {
    const requiredDocuments = service.requiredDocuments.filter((field) => !defaultDocumentValues?.[field])
    steps.push({
      id: 'documents',
      title: t('steps.components'),
      description: t('steps.documents_description'),
      isComplete: false,
      component: <DocumentsStep
        formRef={currentFormRef}
        requiredDocuments={requiredDocuments}
        profilDocuments={defaultDocumentValues}
        onSubmit={(data) => handleStepSubmit('documents', data)}
        isLoading={isLoading}
        navigation={{
          steps,
          currentStep,
          handleFinalSubmit: handleSubmit,
          handleNext,
          handlePrevious
        }}
      />,
      fields: [
        ...Object.keys(defaultDocumentValues).map((name) => {
          return {
            name,
            type: ServiceFieldType.FILE,
            required: false,
            label: t(`documents.types.${name.toLowerCase()}`),
            description: t(`documents.descriptions.${name.toLowerCase()}`),
            defaultValue: profileDocuments?.[name as keyof typeof profileDocuments]?.fileUrl,
          }}),
        ...requiredDocuments.map((name) => {
        return {
          name,
          type: ServiceFieldType.FILE,
          required: true,
          label: t(`documents.types.${name.toLowerCase()}`),
          description: t(`documents.descriptions.${name.toLowerCase()}`),
          defaultValue: documentsForm?.[name],
        }
      })
      ],
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
        component: renderDynamicStep(step),
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

  function handleNext() {
    setCurrentStep(currentStep + 1)
  }

  function handlePrevious() {
    setCurrentStep(currentStep - 1)
  }

  async function handleSubmit() {
    try {
      setIsLoading(true);
      const formData = new FormData();
      const profileDocs: Partial<Record<DocumentType, string>> = {};

      // Ajouter les components du profil existants
      service.requiredDocuments.forEach((docType: DocumentType) => {
        const profileDoc: UserDocument | null = profileDocuments[docType as keyof typeof profileDocuments] as UserDocument | null;
        if (profileDoc && profileDoc.id) {
          profileDocs[docType] = profileDoc.id;
        }
      });

      // Ajouter les nouveaux components
      Object.entries(documentsForm).forEach(([key, file]) => {
        if (file instanceof File) {
          formData.append(key, file);
        }
      });

      // 5. Appeler la Server Action
      const result = await submitServiceRequest({
        requiredDocuments: service.requiredDocuments,
        serviceId: service.id,
        consulateId,
        profileDocuments: Object.entries(profileDocs).map(([, value]) => value),
        stepsData,
        documents: formData,
        appointment: appointmentForm,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // 6. Gérer le succès
      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: "success"
      });

      // 7. Nettoyer les données
      clearData();
      clearDocuments();
      clearAppointment();

      // 8. Rediriger
      router.push(ROUTES.requests);

    } catch (error) {
      console.error('Error submitting service request:', error);

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
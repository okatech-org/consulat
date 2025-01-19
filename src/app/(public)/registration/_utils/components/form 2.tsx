'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/hooks/use-toast'
import { useFormStorage } from '@/lib/form-storage'
import { StepsProgress } from './steps-progress'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { submitConsularForm } from '@/actions/consular'
import { ToastAction } from '@/components/ui/toast'
import { ConsularFormData } from '@/schemas/registration'
import { RequestTypeForm } from '@/components/consular/steps/request-type'
import { DocumentsUploadForm } from '@/components/consular/steps/documents'
import { BasicInfoForm } from '@/components/consular/steps/basic-info'
import { FamilyInfoForm } from '@/components/consular/steps/family-info'
import { ContactInfoForm } from '@/components/consular/steps/contact-form'
import { ProfessionalInfoForm } from '@/components/consular/steps/professional-info'
import { ReviewForm } from '@/components/consular/steps/review'

// Configuration des étapes
const STEPS = [
  {
    id: 'request_type',
    title: 'Type de demande',
    component: RequestTypeForm
  },
  {
    id: 'documents',
    title: 'Documents',
    component: DocumentsUploadForm
  },
  {
    id: 'identity',
    title: 'Identité',
    component: BasicInfoForm
  },
  {
    id: 'family',
    title: 'Famille',
    component: FamilyInfoForm
  },
  {
    id: 'contact',
    title: 'Contact',
    component: ContactInfoForm
  },
  {
    id: 'professional',
    title: 'Professionnel',
    component: ProfessionalInfoForm
  },
  {
    id: 'review',
    title: 'Révision',
    component: ReviewForm
  }
] as const

export default function ConsularForm() {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('consular_registration')
  const formRef = useRef<HTMLFormElement>(null)

  // État local
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { loadSavedData, saveData, clearData } = useFormStorage()
  const [formData, setFormData] = useState<Partial<ConsularFormData>>(() => loadSavedData() || {})

  // Préparer les données pour le composant de progression
  const stepsProgress = STEPS.map((step, index) => ({
    id: step.id,
    title: t(`steps.${step.id}`),
    status: index < currentStep
      ? 'complete'
      : index === currentStep
        ? 'in_progress'
        : 'pending'
  }))

  // Gestion de la soumission par étape
  const handleStepSubmit = async (stepData: any) => {
    const updatedData = {
      ...formData,
      [STEPS[currentStep].id]: stepData
    }
    setFormData(updatedData)
    saveData(updatedData)

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  // Gestion de la soumission finale
  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true)
      const result = await submitConsularForm(formData as ConsularFormData)

      if (result.error) {
        toast({
          title: t('submission.error.title'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t('submission.success.title'),
        description: t('submission.success.description'),
        variant: "success",
        action: (
          <ToastAction
            altText={t('submission.success.action_hint')}
            onClick={() => router.push(PAGE_ROUTES.dashboard)}
          >
            {t('submission.success.action')}
          </ToastAction>
        )
      })

      clearData()
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: t('errors.submission.title'),
        description: t('errors.submission.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation
  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      await handleFinalSubmit()
      return
    }

    formRef.current?.requestSubmit()
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  // Gestion de l'analyse des documents
  const handleAnalysisComplete = (analysisData: any) => {
    const updatedData = {
      ...formData,
      basicInfo: {
        ...formData.basicInfo,
        ...analysisData
      }
    }
    setFormData(updatedData)
    saveData(updatedData)
  }

  const CurrentStepComponent = STEPS[currentStep].component

  return (
    <div className="container max-w-3xl py-8 space-y-8">
      {/* En-tête et progression */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {t('header.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('header.subtitle')}
          </p>
        </div>

        <StepsProgress
          steps={stepsProgress}
          currentStep={currentStep + 1}
          totalSteps={STEPS.length}
        />
      </div>

      {/* Formulaire principal */}
      <Card>
        <CardContent className="pt-6">
          <CurrentStepComponent
            ref={formRef}
            onSubmit={handleStepSubmit}
            defaultValues={formData[STEPS[currentStep].id]}
            isLoading={isSubmitting}
            onAnalysisComplete={
              STEPS[currentStep].id === 'documents'
                ? handleAnalysisComplete
                : undefined
            }
          />

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('navigation.previous')}
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
                  {t('navigation.submitting')}
                </>
              ) : (
                <>
                  {currentStep === STEPS.length - 1
                    ? t('navigation.submit')
                    : t('navigation.next')
                  }
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aide contextuelle */}
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          {t(`help.${STEPS[currentStep].id}`)}
        </p>
      </div>
    </div>
  )
}
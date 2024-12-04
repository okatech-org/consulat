// src/components/consular-services/service-form/navigation.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'
import { ServiceFormData } from '@/types/consular-service'
import { UseFormReturn } from 'react-hook-form'

interface NavigationProps {
  currentStep: number
  totalSteps: number
  isLoading: boolean
  onNext: () => Promise<void>
  onPrevious: () => void
  forms?: UseFormReturn<ServiceFormData>  // Cette prop est requise
}

export function FormNavigation({
                                 currentStep,
                                 totalSteps,
                                 isLoading,
                                 onNext,
                                 onPrevious,
                                 forms
                               }: NavigationProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="mt-8 flex justify-between gap-4">
      {currentStep > 0 && (
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('navigation.previous')}
        </Button>
      )}

      <Button
        onClick={onNext}
        disabled={isLoading}
        className="ml-auto"
      >
        {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        {currentStep === totalSteps - 1 ? (
          t('navigation.submit')
        ) : (
          <>
            {t('navigation.next')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'
import { validateStep } from '@/lib/form/validation'
import { ConsularFormData } from '@/schemas/registration'
import { UseFormReturn } from 'react-hook-form'

interface NavigationProps<T extends keyof ConsularFormData> {
  currentStep: number
  totalSteps: number
  isLoading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNext: (data: ConsularFormData[T]) => void
  onPrevious: () => void
  forms: Record<T, UseFormReturn<ConsularFormData[T]>>
}

export function FormNavigation({
                                 currentStep,
                                 totalSteps,
                                 isLoading,
                                 onNext,
                                 onPrevious,
                                 forms
                               }: NavigationProps<keyof ConsularFormData>) {
  const t = useTranslations('registration')

  const handleNext = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validation = await validateStep(currentStep, forms as any)
    if (validation.isValid && validation.data) {
      onNext(validation.data)
    }
  }

  return (
    <div className="mt-8 flex justify-between gap-4">
      {currentStep > 0 && (
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('navigation.previous')}
        </Button>
      )}

      <Button
        onClick={handleNext}
        disabled={isLoading}
        className="gap-2 ml-auto"
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : null}
        {currentStep === totalSteps - 1
          ? t('navigation.submit')
          : t('navigation.next')}
        {currentStep !== totalSteps - 1 && (
          <ArrowRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
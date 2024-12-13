import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  isLoading: boolean
  isValid: boolean
}

export function FormNavigation({
                                 currentStep,
                                 totalSteps,
                                 onNext,
                                 onPrevious,
                                 onSubmit,
                                 isLoading,
                                 isValid,
                               }: FormNavigationProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="flex justify-between gap-4">
      {currentStep > 0 && (
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={isLoading}
          className="gap-2"
          type={"button"}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('navigation.previous')}
        </Button>
      )}

      <Button
        onClick={currentStep === totalSteps - 1 ? onSubmit : onNext}
        disabled={isLoading || !isValid}
        className="gap-2 ml-auto"
      >
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {currentStep === totalSteps - 1
          ? t('navigation.submit')
          : t('navigation.next')}
        {!isLoading && currentStep < totalSteps - 1 && (
          <ArrowRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
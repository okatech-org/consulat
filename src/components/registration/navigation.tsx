'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { validateStep as validateStepFn } from '@/lib/form/validation';
import { type CompleteProfileUpdateFormData } from '@/schemas/registration';
import { type UseFormReturn } from 'react-hook-form';

type Step =
  | 'documents'
  | 'basicInfo'
  | 'familyInfo'
  | 'contactInfo'
  | 'professionalInfo'
  | 'review';

interface NavigationProps {
  steps: Step[];
  currentStep: Step;
  totalSteps: number;
  isLoading: boolean;
  onNext: (step: Step) => void;
  onPrevious: (step: Step) => void;
  forms: Record<Step, UseFormReturn<Partial<CompleteProfileUpdateFormData>>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateStep?: (step: number, forms: any) => Promise<{ isValid: boolean; data?: any }>;
}

export function FormNavigation({
  steps,
  currentStep,
  totalSteps,
  isLoading,
  onNext,
  onPrevious,
  forms,
  validateStep = validateStepFn,
}: NavigationProps) {
  const t = useTranslations('registration');
  const currentStepIndex = steps.findIndex((step) => step === currentStep) ?? 0;

  const handleNext = async () => {
    const validation = await validateStep(currentStep, forms);
    if (validation.isValid && validation.data) {
      onNext(validation.data);
    }
  };

  return (
    <div className="mt-6 flex justify-between gap-4">
      {currentStepIndex > 0 && (
        <Button
          onClick={onPrevious}
          variant="outline"
          disabled={isLoading}
          leftIcon={<ArrowLeft className="size-4" />}
        >
          {t('navigation.previous')}
        </Button>
      )}

      <Button
        onClick={handleNext}
        disabled={isLoading}
        size="mobile"
        weight="medium"
        className="ml-auto"
        loading={isLoading}
        rightIcon={
          currentStepIndex !== totalSteps - 1 ? (
            <ArrowRight className="size-4" />
          ) : undefined
        }
      >
        {currentStepIndex === totalSteps - 1
          ? t('navigation.submit')
          : t('navigation.next')}
      </Button>
    </div>
  );
}

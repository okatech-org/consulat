'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { validateStep as validateStepFn } from '@/lib/form/validation';
import { FullProfileUpdateFormData } from '@/schemas/registration';
import { UseFormReturn } from 'react-hook-form';

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
  forms: Record<Step, UseFormReturn<Partial<FullProfileUpdateFormData>>>;
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
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          {t('navigation.previous')}
        </Button>
      )}

      <Button onClick={handleNext} disabled={isLoading} className="ml-auto gap-2">
        {isLoading ? <Loader className="size-4 animate-spin" /> : null}
        {currentStepIndex === totalSteps - 1
          ? t('navigation.submit')
          : t('navigation.next')}
        {currentStepIndex !== totalSteps - 1 && <ArrowRight className="size-4" />}
      </Button>
    </div>
  );
}

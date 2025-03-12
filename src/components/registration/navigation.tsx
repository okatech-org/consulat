'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { validateStep as validateStepFn } from '@/lib/form/validation';
import { FullProfileUpdateFormData } from '@/schemas/registration';
import { UseFormReturn } from 'react-hook-form';

interface NavigationProps<T extends keyof FullProfileUpdateFormData> {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onNext: (data: FullProfileUpdateFormData[T]) => void;
  onPrevious: () => void;
  forms: Record<T, UseFormReturn<FullProfileUpdateFormData>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateStep?: (step: number, forms: any) => Promise<{ isValid: boolean; data?: any }>;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  isLoading,
  onNext,
  onPrevious,
  forms,
  validateStep = validateStepFn,
}: NavigationProps<keyof FullProfileUpdateFormData>) {
  const t = useTranslations('registration');

  const handleNext = async () => {
    const validation = await validateStep(currentStep, forms);
    if (validation.isValid && validation.data) {
      onNext(validation.data);
    }
  };

  return (
    <div className="mt-6 flex justify-between gap-4">
      {currentStep > 0 && (
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
        {currentStep === totalSteps - 1 ? t('navigation.submit') : t('navigation.next')}
        {currentStep !== totalSteps - 1 && <ArrowRight className="size-4" />}
      </Button>
    </div>
  );
}

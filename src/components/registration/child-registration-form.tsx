'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { FormNavigation } from './navigation';
import { DocumentUploadSection } from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { handleFormError } from '@/lib/form/errors';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { postProfile } from '@/app/(authenticated)/my-space/_utils/profile';
import { tryCatch } from '@/lib/utils';
import { useChildRegistrationForm } from '@/hooks/use-child-registration-form';
import { LinkForm } from './link-form';
import { ChildReviewForm } from './child-review-form';
import { UseFormReturn } from 'react-hook-form';
import { ChildCompleteFormData } from '@/schemas/child-registration';

export function ChildRegistrationForm() {
  const router = useRouter();
  const t = useTranslations('registration');

  const {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    forms,
    handleDataChange,
    clearData,
  } = useChildRegistrationForm();

  const [steps, setSteps] = useState([
    {
      key: 'link',
      title: t('steps.child_link'),
      description: t('steps.child_link_description'),
      isComplete: forms.link.formState.isValid,
    },
    {
      key: 'documents',
      title: t('steps.documents'),
      description: t('steps.documents_description'),
      isComplete: forms.documents.formState.isValid,
    },
    {
      key: 'identity',
      title: t('steps.identity'),
      description: t('steps.identity_description'),
      isComplete: forms.basicInfo.formState.isValid,
    },
    {
      key: 'review',
      title: t('steps.child_review'),
      description: t('steps.child_review_description'),
      isComplete: false,
    },
  ]);

  // Gestionnaire de navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNext = async (stepData: any) => {
    try {
      handleDataChange(stepData);

      if (currentStep === steps.length - 1) {
        await handleFinalSubmit();
        return;
      }

      setCurrentStep((prev) => prev + 1);
      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          isComplete: index <= currentStep,
        })),
      );
    } catch (error) {
      const { title, description } = handleFormError(error, t);
      toast({ title, description, variant: 'destructive' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Soumission finale
  const handleFinalSubmit = async () => {
    console.log('handleFinalSubmit');
    const formDataToSend = new FormData();

    // Ajouter les fichiers
    const documents = {
      ...forms.documents.getValues(),
      identityPictureFile: forms.basicInfo.getValues().identityPictureFile,
    };
    Object.entries(documents).forEach(([key, file]) => {
      if (file) formDataToSend.append(key, file as File);
    });

    // Ajouter les données JSON des formulaires
    formDataToSend.append('link', JSON.stringify(forms.link.getValues()));
    formDataToSend.append('basicInfo', JSON.stringify(forms.basicInfo.getValues()));
    formDataToSend.append('documents', JSON.stringify(forms.documents.getValues()));

    const result = await tryCatch(postProfile(formDataToSend));

    setIsLoading(false);

    if (result.error) {
      const { title, description } = handleFormError(result.error, t);
      toast({ title, description, variant: 'destructive' });
    }

    if (result.data) {
      // Nettoyer les données du formulaire
      clearData();

      toast({
        title: t('submission.success.title'),
        description: t('submission.success.description'),
      });

      router.push(ROUTES.user.children);
    }
  };

  // Rendu du formulaire actuel
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LinkForm
            form={forms.link}
            onSubmit={() => handleNext(forms.link.getValues())}
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <DocumentUploadSection
            form={forms.documents}
            handleSubmit={() => handleNext(forms.documents.getValues())}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <BasicInfoForm
            form={forms.basicInfo}
            onSubmit={() => handleNext(forms.basicInfo.getValues())}
            isLoading={isLoading}
            isChild={true}
          />
        );
      case 3:
        return (
          <ChildReviewForm
            data={{
              linkInfo: forms.link.getValues(),
              basicInfo: forms.basicInfo.getValues(),
              documents: forms.documents.getValues(),
            }}
            onEdit={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* En-tête avec progression */}
      <div className="mb-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold md:text-3xl">{t('header.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('header.subtitle')}</p>
        </div>

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onChange={setCurrentStep}
        />
      </div>

      {/* Contenu principal */}
      <div className="pb-16">
        {renderCurrentStep()}

        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isLoading={isLoading}
          onNext={handleNext}
          onPrevious={handlePrevious}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          forms={forms as any}
          validateStep={validateStep}
        />
      </div>

      {/* Progression mobile */}
      <MobileProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        stepTitle={steps[currentStep].title}
        isOptional={steps[currentStep].isOptional}
      />
    </div>
  );
}

async function validateStep(
  step: number,
  forms: {
    link: UseFormReturn<ChildCompleteFormData['linkInfo']>;
    documents: UseFormReturn<ChildCompleteFormData['documents']>;
    basicInfo: UseFormReturn<ChildCompleteFormData['basicInfo']>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ isValid: boolean; data?: any }> {
  try {
    switch (step) {
      case 0: // Link
        const isLinkValid = await forms.link.trigger();
        if (!isLinkValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.link.getValues(),
        };

      case 1: // Documents
        const isDocumentsValid = await forms.documents.trigger();
        if (!isDocumentsValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.documents.getValues(),
        };

      case 2: // Basic Info
        const isBasicInfoValid = await forms.basicInfo.trigger();
        if (!isBasicInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.basicInfo.getValues(),
        };

      case 3: // Review
        return { isValid: true, data: {} };

      default:
        return { isValid: false };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return { isValid: false };
  }
}

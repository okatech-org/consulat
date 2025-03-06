'use client';

import { useRegistrationForm } from '@/hooks/use-registration-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { FormNavigation } from './navigation';
import { DocumentUploadSection } from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { FamilyInfoForm } from './family-info';
import { ContactInfoForm } from './contact-form';
import { ProfessionalInfoForm } from './professional-info';
import { ReviewForm } from './review';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { updateFormsFromAnalysis } from '@/lib/form/update-helpers';
import { FormError, handleFormError } from '@/lib/form/errors';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { postProfile } from '@/actions/profile';
import { tryCatch } from '@/lib/utils';

export function RegistrationForm({
  handleSubmitProfile,
}: {
  handleSubmitProfile: (data: FormData) => Promise<{
    error?: string;
    data?: string;
  }>;
}) {
  const router = useRouter();
  const t = useTranslations('registration');
  const { toast } = useToast();

  const {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    setError,
    forms,
    handleDataChange,
    clearData,
  } = useRegistrationForm();

  const [steps, setSteps] = useState([
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
      key: 'family',
      title: t('steps.family'),
      description: t('steps.family_description'),
      isComplete: forms.familyInfo.formState.isValid,
    },
    {
      key: 'contact',
      title: t('steps.contact'),
      description: t('steps.contact_description'),
      isComplete: false,
    },
    {
      key: 'professional',
      title: t('steps.professional'),
      description: t('steps.professional_description'),
      isComplete: forms.professionalInfo.formState.isValid,
      isOptional: true,
    },
    {
      key: 'review',
      title: t('steps.review'),
      description: t('steps.review_description'),
      isComplete: false,
    },
  ]);

  // Gestionnaire d'analyse des components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDocumentsAnalysis = async (data: any) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const updateResult = updateFormsFromAnalysis(data, {
        basicInfo: forms.basicInfo,
        contactInfo: forms.contactInfo,
        familyInfo: forms.familyInfo,
        professionalInfo: forms.professionalInfo,
      });

      // Mettre à jour le stockage local
      handleDataChange({
        basicInfo: forms.basicInfo.getValues(),
        contactInfo: forms.contactInfo.getValues(),
        familyInfo: forms.familyInfo.getValues(),
        professionalInfo: forms.professionalInfo.getValues(),
      });

      // Afficher le toast avec les sections mises à jour
      const updatedSections = Object.entries(updateResult)
        .filter(([, hasUpdates]) => hasUpdates)
        .map(([key]) => t(`sections.${key.replace('has', '').toLowerCase()}`));

      toast({
        title: t('profile.analysis.success.title'),
        description: t('profile.analysis.success.description_with_sections', {
          sections: updatedSections.join(', '),
        }),
        variant: 'success',
        action:
          updatedSections.length > 0 ? (
            <Button onClick={() => setCurrentStep((prev) => prev + 1)} size="sm">
              {t('profile.analysis.success.action')}
            </Button>
          ) : undefined,
      });
    } catch (error) {
      const { title, description } = handleFormError(error, t);
      toast({ title, description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

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
    try {
      setIsLoading(true);
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
      formDataToSend.append('basicInfo', JSON.stringify(forms.basicInfo.getValues()));
      formDataToSend.append('contactInfo', JSON.stringify(forms.contactInfo.getValues()));
      formDataToSend.append('familyInfo', JSON.stringify(forms.familyInfo.getValues()));
      formDataToSend.append(
        'professionalInfo',
        JSON.stringify(forms.professionalInfo.getValues()),
      );

      const result = await handleSubmitProfile(formDataToSend);

      if (result.error) {
        throw new FormError(result.error);
      }

      // Nettoyer les données du formulaire
      clearData();

      toast({
        title: t('submission.success.title'),
        description: t('submission.success.description'),
      });

      router.push(ROUTES.user.profile);
    } catch (error) {
      const { title, description } = handleFormError(error, t);
      toast({ title, description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu du formulaire actuel
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DocumentUploadSection
            form={forms.documents}
            onAnalysisComplete={handleDocumentsAnalysis}
            handleSubmit={() => handleNext(forms.documents.getValues())}
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <BasicInfoForm
            form={forms.basicInfo}
            onSubmit={() => handleNext(forms.basicInfo.getValues())}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <FamilyInfoForm
            form={forms.familyInfo}
            onSubmit={() => handleNext(forms.familyInfo.getValues())}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <ContactInfoForm
            form={forms.contactInfo}
            onSubmit={() => handleNext(forms.contactInfo.getValues())}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <ProfessionalInfoForm
            form={forms.professionalInfo}
            onSubmit={() => handleNext(forms.professionalInfo.getValues())}
            isLoading={isLoading}
          />
        );
      case 5:
        return (
          <ReviewForm
            data={{
              documents: forms.documents.getValues(),
              basicInfo: forms.basicInfo.getValues(),
              familyInfo: forms.familyInfo.getValues(),
              contactInfo: forms.contactInfo.getValues(),
              professionalInfo: forms.professionalInfo.getValues(),
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
      <div>
        {renderCurrentStep()}

        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isLoading={isLoading}
          onNext={handleNext}
          onPrevious={handlePrevious}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          forms={forms as any}
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

export function RegistrationFormWrapper() {
  const handleSubmitProfile = async (formDataToSend: FormData) => {
    const result = await tryCatch(postProfile(formDataToSend));

    return result;
  };

  return <RegistrationForm handleSubmitProfile={handleSubmitProfile} />;
}

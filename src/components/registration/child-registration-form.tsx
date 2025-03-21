'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { DocumentUploadSection } from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { handleFormError } from '@/lib/form/errors';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { tryCatch, filterUneditedKeys } from '@/lib/utils';
import { useChildRegistrationForm } from '@/hooks/use-child-registration-form';
import { LinkForm } from './link-form';
import {
  createChildProfile,
  updateChildProfile,
  submitChildProfileForValidation,
} from '@/actions/child-profiles';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Info, Loader } from 'lucide-react';
import { ErrorCard } from '../ui/error-card';
import { useTabs } from '@/hooks/use-tabs';
import CardContainer from '../layouts/card-container';
import { isFieldBlacklisted } from '@/lib/document-fields';

// Define subtypes of StepKey for this component
type ChildSteps = 'link' | 'documents' | 'identity';

export function ChildRegistrationForm() {
  const router = useRouter();
  const t = useTranslations('registration');
  const t_errors = useTranslations('messages.errors');

  const {
    isLoading,
    setIsLoading,
    setError,
    error,
    forms,
    clearData,
    profileId,
    setProfileId,
  } = useChildRegistrationForm();

  const [displayAnalysisWarning, setDisplayAnalysisWarning] = useState(false);

  const orderedSteps: ChildSteps[] = ['link', 'documents', 'identity'];

  const { currentTab, handleTabChange } = useTabs<ChildSteps>('step', 'link');
  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const totalSteps = orderedSteps.length;

  // Handler for analysis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDocumentsAnalysis = async (data: any) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Just update basicInfo since that's all we need for child profiles
      if (forms.basicInfo) {
        const { firstName, lastName, birthDate, birthPlace, birthCountry, nationality } =
          data;

        // Only update non-blacklisted fields
        if (firstName && !isFieldBlacklisted('basicInfo', 'firstName'))
          forms.basicInfo.setValue('firstName', firstName);
        if (lastName && !isFieldBlacklisted('basicInfo', 'lastName'))
          forms.basicInfo.setValue('lastName', lastName);
        if (birthDate && !isFieldBlacklisted('basicInfo', 'birthDate'))
          forms.basicInfo.setValue('birthDate', birthDate);
        if (birthPlace && !isFieldBlacklisted('basicInfo', 'birthPlace'))
          forms.basicInfo.setValue('birthPlace', birthPlace);
        if (birthCountry && !isFieldBlacklisted('basicInfo', 'birthCountry'))
          forms.basicInfo.setValue('birthCountry', birthCountry);
        if (nationality && !isFieldBlacklisted('basicInfo', 'nationality'))
          forms.basicInfo.setValue('nationality', nationality);
      }

      toast({
        duration: 1000,
        title: t('profile.analysis.success.title'),
        description: (
          <div className="space-y-2">
            <p>{t('profile.analysis.success.description')}</p>
            <Button onClick={handleNext} size="sm">
              {t('profile.analysis.success.action')}
            </Button>
          </div>
        ),
        variant: 'success',
      });

      if (!displayAnalysisWarning) {
        setDisplayAnalysisWarning(true);
      }
    } catch (error) {
      const { title, description } = handleFormError(error, t);
      toast({ title, description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handler
  const handleNext = async () => {
    setError(undefined);
    setIsLoading(true);

    if (currentTab === 'link') {
      // First step - create the child profile
      const linkData = forms.link.getValues();
      const isStepValid = await forms.link.trigger();

      if (!isStepValid) {
        setIsLoading(false);
        return;
      }

      const { data: result, error } = await tryCatch(createChildProfile(linkData));

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (result) {
        setProfileId(result.id);
        const nextStep = orderedSteps[currentStepIndex + 1];
        if (nextStep) {
          handleTabChange(nextStep);
        }
      }
    } else if (currentTab === 'identity' && profileId) {
      // Handle identity step
      const currentForm = forms.basicInfo;
      const nextStep = orderedSteps[currentStepIndex + 1];

      const isStepValid = await currentForm.trigger();

      if (!isStepValid) {
        setIsLoading(false);
        return;
      }

      const stepData = currentForm.getValues();
      const editedFields = filterUneditedKeys(
        stepData,
        currentForm.formState.dirtyFields,
      );

      if (editedFields) {
        const { error } = await tryCatch(updateChildProfile(profileId, editedFields));

        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }
      }

      if (nextStep) {
        handleTabChange(nextStep);
      }
    } else if (currentTab === 'documents') {
      // Handle documents step - just navigate to next step
      const isStepValid = await forms.documents.trigger();

      if (!isStepValid) {
        setIsLoading(false);
        return;
      }

      await handleFinalSubmit();
    }
    setIsLoading(false);
  };

  const handlePrevious = () => {
    const previousStep = orderedSteps[currentStepIndex - 1];
    if (previousStep) {
      handleTabChange(previousStep);
    }
  };

  // Final submission handler
  const handleFinalSubmit = async () => {
    if (!profileId) return;

    setIsLoading(true);

    const result = await tryCatch(submitChildProfileForValidation(profileId));

    setIsLoading(false);

    if (result.error) {
      const { title, description } = handleFormError(result.error, t);
      toast({ title, description, variant: 'destructive' });
    }

    if (result.data) {
      clearData();

      toast({
        title: t('submission.success.title'),
        description: t('submission.success.description'),
      });

      router.push(ROUTES.user.children);
    }
  };

  // Get the correct translation key for the step
  const getStepTranslation = (step: ChildSteps) => {
    switch (step) {
      case 'link':
        return 'child_link';
      case 'identity':
        return 'basicInfo';
      default:
        return step;
    }
  };

  // Map of which form to use for each step
  const stepFormMap = {
    link: forms.link,
    documents: forms.documents,
    identity: forms.basicInfo,
    review: forms.basicInfo, // For validation purposes
  };

  // Current step component render
  const stepsComponents: Record<ChildSteps, React.ReactNode> = {
    link: (
      <LinkForm form={forms.link} onSubmit={() => handleNext()} isLoading={isLoading} />
    ),
    documents: (
      <DocumentUploadSection
        profileId={profileId}
        form={forms.documents}
        onAnalysisComplete={handleDocumentsAnalysis}
        handleSubmitAction={() => handleNext()}
        isLoading={isLoading}
      />
    ),
    identity: (
      <BasicInfoForm
        form={forms.basicInfo}
        onSubmit={() => handleNext()}
        isLoading={isLoading}
        profileId={profileId}
      />
    ),
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-full flex flex-col">
      <header className="w-full pb-4">
        <StepIndicator
          steps={orderedSteps.map((step) => {
            const stepIndex = orderedSteps.indexOf(step);
            const currentIndex = orderedSteps.indexOf(currentTab);

            return {
              title: t(`steps.${getStepTranslation(step)}`),
              key: step,
              description: t(`steps.${getStepTranslation(step)}_description`),
              isOptional: false,
              isComplete: stepIndex < currentIndex,
            };
          })}
          currentStep={currentTab}
          onChange={(step) => {
            // Cast the step to our ChildSteps type since we know it's one of our step types
            handleTabChange(step as ChildSteps);
          }}
        />
      </header>
      <div className="w-full flex flex-col">
        <div className="mx-auto w-full max-w-4xl">
          {/* Main content */}
          <div className="flex flex-col pb-24 md:pb-10 gap-4 justify-center">
            {currentStepIndex > 1 && displayAnalysisWarning && <AnalysisWarningBanner />}
            {stepsComponents[currentTab]}

            {error && (
              <ErrorCard
                description={
                  <p className="flex items-center gap-2">
                    <Info className="size-icon" />
                    {t_errors('invalid_step')}
                  </p>
                }
              />
            )}

            <div className="flex justify-between gap-4">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={isLoading || currentStepIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                {t('navigation.previous')}
              </Button>

              <Button
                type="submit"
                onClick={() => handleNext()}
                disabled={isLoading || !stepFormMap[currentTab].formState.isValid}
                className="ml-auto gap-2"
              >
                {isLoading ? <Loader className="size-4 animate-spin" /> : null}
                {currentStepIndex === totalSteps - 1
                  ? t('navigation.submit')
                  : t('navigation.next')}
                {currentStepIndex !== totalSteps - 1 && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile progress */}
          <MobileProgress
            currentStepIndex={currentStepIndex}
            totalSteps={orderedSteps.length}
            stepTitle={t(`steps.${getStepTranslation(currentTab)}`)}
            isOptional={false}
          />
        </div>
      </div>
    </div>
  );
}

function AnalysisWarningBanner() {
  const t = useTranslations('registration');
  return (
    <CardContainer
      className="overflow-hidden"
      contentClass="p-4 bg-blue-500/10 flex items-center gap-2"
    >
      <Info className="size-8 sm:size-5 text-blue-500" />
      <p className="text-md font-medium text-blue-500">
        {t('documents.analysis.warning')}
      </p>
    </CardContainer>
  );
}

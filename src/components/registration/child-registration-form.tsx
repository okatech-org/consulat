'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import {
  type DocumentUploadItem,
  DocumentUploadSection,
} from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { handleFormError } from '@/lib/form/errors';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { tryCatch, filterUneditedKeys } from '@/lib/utils';
import { useChildRegistrationForm } from '@/hooks/use-child-registration-form';
import { LinkForm } from './link-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Info, Loader } from 'lucide-react';
import { ErrorCard } from '../ui/error-card';
import { useTabs } from '@/hooks/use-tabs';
import CardContainer from '../layouts/card-container';
import type { ChildBasicInfoFormData } from '@/schemas/child-registration';
import { DocumentType } from '@/convex/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type ChildSteps = 'link' | 'documents' | 'identity';

export function ChildRegistrationForm() {
  const router = useRouter();
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const t_errors = useTranslations('messages.errors');
  const { user } = useAuth();

  const {
    isLoading,
    setIsLoading,
    setError,
    error,
    forms,
    clearData,
    profileId,
    setProfileId,
    createProfile,
    updateBasicInfo,
  } = useChildRegistrationForm();

  const submitChildProfileForValidation = useMutation(
    api.functions.childProfile.submitChildProfileForValidation,
  );

  const [displayAnalysisWarning, setDisplayAnalysisWarning] = useState(false);

  const orderedSteps: ChildSteps[] = ['link', 'documents', 'identity'];

  const { currentTab, handleTabChange } = useTabs<ChildSteps>('step', 'link');
  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const totalSteps = orderedSteps.length;
  const isCurrentStepDirty =
    forms[currentTab as keyof typeof forms]?.formState.isDirty ?? false;

  // Handler for analysis

  const handleDocumentsAnalysis = async (data: {
    basicInfo?: Partial<ChildBasicInfoFormData>;
  }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Just update basicInfo since that's all we need for child profiles
      if (forms.basicInfo && data?.basicInfo) {
        const fieldsToUpdate = [
          'firstName',
          'lastName',
          'birthDate',
          'birthPlace',
          'birthCountry',
          'gender',
          'acquisitionMode',
          'nationality',
          'nipCode',
        ] as Array<keyof ChildBasicInfoFormData>;

        fieldsToUpdate.forEach((field) => {
          if (data.basicInfo?.[field]) {
            forms.basicInfo.setValue(field, data.basicInfo?.[field], {
              shouldDirty: true,
            });
          }
        });

        // Handle passport info separately if present
        if (data.basicInfo.passportInfos) {
          forms.basicInfo.setValue('passportInfos', data.basicInfo.passportInfos, {
            shouldDirty: true,
          });
        }
      }

      toast({
        duration: 1000,
        title: t('profile.analysis.success.title'),
        description: (
          <div className="space-y-2">
            <p>{t('profile.analysis.success.description')}</p>
            <Button onClick={handleNext} size="mobile" weight="medium">
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

    if (!user?._id) {
      setError(t_errors('unauthorized'));
      setIsLoading(false);
      return;
    }

    switch (currentTab) {
      case 'link': {
        // First step - create the child profile
        const linkData = forms.link.getValues();
        const isLinkStepValid = await forms.link.trigger();

        if (!isLinkStepValid) {
          setError(t_errors('invalid_step'));
          setIsLoading(false);
          return;
        }

        if (!profileId) {
          const { data: newProfileId, error: createError } = await tryCatch(
            createProfile(linkData, user._id),
          );

          if (createError) {
            setError(createError.message);
            setIsLoading(false);
            return;
          }

          if (newProfileId) {
            setProfileId(newProfileId);
            const nextStep = orderedSteps[currentStepIndex + 1];
            if (nextStep) {
              handleTabChange(nextStep);
            }
          }
        } else {
          // Profile already exists, just navigate to next step
          const nextStep = orderedSteps[currentStepIndex + 1];
          if (nextStep) {
            handleTabChange(nextStep);
          }
        }

        break;
      }
      case 'identity': {
        const currentForm = forms.basicInfo;

        const isIdentityStepValid = await currentForm.trigger();

        if (!isIdentityStepValid) {
          setIsLoading(false);
          return;
        }

        const stepData = currentForm.getValues();

        if (profileId && currentForm.formState.isDirty) {
          const { error } = await tryCatch(updateBasicInfo(profileId, stepData));

          if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
          }
        }

        if (profileId) {
          const { error: submitError } = await tryCatch(
            submitChildProfileForValidation({
              childProfileId: profileId,
            }),
          );

          if (submitError) {
            const { title, description } = handleFormError(submitError, t);
            toast({ title, description, variant: 'destructive' });
            setIsLoading(false);
            return;
          }

          clearData();

          toast({
            title: t('submission.success.title'),
            description: t('submission.success.description'),
          });

          setIsLoading(false);
          router.push(ROUTES.user.children);
        }

        break;
      }
      case 'documents': {
        const nextStep = orderedSteps[currentStepIndex + 1];
        // Handle documents step - just navigate to next step
        const isDocumentsStepValid = await forms.documents.trigger();

        if (!isDocumentsStepValid) {
          setIsLoading(false);
          return;
        }

        if (nextStep) {
          handleTabChange(nextStep);
        }

        break;
      }
    }

    setIsLoading(false);
  };

  const handlePrevious = () => {
    const previousStep = orderedSteps[currentStepIndex - 1];
    if (previousStep) {
      handleTabChange(previousStep);
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

  const requiredDocuments: DocumentUploadItem[] = [
    {
      id: 'birthCertificate' as const,
      label: t_inputs('birthCertificate.label'),
      description: t_inputs('birthCertificate.help'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      expectedType: DocumentType.BIRTH_CERTIFICATE,
    },
    {
      id: 'passport' as const,
      label: t_inputs('passport.label'),
      description: t_inputs('passport.help'),
      required: false,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024, // 5MB
      expectedType: DocumentType.PASSPORT,
    },
  ] as const;

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
        documents={requiredDocuments}
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
    <div className="w-full relative max-w-7xl mx-auto min-h-full flex flex-col">
      {/* Version mobile/tablette - Étapes horizontales en header */}
      <header className="w-full pb-4 lg:hidden">
        <StepIndicator
          variant="horizontal"
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

      {/* Version desktop - Layout avec sidebar */}
      <div className="w-full flex flex-col lg:flex-row lg:gap-8">
        {/* Sidebar verticale pour desktop */}
        <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-6 lg:self-start">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">{t('profile.title')}</h2>
            <StepIndicator
              variant="vertical"
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
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            {/* Main content */}
            <div className="flex flex-col md:pb-10 gap-4 justify-center">
              {currentStepIndex > 1 && displayAnalysisWarning && (
                <AnalysisWarningBanner />
              )}
              <CardContainer>{stepsComponents[currentTab]}</CardContainer>

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

              <div className="flex flex-col md:flex-row justify-between gap-4">
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
                  className="gap-2"
                >
                  {isLoading ? <Loader className="size-4 animate-spin" /> : null}
                  {currentStepIndex === totalSteps - 1
                    ? t('navigation.submit')
                    : `${isCurrentStepDirty ? 'Enregistrer et continuer' : 'Continuer'} (${currentStepIndex + 1}/${totalSteps})`}
                  {currentStepIndex !== totalSteps - 1 && (
                    <ArrowRight className="size-4" />
                  )}
                </Button>
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
        </main>
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

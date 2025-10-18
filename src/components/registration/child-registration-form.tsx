'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { handleFormError } from '@/lib/form/errors';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { tryCatch } from '@/lib/utils';
import CardContainer from '../layouts/card-container';
import { Info } from 'lucide-react';
import React from 'react';
import { useTabs } from '@/hooks/use-tabs';
import { DocumentType } from '@/convex/lib/constants';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { ParentsForm } from './parents-form';
import { ChildDocumentsForm, type ChildDocumentUploadItem } from './child-documents-form';
import { ChildBasicInfoForm } from './child-basic-info-form';
import { ChildReviewForm } from './child-review-form';
import type { Id } from '@/convex/_generated/dataModel';
import { Spinner } from '../ui/spinner';

export type ChildRegistrationStep = 'parents' | 'documents' | 'basic-info' | 'review';

export function ChildRegistrationForm() {
  const currentProfile = useQuery(api.functions.profile.getCurrentProfile);
  const submitChildProfileForValidation = useMutation(
    api.functions.childProfile.submitChildProfileForValidation,
  );
  const createChildProfile = useMutation(api.functions.childProfile.createChildProfile);

  const router = useRouter();
  const t = useTranslations('registration');
  const tInputs = useTranslations('inputs');
  const { user } = useAuth();
  const [displayAnalysisWarning, setDisplayAnalysisWarning] = useState(false);
  const [childProfileId, setChildProfileId] = useState<Id<'childProfiles'> | undefined>(
    undefined,
  );
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  if (!user || !currentProfile?.residenceCountry) {
    return null;
  }

  const orderedSteps: ChildRegistrationStep[] = [
    'parents',
    'documents',
    'basic-info',
    'review',
  ];

  const { currentTab, handleTabChange: setCurrentTab } = useTabs<ChildRegistrationStep>(
    'tab',
    'parents',
  );

  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const totalSteps = orderedSteps.length;

  const handleDocumentsAnalysis = async () => {
    try {
      toast.success(t('profile.analysis.success.title'), {
        description: (
          <div className="space-y-2">
            <p>{t('profile.analysis.success.description')}</p>
            <Button onClick={handleNext} size="mobile" weight="medium">
              {t('profile.analysis.success.action')}
            </Button>
          </div>
        ),
      });

      if (!displayAnalysisWarning) {
        setDisplayAnalysisWarning(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Il y a eu un problème lors de l'analyse des documents", {});
    }
  };

  const handleNext = async () => {
    const nextStep = orderedSteps[orderedSteps.indexOf(currentTab) + 1];

    try {
      if (currentStepIndex === totalSteps - 1) {
        await handleFinalSubmit();
        return;
      }

      if (nextStep) {
        setCurrentTab(nextStep);
      } else {
        router.push(ROUTES.user.children);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la navigation', {
        description: 'Veuillez réessayer plus tard',
      });
    }
  };

  const handlePrevious = () => {
    const previousStep = orderedSteps[orderedSteps.indexOf(currentTab) - 1];
    if (previousStep) {
      setCurrentTab(previousStep);
    }
  };

  const handleParentsSave = async () => {
    if (childProfileId) {
      handleNext();
      return;
    }

    setIsCreatingProfile(true);
    try {
      const result = await tryCatch(
        createChildProfile({
          authorUserId: user._id,
          residenceCountry: currentProfile.residenceCountry!,
          firstName: '',
          lastName: '',
          parents: [],
        }),
      );

      if (result.error) {
        const { title, description } = handleFormError(result.error, t);
        toast.error(title, { description });
        return;
      }

      if (result.data) {
        setChildProfileId(result.data);
        handleNext();
      }
    } catch (error) {
      toast.error('Erreur lors de la création du profil enfant');
      console.error(error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!childProfileId) {
      toast.error('Erreur', {
        description: 'Profil enfant introuvable',
      });
      return;
    }

    const result = await tryCatch(
      submitChildProfileForValidation({
        childProfileId,
      }),
    );

    if (result.error) {
      const { title, description } = handleFormError(result.error, t);
      toast.error(title, { description });
    }

    if (result.data) {
      toast.success(t('submission.success.title'), {
        description: t('submission.success.description'),
      });

      router.push(ROUTES.user.children);
    }
  };

  const requiredDocuments: ChildDocumentUploadItem[] = [
    {
      id: 'birthCertificate' as const,
      label: tInputs('birthCertificate.label'),
      description: tInputs('birthCertificate.help'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      expectedType: DocumentType.BirthCertificate,
    },
    {
      id: 'passport' as const,
      label: tInputs('passport.label'),
      description: tInputs('passport.help'),
      required: false,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      expectedType: DocumentType.Passport,
    },
  ] as const;

  const stepsComponents: Record<ChildRegistrationStep, React.ReactNode> = {
    parents: childProfileId ? (
      <ParentsForm
        childProfileId={childProfileId}
        currentUser={user}
        onSave={handleNext}
        onPrevious={handlePrevious}
      />
    ) : (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">{t('child.parents.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('child.parents.description')}
          </p>
        </div>
        <div className="flex justify-between">
          <div />
          <Button onClick={handleParentsSave} loading={isCreatingProfile}>
            Commencer
          </Button>
        </div>
      </div>
    ),
    documents: childProfileId ? (
      <ChildDocumentsForm
        childProfileId={childProfileId}
        documents={requiredDocuments}
        onSave={handleNext}
        onPrevious={handlePrevious}
        onAnalysisComplete={handleDocumentsAnalysis}
      />
    ) : (
      <Spinner />
    ),
    'basic-info': childProfileId ? (
      <ChildBasicInfoForm
        childProfileId={childProfileId}
        onSave={handleNext}
        onPrevious={handlePrevious}
        banner={
          displayAnalysisWarning ? (
            <CardContainer
              className="overflow-hidden"
              contentClass="p-4 bg-blue-500/10 flex items-center gap-2"
            >
              <Info className="size-8 sm:size-5 text-blue-500" />
              <p className="text-md font-medium text-blue-500">
                {t('documents.analysis.warning')}
              </p>
            </CardContainer>
          ) : undefined
        }
      />
    ) : (
      <Spinner />
    ),
    review: childProfileId ? (
      <ChildReviewForm
        childProfileId={childProfileId}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    ) : (
      <Spinner />
    ),
  };

  const renderCurrentStep = () => {
    return stepsComponents[currentTab];
  };

  return (
    <div className="w-full overflow-x-hidden max-w-7xl mx-auto flex flex-col lg:pb-0">
      <header className="w-full border-b border-border pb-6 lg:hidden">
        <StepIndicator<ChildRegistrationStep>
          variant="horizontal"
          steps={orderedSteps.map((step) => {
            const stepIndex = orderedSteps.indexOf(step);
            const currentIndex = orderedSteps.indexOf(currentTab);

            return {
              title: t(`steps.${step === 'parents' ? 'child_parents' : step}`),
              key: step,
              description: t(
                `steps.${step === 'parents' ? 'child_parents' : step}_description`,
              ),
              isOptional: false,
              isComplete: stepIndex < currentIndex,
            };
          })}
          currentStep={currentTab}
          onChange={(step) => setCurrentTab(step as ChildRegistrationStep)}
        />
      </header>

      <div className="w-full flex flex-col lg:flex-row lg:gap-4">
        <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0 lg:sticky lg:self-start">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">{t('child.profile.title')}</h2>
            <StepIndicator<ChildRegistrationStep>
              variant="vertical"
              steps={orderedSteps.map((step) => {
                const stepIndex = orderedSteps.indexOf(step);
                const currentIndex = orderedSteps.indexOf(currentTab);

                return {
                  title: t(`steps.${step === 'parents' ? 'child_parents' : step}`),
                  key: step,
                  description: t(
                    `steps.${step === 'parents' ? 'child_parents' : step}_description`,
                  ),
                  isOptional: false,
                  isComplete: stepIndex < currentIndex,
                };
              })}
              currentStep={currentTab}
              onChange={(step) => setCurrentTab(step as ChildRegistrationStep)}
            />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <div className="flex flex-col md:pb-10 gap-4 justify-center">
              <CardContainer>{renderCurrentStep()}</CardContainer>
            </div>

            <MobileProgress
              currentStepIndex={currentStepIndex}
              totalSteps={orderedSteps.length}
              stepTitle={t(
                `steps.${currentTab === 'parents' ? 'child_parents' : currentTab}`,
              )}
              isOptional={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

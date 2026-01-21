'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import {
  type DocumentUploadItem,
  DocumentUploadSection,
} from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { FamilyInfoForm } from './family-info';
import { ContactInfoForm } from './contact-form';
import { ProfessionalInfoForm } from './professional-info';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { handleFormError } from '@/lib/form/errors';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { calculateProfileCompletion, tryCatch } from '@/lib/utils';
import CardContainer from '../layouts/card-container';
import { Info } from 'lucide-react';
import { CountrySelect } from '../ui/country-select';
import Link from 'next/link';
import { CountryCode, CountryStatus } from '@/convex/lib/constants';
import React from 'react';
import { useTabs } from '@/hooks/use-tabs';
import { DocumentType } from '@/convex/lib/constants';
import type { Doc } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { ReviewFields } from './review-fields';
import type { CompleteProfile } from '@/convex/lib/types';

export type RegistrationStep =
  | 'documents'
  | 'basic-info'
  | 'family-info'
  | 'contact-info'
  | 'professional-info'
  | 'review';

export function RegistrationForm({ profile }: { profile: CompleteProfile }) {
  const submitProfileForValidation = useMutation(
    api.functions.profile.submitProfileForValidation,
  );
  const completion = calculateProfileCompletion(profile);
  const router = useRouter();
  const t = useTranslations('registration');
  const tInputs = useTranslations('inputs');
  const [displayAnalysisWarning, setDisplayAnalysisWarning] = useState(false);

  const orderedSteps: RegistrationStep[] = [
    'documents',
    'basic-info',
    'family-info',
    'contact-info',
    'professional-info',
    'review',
  ];

  const { currentTab, handleTabChange: setCurrentTab } = useTabs<RegistrationStep>(
    'tab',
    'documents',
  );

  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const totalSteps = orderedSteps.length;

  if (!profile) return null;

  // Gestionnaire d'analyse des documents
  const handleDocumentsAnalysis = async () => {
    try {
      toast.success(t('profile.analysis.success.title'), {
        description: (
          <div className="space-y-2">
            <p>{t('profile.analysis.success.description')}</p>
            <Button onClick={handleNext} size="sm">
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

  // Gestionnaire de navigation
  const handleNext = async () => {
    const nextStep = orderedSteps[orderedSteps.indexOf(currentTab) + 1];

    try {
      // Handle final step logic
      if (currentStepIndex === totalSteps - 1) {
        if (!completion.canSubmit) {
          toast.error('Formulaire incomplet', {
            description: 'Veuillez remplir tous les champs requis avant de soumettre',
          });
          return;
        }
        await handleFinalSubmit();
        return;
      }

      // Navigate to next step if available
      // Note: Validation is now handled by each form's submit handler
      if (nextStep) {
        setCurrentTab(nextStep);
      } else {
        router.push(ROUTES.user.dashboard);
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

  // Soumission finale
  const handleFinalSubmit = async () => {
    const result = await tryCatch(
      submitProfileForValidation({
        profileId: profile._id,
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

      router.push(ROUTES.user.dashboard);
    }
  };

  const requiredDocuments: DocumentUploadItem[] = [
    {
      id: 'passport' as const,
      label: tInputs('passport.label'),
      description: tInputs('passport.help'),
      required: false,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024, // 5MB
      expectedType: DocumentType.Passport,
    },
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
      id: 'residencePermit' as const,
      label: tInputs('residencePermit.label'),
      description: tInputs('residencePermit.help'),
      required: false,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      expectedType: DocumentType.ResidencePermit,
    },
    {
      id: 'addressProof' as const,
      label: tInputs('addressProof.label'),
      description: tInputs('addressProof.help'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      expectedType: DocumentType.ProofOfAddress,
    },
  ] as const;

  const stepsComponents: Record<RegistrationStep, React.ReactNode> = {
    documents: (
      <DocumentUploadSection
        profile={profile}
        onSave={() => {
          router.refresh();
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onAnalysisComplete={handleDocumentsAnalysis}
        documents={requiredDocuments}
      />
    ),
    'basic-info': (
      <BasicInfoForm profile={profile} onSave={handleNext} onPrevious={handlePrevious} />
    ),
    'family-info': (
      <FamilyInfoForm profile={profile} onSave={handleNext} onPrevious={handlePrevious} />
    ),
    'contact-info': (
      <ContactInfoForm
        profile={profile}
        onSave={handleNext}
        onPrevious={handlePrevious}
      />
    ),
    'professional-info': (
      <ProfessionalInfoForm
        profile={profile}
        onSave={handleNext}
        onPrevious={handlePrevious}
      />
    ),
    review: (
      <ReviewFields profile={profile} onNext={handleNext} onPrevious={handlePrevious} />
    ),
  };

  // Rendu du formulaire actuel
  const renderCurrentStep = () => {
    return stepsComponents[currentTab];
  };

  return (
    <div className="w-full overflow-x-hidden max-w-7xl mx-auto flex flex-col lg:pb-0">
      {/* Version mobile/tablette - Étapes horizontales en header */}
      <header className="w-full border-b border-border pb-6 lg:hidden">
        <StepIndicator<RegistrationStep>
          variant="horizontal"
          steps={orderedSteps.map((step) => {
            const stepIndex = orderedSteps.indexOf(step);
            const currentIndex = orderedSteps.indexOf(currentTab);

            return {
              title: t(`steps.${step}`),
              key: step,
              description: t(`steps.${step}_description`),
              isOptional: step === 'professional-info',
              isComplete: stepIndex < currentIndex,
            };
          })}
          currentStep={currentTab}
          onChange={(step) => setCurrentTab(step as RegistrationStep)}
        />
      </header>

      {/* Version desktop - Layout avec sidebar */}
      <div className="w-full flex flex-col lg:flex-row lg:gap-4">
        {/* Sidebar verticale pour desktop */}
        <aside className="hidden lg:block min-w-max lg:flex-shrink-0 lg:sticky lg:self-start">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">{t('profile.title')}</h2>
            <StepIndicator<RegistrationStep>
              variant="vertical"
              steps={orderedSteps.map((step) => {
                const stepIndex = orderedSteps.indexOf(step);
                const currentIndex = orderedSteps.indexOf(currentTab);

                return {
                  title: t(`steps.${step}`),
                  key: step,
                  description: t(`steps.${step}_description`),
                  isOptional: step === 'professional-info',
                  isComplete: stepIndex < currentIndex,
                };
              })}
              currentStep={currentTab}
              onChange={(step) => setCurrentTab(step as RegistrationStep)}
            />
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            {/* Contenu principal */}
            <div className="flex flex-col md:pb-10 gap-4 justify-center">
              {currentStepIndex > 1 && displayAnalysisWarning && (
                <AnalysisWarningBanner />
              )}
              <CardContainer>{renderCurrentStep()}</CardContainer>
            </div>

            {/* Progression mobile */}
            <MobileProgress
              currentStepIndex={currentStepIndex}
              totalSteps={orderedSteps.length}
              stepTitle={t(`steps.${currentTab}`)}
              isOptional={currentTab === 'professional-info'}
            />
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

export function SelectRegistrationCountryForm({
  countries,
}: {
  countries: Doc<'countries'>[];
}) {
  const t = useTranslations('registration');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>(
    countries[0]?.code as CountryCode,
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('modal.title')}</h3>
      <p className="text-sm text-muted-foreground">{t('modal.subtitle')}</p>

      <div>
        <CountrySelect
          type="single"
          selected={selectedCountry}
          onChange={(value) => setSelectedCountry(value)}
          options={countries.map((item) => item.code as CountryCode)}
          disabledOptions={countries
            .filter((item) => item.status !== CountryStatus.Active)
            .map((item) => item.code as CountryCode)}
        />
      </div>
      <Button asChild>
        <Link href={`${ROUTES.user.profile_form}?country=${selectedCountry}`}>
          {t('modal.continue')}
        </Link>
      </Button>
    </div>
  );
}

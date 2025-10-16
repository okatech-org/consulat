'use client';

import { useRegistrationForm } from '@/hooks/use-registration-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import type {
  BasicInfoFormData,
  ContactInfoFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import {
  type DocumentUploadItem,
  DocumentUploadSection,
} from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { FamilyInfoForm } from './family-info';
import { ContactInfoForm } from './contact-form';
import { ProfessionalInfoForm } from './professional-info';
import { ReviewForm } from './review';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { handleFormError } from '@/lib/form/errors';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  type ErrorMessageKey,
  filterUneditedKeys,
  getValuable,
  tryCatch,
} from '@/lib/utils';
import CardContainer from '../layouts/card-container';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { CountrySelect } from '../ui/country-select';
import { type CountryCode } from '@/lib/autocomplete-datas';
import Link from 'next/link';
import { CountryStatus, ProfileStatus } from '@/convex/lib/constants';
import { ErrorCard } from '../ui/error-card';
import { type FullProfile } from '@/types/convex-profile';
import React from 'react';
import { useTabs } from '@/hooks/use-tabs';
import { DocumentType } from '@/convex/lib/constants';
import type { Doc } from '@/convex/_generated/dataModel';

export function RegistrationForm({ profile }: { profile: FullProfile }) {
  if (!profile) return null;

  const {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    setError,
    error,
    forms,
    clearData,
    saveToConvex,
  } = useRegistrationForm({ profile });
  const submitProfileForValidation = useMutation(
    api.functions.profile.submitProfileForValidation,
  );
  const router = useRouter();
  const t = useTranslations('registration');
  const tInputs = useTranslations('inputs');
  const t_errors = useTranslations('messages.errors');
  const t_base = useTranslations();
  const [validationError, setValidationError] = useState<string | undefined>();
  const [displayAnalysisWarning, setDisplayAnalysisWarning] = useState(false);

  type Step = keyof typeof forms;

  const orderedSteps: Step[] = [
    'documents',
    'basicInfo',
    'familyInfo',
    'contactInfo',
    'professionalInfo',
  ];

  const { currentTab, handleTabChange: setCurrentTab } = useTabs<Step>(
    'tab',
    'documents',
  );

  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const currentStepValidity = forms[currentTab as keyof typeof forms]?.formState.isValid;
  const currentStepErrors = forms[currentTab as keyof typeof forms]?.formState.errors;
  const totalSteps = orderedSteps.length;
  const currentStepDirty = forms[currentTab as keyof typeof forms]?.formState.isDirty;

  // Gestionnaire d'analyse des components
  const handleDocumentsAnalysis = async (data: {
    basicInfo?: Partial<BasicInfoFormData>;
    contactInfo?: Partial<ContactInfoFormData>;
    familyInfo?: Partial<FamilyInfoFormData>;
    professionalInfo?: Partial<ProfessionalInfoFormData>;
  }) => {
    setIsLoading(true);
    setError(undefined);

    const cleanedData = getValuable(data);

    try {
      // Update each form with the data from the analysis
      if (cleanedData.basicInfo && forms.basicInfo) {
        const basicInfoFields = [
          'firstName',
          'lastName',
          'birthDate',
          'birthPlace',
          'birthCountry',
          'gender',
          'passportExpiryDate',
          'passportIssueDate',
          'passportIssueAuthority',
          'passportNumber',
          'acquisitionMode',
        ] as Array<keyof BasicInfoFormData>;

        basicInfoFields.forEach((field) => {
          if (cleanedData.basicInfo?.[field]) {
            forms.basicInfo.setValue(field, cleanedData.basicInfo[field], {
              shouldDirty: true,
            });
          }
        });
      }

      if (cleanedData.contactInfo && forms.contactInfo) {
        const address = cleanedData.contactInfo.address;

        if (address) {
          const { firstLine, city, zipCode, secondLine } = address;

          if (firstLine) {
            forms.contactInfo.setValue('address.firstLine', firstLine, {
              shouldDirty: true,
            });
          }

          if (city) {
            forms.contactInfo.setValue('address.city', city, { shouldDirty: true });
          }

          if (zipCode) {
            forms.contactInfo.setValue('address.zipCode', zipCode, { shouldDirty: true });
          }

          if (secondLine) {
            forms.contactInfo.setValue('address.secondLine', secondLine, {
              shouldDirty: true,
            });
          }
        }
      }

      if (cleanedData.familyInfo && forms.familyInfo) {
        const { father, mother, maritalStatus } = cleanedData.familyInfo;

        if (father) {
          forms.familyInfo.setValue('father', father, {
            shouldDirty: true,
          });
        }

        if (mother) {
          forms.familyInfo.setValue('mother', mother, {
            shouldDirty: true,
          });
        }

        if (maritalStatus) {
          forms.familyInfo.setValue('maritalStatus', maritalStatus, {
            shouldDirty: true,
          });
        }
      }

      if (cleanedData.professionalInfo && forms.professionalInfo) {
        const { profession, workStatus } = cleanedData.professionalInfo;

        if (profession) {
          forms.professionalInfo.setValue('profession', profession, {
            shouldDirty: true,
          });
        }

        if (workStatus) {
          forms.professionalInfo.setValue('workStatus', workStatus, {
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

  // Gestionnaire de navigation

  const handleNext = async () => {
    setError(undefined);
    setValidationError(undefined);
    setIsLoading(true);

    const stepForm = forms[currentTab as keyof typeof forms];
    const nextStep = orderedSteps[orderedSteps.indexOf(currentTab) + 1];

    try {
      // Validate the current step
      const isStepValid = await stepForm?.trigger();

      if (!isStepValid) {
        setValidationError(t_errors('invalid_step'));
        setIsLoading(false);
        return;
      }

      // For document step, just navigate to next step
      if (currentTab === 'documents' && nextStep) {
        setCurrentTab(nextStep);
        setIsLoading(false);
        return;
      }

      // Get the form data and check for changes
      const stepData = stepForm?.getValues();
      const editedFields = filterUneditedKeys(stepData, stepForm.formState.dirtyFields);

      // If there are changes, save them using Convex mutations
      if (editedFields && Object.keys(editedFields).length > 0) {
        try {
          await saveToConvex(
            currentTab as keyof typeof forms,
            stepForm?.getValues() as Record<string, unknown>,
          );
        } catch (error) {
          const { title, description } = handleFormError(error, t);
          toast({ title, description, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
      }

      // Handle final step logic
      if (currentStepIndex === totalSteps - 1) {
        if (profile.status !== ProfileStatus.Draft) {
          toast({
            title: t('submission.success.title'),
            description: t('submission.success.description'),
          });
          router.push(ROUTES.user.dashboard);
        } else {
          await handleFinalSubmit();
        }
        setIsLoading(false);
        return;
      }

      // Navigate to next step if available
      if (nextStep) {
        setCurrentTab(nextStep);
      } else {
        router.push(ROUTES.user.dashboard);
      }
    } catch (err) {
      const { title, description } = handleFormError(err, t);
      toast({ title, description, variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);

    const result = await tryCatch(
      submitProfileForValidation({
        profileId: profile._id,
      }),
    );

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

  const stepsComponents: Record<keyof typeof forms | 'review', React.ReactNode> = {
    documents: (
      <DocumentUploadSection
        profileId={profile._id}
        form={forms.documents}
        onAnalysisComplete={handleDocumentsAnalysis}
        handleSubmitAction={() => handleNext()}
        isLoading={isLoading}
        documents={requiredDocuments}
      />
    ),
    basicInfo: <BasicInfoForm onSubmit={() => handleNext()} profile={profile} />,
    familyInfo: (
      <FamilyInfoForm
        form={forms.familyInfo}
        onSubmit={() => handleNext()}
        isLoading={isLoading}
      />
    ),
    contactInfo: (
      <ContactInfoForm
        form={forms.contactInfo}
        onSubmitAction={() => handleNext()}
        isLoading={isLoading}
        profile={profile}
      />
    ),
    professionalInfo: (
      <ProfessionalInfoForm
        form={forms.professionalInfo}
        onSubmit={() => handleNext()}
        isLoading={isLoading}
      />
    ),
    review: (
      <ReviewForm
        data={{
          documents: forms.documents.getValues(),
          basicInfo: forms.basicInfo.getValues(),
          familyInfo: forms.familyInfo.getValues(),
          contactInfo: forms.contactInfo.getValues(),
          professionalInfo: forms.professionalInfo.getValues(),
        }}
        onEditAction={setCurrentStep}
      />
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
        <StepIndicator
          variant="horizontal"
          steps={orderedSteps.map((step) => {
            const stepIndex = orderedSteps.indexOf(step);
            const currentIndex = orderedSteps.indexOf(currentTab);

            return {
              title: t(`steps.${step}`),
              key: step,
              description: t(`steps.${step}_description`),
              isOptional: step === 'professionalInfo',
              isComplete: stepIndex < currentIndex,
            };
          })}
          currentStep={currentTab}
          onChange={(step) => setCurrentTab(step as Step)}
        />
      </header>

      {/* Version desktop - Layout avec sidebar */}
      <div className="w-full flex flex-col lg:flex-row lg:gap-4">
        {/* Sidebar verticale pour desktop */}
        <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0 lg:sticky lg:self-start">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6">{t('profile.title')}</h2>
            <StepIndicator
              variant="vertical"
              steps={orderedSteps.map((step) => {
                const stepIndex = orderedSteps.indexOf(step);
                const currentIndex = orderedSteps.indexOf(currentTab);

                return {
                  title: t(`steps.${step}`),
                  key: step,
                  description: t(`steps.${step}_description`),
                  isOptional: step === 'professionalInfo',
                  isComplete: stepIndex < currentIndex,
                };
              })}
              currentStep={currentTab}
              onChange={(step) => setCurrentTab(step as Step)}
            />
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            {/* Contenu principal */}
            <div className="flex flex-col md:pb-10 gap-4 justify-center">
              {currentStep > 1 && displayAnalysisWarning && <AnalysisWarningBanner />}
              <CardContainer>{renderCurrentStep()}</CardContainer>
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

              {validationError && (
                <ErrorCard
                  description={
                    <p className="flex items-center gap-2">
                      <Info className="size-icon" />
                      {validationError}
                    </p>
                  }
                />
              )}

              <div className="flex flex-col md:flex-row justify-between gap-4">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  disabled={isLoading || currentStepIndex === 0}
                  leftIcon={<ArrowLeft className="size-icon" />}
                >
                  {t('navigation.previous')}
                </Button>

                <Button
                  type="submit"
                  onClick={() => handleNext()}
                  loading={isLoading}
                  rightIcon={
                    currentStepIndex !== totalSteps - 1 ? (
                      <ArrowRight className="size-icon" />
                    ) : undefined
                  }
                >
                  {currentStepIndex === totalSteps - 1
                    ? "Finaliser l'inscription"
                    : `${currentStepDirty ? 'Enregistrer et continuer' : 'Continuer'} (${currentStepIndex + 1}/${totalSteps})`}
                </Button>
              </div>
              {!currentStepValidity && (
                <div className="errors flex flex-col gap-2">
                  <p className="text-sm max-w-[90%] mx-auto items-center text-muted-foreground flex gap-2 w-full">
                    <Info className="size-icon min-w-max text-blue-500" />
                    <span>{t('navigation.validityWarning')}</span>
                  </p>
                  <ul className="flex flex-col items-center gap-2">
                    {Object.entries(currentStepErrors).map(([error, value]) => (
                      <li key={error} className="text-red-500 list-disc">
                        <span className="font-medium text-sm">
                          {tInputs(`${error}.label`)}
                        </span>
                        {': '}
                        <span>{t_base(value.message as ErrorMessageKey)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Progression mobile */}
            <MobileProgress
              currentStepIndex={currentStepIndex}
              totalSteps={orderedSteps.length}
              stepTitle={t(`steps.${currentTab}`)}
              isOptional={currentTab === 'professionalInfo'}
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

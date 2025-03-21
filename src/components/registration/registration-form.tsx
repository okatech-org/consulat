'use client';

import { useRegistrationForm } from '@/hooks/use-registration-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import {
  BasicInfoFormData,
  ContactInfoFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import { DocumentUploadSection } from './document-upload-section';
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
import { submitProfileForValidation, updateProfile } from '@/actions/profile';
import { ErrorMessageKey, filterUneditedKeys, getValuable, tryCatch } from '@/lib/utils';
import CardContainer from '../layouts/card-container';
import { ArrowLeft, ArrowRight, Info, Loader } from 'lucide-react';
import { CountrySelect } from '../ui/country-select';
import { CountryCode } from '@/lib/autocomplete-datas';
import { Dialog, DialogContent } from '../ui/dialog';
import Link from 'next/link';
import { Country, CountryStatus } from '@prisma/client';
import { ErrorCard } from '../ui/error-card';
import { FullProfile } from '@/types';
import { env } from '@/lib/env/index';
import Image from 'next/image';
import React from 'react';
import { useStoredTabs } from '@/hooks/use-tabs';
import { isFieldBlacklisted } from '@/lib/document-fields';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export function RegistrationForm({
  availableCountries,
  profile,
}: {
  availableCountries: Country[];
  profile: FullProfile;
}) {
  const {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    setError,
    error,
    forms,
    clearData,
  } = useRegistrationForm({ profile });
  const country = profile?.user?.countryCode;
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

  const { currentTab, setCurrentTab } = useStoredTabs<Step>('tab', 'documents');

  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const currentStepValidity = forms[currentTab as keyof typeof forms].formState.isValid;
  const currentStepErrors = forms[currentTab as keyof typeof forms].formState.errors;
  const totalSteps = orderedSteps.length;

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
        Object.entries(cleanedData.basicInfo).forEach(([field, value]) => {
          if (
            typeof field === 'string' &&
            forms.basicInfo.getValues()[field as keyof BasicInfoFormData] !== undefined
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            forms.basicInfo.setValue(field as keyof BasicInfoFormData, value as any);
          }
        });
      }

      if (cleanedData.contactInfo && forms.contactInfo) {
        Object.entries(cleanedData.contactInfo).forEach(([field, value]) => {
          if (
            typeof field === 'string' &&
            forms.contactInfo.getValues()[field as keyof ContactInfoFormData] !==
              undefined
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            forms.contactInfo.setValue(field as keyof ContactInfoFormData, value as any);
          }
        });
      }

      if (cleanedData.familyInfo && forms.familyInfo) {
        Object.entries(cleanedData.familyInfo).forEach(([field, value]) => {
          if (
            typeof field === 'string' &&
            forms.familyInfo.getValues()[field as keyof FamilyInfoFormData] !== undefined
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            forms.familyInfo.setValue(field as keyof FamilyInfoFormData, value as any);
          }
        });
      }

      if (cleanedData.professionalInfo && forms.professionalInfo) {
        Object.entries(cleanedData.professionalInfo).forEach(([field, value]) => {
          if (
            typeof field === 'string' &&
            forms.professionalInfo.getValues()[
              field as keyof ProfessionalInfoFormData
            ] !== undefined
          ) {
            forms.professionalInfo.setValue(
              field as keyof ProfessionalInfoFormData,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value as any,
            );
          }
        });
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

  // Gestionnaire de navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // If there are changes, save them
      if (editedFields && Object.keys(editedFields).length > 0) {
        const { error } = await tryCatch(updateProfile(profile.id, editedFields));

        if (error) {
          const { title, description } = handleFormError(error, t);
          toast({ title, description, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
      }

      // Handle final step logic
      if (currentStepIndex === totalSteps - 1) {
        if (profile.status !== 'DRAFT') {
          toast({
            title: t('submission.success.title'),
            description: t('submission.success.description'),
          });
          router.push(ROUTES.user.profile);
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
        router.push(ROUTES.user.profile);
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
      submitProfileForValidation(profile.id, profile.category === 'MINOR'),
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

      router.push(ROUTES.user.profile);
    }
  };

  const stepsComponents: Record<keyof typeof forms | 'review', React.ReactNode> = {
    documents: (
      <DocumentUploadSection
        profileId={profile.id}
        form={forms.documents}
        onAnalysisComplete={handleDocumentsAnalysis}
        handleSubmitAction={() => handleNext()}
        isLoading={isLoading}
      />
    ),
    basicInfo: (
      <BasicInfoForm
        form={forms.basicInfo}
        onSubmit={() => handleNext()}
        isLoading={isLoading}
        profileId={profile.id}
      />
    ),
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
    <div className="w-full max-w-3xl min-h-full flex flex-col">
      <header className="w-full border-b border-border pb-6">
        <div className="flex mb-4 h-max w-max items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
          <Image
            src={appLogo}
            width={200}
            height={200}
            alt={'Logo'}
            className="relative h-16 w-16 rounded-md transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h1 className="text-2xl mb-4 font-bold">{tInputs('newProfile.title')}</h1>
        <StepIndicator
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
      <div className="w-full flex flex-col">
        <div className="mx-auto w-full max-w-4xl">
          {/* En-tête avec progression */}
          <div className="mb-8 space-y-6"></div>

          {/* Contenu principal */}
          <div className="flex flex-col pb-24 md:pb-10 gap-4 justify-center">
            {currentStep > 1 && displayAnalysisWarning && <AnalysisWarningBanner />}
            {renderCurrentStep()}

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
                disabled={isLoading}
                className="ml-auto gap-2"
              >
                {isLoading ? <Loader className="size-4 animate-spin" /> : null}
                {currentStepIndex === totalSteps - 1
                  ? t('navigation.submit')
                  : t('navigation.next')}
                {currentStepIndex !== totalSteps - 1 && <ArrowRight className="size-4" />}
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
                        {/**
                         * @ts-expect-error - This is a workaround to get the error message key*/}
                        {tInputs(`${error}.label`)}
                      </span>
                      {': '}
                      {/**
                       * @ts-expect-error - we use the error message key*/}
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
      </div>
      <Dialog open={!country}>
        <DialogContent>
          <SelectRegistrationCountryForm countries={availableCountries} />
        </DialogContent>
      </Dialog>
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

export function SelectRegistrationCountryForm({ countries }: { countries: Country[] }) {
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
            .filter((item) => item.status !== CountryStatus.ACTIVE)
            .map((item) => item.code as CountryCode)}
        />
      </div>
      <Button asChild>
        <Link href={`${ROUTES.registration}?country=${selectedCountry}`}>
          {t('modal.continue')}
        </Link>
      </Button>
    </div>
  );
}

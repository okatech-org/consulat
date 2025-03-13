'use client';

import { useRegistrationForm } from '@/hooks/use-registration-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { DocumentUploadSection } from './document-upload-section';
import { BasicInfoForm } from './basic-info';
import { FamilyInfoForm } from './family-info';
import { ContactInfoForm } from './contact-form';
import { ProfessionalInfoForm } from './professional-info';
import { ReviewForm } from './review';
import { StepIndicator } from './step-indicator';
import { MobileProgress } from './mobile-progress';
import { updateFormsFromAnalysis } from '@/lib/form/update-helpers';
import { handleFormError } from '@/lib/form/errors';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { submitProfileForValidation, updateProfile } from '@/actions/profile';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import CardContainer from '../layouts/card-container';
import { ArrowLeft, ArrowRight, Info, Loader } from 'lucide-react';
import { CountrySelect } from '../ui/country-select';
import { CountryCode } from '@/lib/autocomplete-datas';
import { Dialog, DialogContent } from '../ui/dialog';
import Link from 'next/link';
import { Country, CountryStatus } from '@prisma/client';
import { ErrorCard } from '../ui/error-card';
import { FullProfile } from '@/types';
import { useTabs } from '@/hooks/use-tabs';

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
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [displayAnalysisWarning, setDisplayAnalysisWarning] = useState(false);
  type Step = keyof typeof forms | 'review';

  const orderedSteps: Step[] = [
    'documents',
    'basicInfo',
    'familyInfo',
    'contactInfo',
    'professionalInfo',
  ];

  const { currentTab, handleTabChange } = useTabs<Step>('step', 'documents');
  const currentStepIndex = orderedSteps.indexOf(currentTab);
  const totalSteps = orderedSteps.length;

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

      // Afficher le toast avec les sections mises à jour
      const updatedSections = Object.entries(updateResult)
        .filter(([, hasUpdates]) => hasUpdates)
        // @ts-expect-error - Les sections sont dynamiques
        .map(([key]) => t(`sections.${key.replace('has', '').toLowerCase()}`));

      toast({
        title: t('profile.analysis.success.title'),
        description: (
          <div className="space-y-2">
            <p>{t('profile.analysis.success.description')}</p>
            <ul>
              {updatedSections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ul>
            <Button onClick={() => setCurrentStep((prev) => prev + 1)} size="sm">
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
    if (currentStepIndex === totalSteps - 1) {
      await handleFinalSubmit();
      return;
    }

    setError(undefined);
    setIsLoading(true);

    const stepForm = forms[currentTab];
    const stepData = stepForm?.getValues();
    const nextStep = orderedSteps[orderedSteps.indexOf(currentTab) + 1];

    console.log({ stepForm, stepData, errors: stepForm?.formState.errors });

    const isStepValid = await stepForm?.trigger();

    if (!isStepValid) {
      setIsLoading(false);
      return;
    }

    if (currentTab === 'documents' && nextStep) {
      handleTabChange(nextStep);
      setIsLoading(false);
    }

    if (stepForm) {
      const editedFields = filterUneditedKeys(stepData, stepForm.formState.dirtyFields);

      if (editedFields) {
        console.log({ editedFields });
        const { data: result, error } = await tryCatch(
          updateProfile(profile.id, editedFields),
        );

        if (result && nextStep) {
          handleTabChange(nextStep);
        }

        if (error) {
          setError(error.message);
        }
      }

      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    const previousStep = orderedSteps[orderedSteps.indexOf(currentTab) - 1];
    if (previousStep) {
      handleTabChange(previousStep);
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
    <>
      <div className="mx-auto w-full max-w-4xl">
        {/* En-tête avec progression */}
        <div className="mb-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold md:text-3xl">{t('header.title')}</h3>
            <p className="mt-2 text-muted-foreground">{t('header.subtitle')}</p>
          </div>

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
            onChange={handleTabChange}
          />
        </div>

        {/* Contenu principal */}
        <div className="flex flex-col gap-4 justify-center">
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

          <div className="mt-6 flex justify-between gap-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={isLoading}
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
        </div>

        {/* Progression mobile */}
        <MobileProgress
          currentStepIndex={currentStepIndex}
          totalSteps={orderedSteps.length}
          stepTitle={t(`steps.${currentTab}`)}
          isOptional={currentTab === 'professionalInfo'}
        />
      </div>
      <Dialog open={!country}>
        <DialogContent>
          <SelectRegistrationCountryForm countries={availableCountries} />
        </DialogContent>
      </Dialog>
    </>
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

'use client';

import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { ServiceRequest, UserDocument } from '@prisma/client';
import { Info } from 'lucide-react';
import { ErrorCard } from '@/components/ui/error-card';
import { useRouter } from 'next/navigation';
import { ConsularServiceItem } from '@/types/consular-service';
import { DynamicForm } from '@/components/services/dynamic-form';
import { submitServiceRequest } from '@/actions/services';
import { ServiceDocumentSection } from './service-document-section';
import { useServiceForm } from '@/hooks/use-service-form';
import { FullProfile } from '@/types/profile';
import { NewAppointmentForm } from '../appointments/new-appointment-form';
import { tryCatch } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import { StepIndicator } from '../registration/step-indicator';

type ServiceWithSteps = ConsularServiceItem;

export function ServiceSubmissionForm({
  service,
  userProfile,
}: {
  service: ServiceWithSteps;
  userProfile: FullProfile;
}) {
  const t = useTranslations();
  const router = useRouter();

  console.log({ service, userProfile });

  // Utiliser notre hook personnalisé
  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    forms,
    error,
    setError,
    isLoading,
    setIsLoading,
  } = useServiceForm(service, userProfile);

  console.log({ forms });

  type StepKey = keyof (typeof forms)[number]['id'];

  const currentStepIndex = forms.findIndex((form) => form.id === currentStep);
  const totalSteps = forms.length;

  const handleNext = async (data: Record<string, unknown>) => {
    setError(null);
    setIsLoading(true);
    updateFormData(currentStep, data);

    if (currentStepIndex === totalSteps - 1) {
      await handleFinalSubmit();
      return;
    }

    const nextStep = forms[currentStepIndex + 1];

    if (nextStep?.id) {
      setCurrentStep(nextStep.id);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const { documents, appointment, ...rest } = formData;

    const requestData: ServiceRequest = {
      serviceId: service.id,
      submittedById: userProfile.userId ?? '',
      requestedForId: userProfile.id,
      organizationId: service.organizationId ?? '',
      countryCode: service.countryCode ?? '',
      serviceCategory: service.category,
      // @ts-expect-error - TODO: fix this
      requiredDocuments: documents
        ? Object.values(documents as Record<string, UserDocument>)
        : [],
      ...(appointment && {
        appointmentDuration: appointment.duration,
        appointmentTime: appointment.time,
      }),
      formData: JSON.stringify(rest),
    };

    const result = await tryCatch(submitServiceRequest(requestData));

    setIsLoading(false);

    if (result.data) {
      toast({
        title: t('messages.success.create'),
        description: t('messages.success.profile.update_description'),
        variant: 'success',
      });
      router.push(ROUTES.user.service_request_details(result.data?.id ?? ''));
    }

    if (result.error) {
      toast({
        title: t('messages.errors.create'),
        description: result.error.message,
        variant: 'destructive',
      });
      setError(result.error.message);
    }
  };

  // Rendu du formulaire actuel
  const renderCurrentStep = () => {
    if (currentStep === 'documents') {
      const formData = forms.find((form) => form.id === currentStep);
      if (!formData) return undefined;
      return (
        <ServiceDocumentSection
          userId={userProfile.userId ?? ''}
          formData={formData}
          onNext={handleNext}
          onPrevious={() => {
            const previousStep = forms[currentStepIndex - 1];
            if (previousStep?.id) {
              setCurrentStep(previousStep.id);
            }
          }}
          isLoading={isLoading}
        />
      );
    }

    if (currentStep === 'appointment') {
      return (
        <NewAppointmentForm
          services={[service]}
          countryCode={service.countryCode ?? ''}
          organizationId={service.organizationId ?? ''}
          attendeeId={userProfile.userId ?? ''}
          preselectedData={{
            serviceId: service.id,
            type: 'appointment',
            requestId: '',
          }}
        />
      );
    }

    const stepFormData = forms.find((form) => form.id === currentStep);
    if (!stepFormData) return undefined;

    return (
      <DynamicForm
        formData={stepFormData}
        onNext={handleNext}
        onPrevious={() => {
          const previousStep = forms[currentStepIndex - 1];
          if (previousStep?.id) {
            setCurrentStep(previousStep.id);
          }
        }}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        userId={userProfile.userId ?? ''}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div className="w-full overflow-x-hidden max-w-4xl mx-auto flex flex-col pb-safe md:pb-0">
      <header className="w-full border-b border-border pb-6">
        <h1 className="text-2xl mb-4 font-bold">{service.name}</h1>
        <StepIndicator
          steps={forms.map((form) => {
            const stepIndex = forms.indexOf(form);
            const currentIndex = forms.indexOf(currentStep as StepKey);

            return {
              title: form.title,
              key: form.id as StepKey,
              description: form.description ?? '',
              isOptional: false,
              isComplete: stepIndex < currentIndex,
            };
          })}
          currentStep={currentStep as StepKey}
          onChange={(step) => setCurrentStep(step as StepKey)}
        />
      </header>

      <div className="w-full flex flex-col">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-col md:pb-10 gap-4 justify-center">
            {renderCurrentStep()}

            {error && (
              <ErrorCard
                description={
                  <p className="flex items-center gap-2">
                    <Info className="size-icon" />
                    {error}
                  </p>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

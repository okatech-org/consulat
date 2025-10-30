'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { ErrorCard } from '@/components/ui/error-card';
import { useRouter } from 'next/navigation';
import { DynamicForm } from '@/components/services/dynamic-form';
import { ServiceDocumentSection } from './service-document-section';
import { useServiceForm } from '@/hooks/use-service-form';
import { tryCatch } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import { StepIndicator } from '../registration/step-indicator';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AppointmentType, DeliveryMode } from '../../../convex/lib/constants';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import type { CompleteProfile } from '@/convex/lib/types';

export function ServiceSubmissionForm({
  service,
  profile,
}: {
  service: Doc<'services'>;
  profile: CompleteProfile;
}) {
  const t = useTranslations();
  const router = useRouter();

  // Convex mutations
  const createRequest = useMutation(api.functions.request.createRequest);
  const submitRequest = useMutation(api.functions.request.submitRequest);
  const autoAssignRequest = useMutation(api.functions.request.autoAssignRequestToAgent);
  const updateRequest = useMutation(api.functions.request.updateRequest);

  // Use the service form hook
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
  } = useServiceForm(service, profile);

  type StepKey = keyof (typeof forms)[number]['id'];

  const currentStepIndex = forms.findIndex((form) => form.id === currentStep);
  const totalSteps = forms.length;

  const handleNext = async (data: Record<string, unknown>) => {
    setError(null);
    setIsLoading(true);
    updateFormData(currentStep, data);

    if (currentStepIndex === totalSteps - 1) {
      await handleFinalSubmit();
      setIsLoading(false);
      return;
    }

    const nextStep = forms[currentStepIndex + 1];

    if (nextStep?.id) {
      setCurrentStep(nextStep.id);
    }
    setIsLoading(false);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const { documents, delivery, ...rest } = formData;

    try {
      // Step 1: Create the request in Draft status
      const requestId = await createRequest({
        serviceId: service._id,
        requesterId: profile._id,
        profileId: profile._id,
        formData: rest,
        documentIds: documents
          ? (Object.values(documents as Record<string, { _id: string }>)
              .map((doc) => doc._id)
              .filter(Boolean) as Id<'documents'>[])
          : [],
      });

      // Step 2: Update request with delivery configuration if provided
      if (delivery) {
        const deliveryAddress = delivery.deliveryAddress
          ? delivery.deliveryAddress
          : undefined;

        await updateRequest({
          requestId,
          formData: {
            ...rest,
            config: {
              deliveryMode: delivery.deliveryMode,
              ...(delivery.deliveryMode === DeliveryMode.Postal &&
                deliveryAddress && {
                  deliveryAddress,
                }),
            },
          },
        });
      }

      // Step 3: Submit the request (changes status from Draft to Submitted)
      await submitRequest({ requestId });

      // Step 4: Auto-assign to least busy agent
      const result = await tryCatch(
        autoAssignRequest({
          requestId,
          serviceId: service._id,
          organizationId: service.organizationId,
          countryCode: profile.residenceCountry || 'GA',
        }),
      );

      if (result.error) {
        console.error('Failed to auto-assign agent:', result.error);
        // Continue even if auto-assignment fails
      }

      setIsLoading(false);

      toast.success(t('messages.success.create'), {
        description: t('messages.success.create_description'),
      });

      // Check if service requires appointment and redirect accordingly
      if (service.processing.appointment.requires) {
        // Store the request ID in sessionStorage for the appointment form
        sessionStorage.setItem('pendingAppointmentRequestId', requestId);
        sessionStorage.setItem(
          'pendingAppointmentType',
          AppointmentType.DocumentSubmission,
        );
        router.push(
          `${ROUTES.user.appointments_new}?serviceRequestId=${requestId}&type=${AppointmentType.DocumentSubmission}`,
        );
      } else {
        router.push(ROUTES.user.service_request_details(requestId));
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while submitting the request';

      toast.error(t('messages.errors.create'), {
        description: errorMessage,
      });
      setError(errorMessage);
    }
  };

  // Render the current step
  const renderCurrentStep = () => {
    if (currentStep === 'documents') {
      const formData = forms.find((form) => form.id === currentStep);
      if (!formData) return undefined;
      return (
        <ServiceDocumentSection
          userId={profile.userId}
          formData={formData}
          onNext={handleNext}
          onPrevious={() => {
            const previousStep = forms[currentStepIndex - 1];
            if (previousStep?.id) {
              setCurrentStep(previousStep.id);
            }
          }}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          isLoading={isLoading}
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
        userId={profile.userId}
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

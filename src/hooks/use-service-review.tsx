import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types/profile';
import { FullServiceRequest } from '@/types/service-request';
import { useStoredTabs } from './use-tabs';
import { DocumentType, UserDocument } from '@prisma/client';
import { ServiceField } from '@/types/consular-service';

interface ServiceReviewProps {
  request: FullServiceRequest;
  profile: FullProfile;
}

export type ServiceReviewTab = {
  value: string;
  label: string;
  component: React.ReactNode;
};

export type ReviewStepField = ServiceField & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export default function useServiceReview({ request, profile }: ServiceReviewProps) {
  const service = request.service;
  const tabs: ServiceReviewTab[] = [];

  if (service.requiredDocuments.length > 0 || service.optionalDocuments.length > 0) {
    tabs.push({
      value: 'documents',
      label: 'Documents du profil',
      component: <DocumentsReview request={request} />,
    });
  }

  service.steps.forEach((step) => {
    tabs.push({
      value: step.id,
      label: step.title,
      component: (
        <StepReview fields={getStepFieldsValue(request, step.id)} request={request} />
      ),
    });
  });

  if (service.requiresAppointment) {
    tabs.push({
      value: 'appointment',
      label: 'Rendez-vous de soumission',
      component: <AppointmentReview request={request} />,
    });
  }

  tabs.push({
    value: 'delivery',
    label: 'Option de délivrance choisie',
    component: <DeliveryReview request={request} />,
  });

  const { currentTab, setCurrentTab } = useStoredTabs<string>(
    'request-step' + request.id,
    tabs[0]?.value ?? '',
  );

  return {
    currentTab,
    setCurrentTab,
    tabs,
  };
}

type DocumentsReviewProps = {
  request: FullServiceRequest;
};

function DocumentsReview({ documents, request }: DocumentsReviewProps) {
  return <div>DocumentsReview</div>;
}

type StepReviewProps = {
  fields: ServiceField[];
  request: FullServiceRequest;
};

function StepReview({ fields, request }: StepReviewProps) {
  return <div>StepReview</div>;
}

type AppointmentReviewProps = {
  request: FullServiceRequest;
};

function AppointmentReview({ request }: AppointmentReviewProps) {
  return <div>AppointmentReview</div>;
}

type DeliveryReviewProps = {
  request: FullServiceRequest;
};

function DeliveryReview({ request }: DeliveryReviewProps) {
  return <div>DeliveryReview</div>;
}

function getStepFieldsValue(
  request: FullServiceRequest,
  stepId: string,
): ReviewStepField[] {
  const step = request.service.steps.find((step) => step.id === stepId);
  if (!step || !step.fields || !Array.isArray(step.fields)) return [];

  const formattedFormData = JSON.parse(JSON.stringify(request.formData));
  const stepFormData = formattedFormData[stepId] as Record<string, unknown> | undefined;
  if (!stepFormData || !Array.isArray(stepFormData)) return [];

  const fields = JSON.parse(JSON.stringify(step.fields)) as ServiceField[];

  return fields.map((field) => {
    const fieldId = field.name;
    const value = stepFormData[fieldId];

    return { ...field, value };
  });
}

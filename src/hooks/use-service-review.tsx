import { useStoredTabs } from './use-tabs';
import type { ServiceField } from '@/types/consular-service';
import CardContainer from '@/components/layouts/card-container';
import { AppointmentStatus } from '@/convex/lib/constants';
import { useDateLocale } from '@/lib/utils';
import { CheckCircle2, XCircle, Calendar, MapPin, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DisplayAddress } from '@/components/ui/display-address';
import { DocumentPreview } from '@/components/ui/document-preview';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InfoField } from '@/components/ui/info-field';
import type { RequestDetails } from '@/server/api/routers/requests/misc';
import type { AppUserDocument } from '@/types';
import { UserDocument } from '@/components/documents/user-document';

export type ServiceReviewTab = {
  value: string;
  label: string;
  component: React.ReactNode;
};

export type ReviewStepField = ServiceField & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export default function useServiceReview(request: RequestDetails) {
  const service = request.service;

  const tabs: ServiceReviewTab[] = [];

  if (service.requiredDocuments.length > 0 || service.optionalDocuments.length > 0) {
    tabs.push({
      value: 'documents',
      label: 'Documents',
      component: <ServiceRequestDocuments request={request} />,
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
      label: 'Rendez-vous',
      component: <AppointmentReview request={request} />,
    });
  }

  tabs.push({
    value: 'delivery',
    label: 'Livraison',
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

type StepReviewProps = {
  fields: ReviewStepField[];
  request: RequestDetails;
};

function StepReview({ fields }: StepReviewProps) {
  const { formatDate } = useDateLocale();
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    type: 'pdf' | 'image';
  } | null>(null);

  function renderFieldValue(field: ReviewStepField) {
    switch (field.type) {
      case 'date':
        return (
          <InfoField
            label={field.label}
            value={field.value ? formatDate(field.value, 'PPP') : 'Non renseigné'}
            required={field.required}
          />
        );
      case 'address':
        return field.value ? (
          <DisplayAddress address={field.value} title={field.label} />
        ) : (
          <span className="text-muted-foreground">Non renseigné</span>
        );
      case 'document':
      case 'photo':
      case 'file':
        if (field.value && typeof field.value === 'object' && 'fileUrl' in field.value) {
          return <DocumentReview document={field.value} />;
        }
        return <span className="text-muted-foreground">Non fourni</span>;
      default:
        return (
          <InfoField
            label={field.label}
            value={field.value || 'Non renseigné'}
            required={field.required}
          />
        );
    }
  }

  return (
    <>
      <CardContainer
        title="Champs du formulaire"
        contentClass="grid gap-4 sm:grid-cols-2 sm:gap-6"
      >
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div
              key={index}
              className="flex items-start justify-between border-b py-2 last:border-0"
            >
              <div className="space-y-1 flex-1">
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <div className="font-medium break-words">{renderFieldValue(field)}</div>
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
              {field.value ? (
                <CheckCircle2 className="text-success size-5 mt-1 flex-shrink-0 ml-2" />
              ) : field.required ? (
                <XCircle className="size-5 text-destructive mt-1 flex-shrink-0 ml-2" />
              ) : (
                <Badge className="mt-1 ml-2" variant="outline">
                  Optionnel
                </Badge>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground col-span-2">Aucun champ à afficher</p>
        )}
      </CardContainer>
      {previewDoc && (
        <DocumentPreview
          isOpen={!!previewDoc}
          setIsOpenAction={() => setPreviewDoc(null)}
          url={previewDoc.url}
          title={previewDoc.title}
          type={previewDoc.url.endsWith('.pdf') ? 'pdf' : 'image'}
        />
      )}
    </>
  );
}

type AppointmentReviewProps = {
  request: RequestDetails;
};

function AppointmentReview({ request }: AppointmentReviewProps) {
  const t_inputs = useTranslations('inputs');
  const { formatDate } = useDateLocale();

  const appointment = request.appointments?.[0];

  if (!appointment) {
    return (
      <CardContainer title="Rendez-vous">
        <p className="text-muted-foreground">Aucun rendez-vous programmé</p>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="Rendez-vous" contentClass="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <Calendar className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatDate(appointment.date, 'PPP')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Horaire</p>
            <p className="font-medium">
              {formatDate(appointment.startTime, 'p')} -{' '}
              {formatDate(appointment.endTime, 'p')}
            </p>
          </div>
        </div>
      </div>

      {appointment.locationId && (
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Adresse</p>
            <DisplayAddress address={appointment.location?.address ?? ''} />
          </div>
        </div>
      )}

      {appointment.instructions && (
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-1">Instructions</p>
          <p>{appointment.instructions}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Badge
          variant={
            appointment.status === AppointmentStatus.CONFIRMED
              ? 'default'
              : appointment.status === 'CANCELLED'
                ? 'destructive'
                : appointment.status === 'PENDING'
                  ? 'secondary'
                  : 'outline'
          }
        >
          {t_inputs(`appointment.status.options.${appointment.status}`)}
        </Badge>
      </div>
    </CardContainer>
  );
}

type DeliveryReviewProps = {
  request: RequestDetails;
};

function DeliveryReview({ request }: DeliveryReviewProps) {
  const t_inputs = useTranslations('inputs');
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    type: 'pdf' | 'image';
  } | null>(null);

  return (
    <>
      <CardContainer title="Option de livraison" contentClass="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Mode de livraison</p>
            <p className="font-medium">
              {t_inputs(`deliveryMode.options.${request.chosenDeliveryMode}`)}
            </p>
          </div>
        </div>

        {request.chosenDeliveryMode === 'POSTAL' && request.deliveryAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Adresse de livraison</p>
              <p className="whitespace-pre-line">{request.deliveryAddress}</p>
            </div>
          </div>
        )}

        {request.chosenDeliveryMode === 'BY_PROXY' && (
          <>
            {request.proxyName && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Nom du mandataire</p>
                  <p className="font-medium">{request.proxyName}</p>
                </div>
              </div>
            )}

            {request.proxyIdentityDoc && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Pièce d&apos;identité du mandataire
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      request.proxyIdentityDoc &&
                      setPreviewDoc({
                        url: request.proxyIdentityDoc,
                        title: "Pièce d'identité du mandataire",
                        type: request.proxyIdentityDoc.endsWith('.pdf') ? 'pdf' : 'image',
                      })
                    }
                  >
                    <Eye className="size-4" />
                    <span className="text-sm">Voir la pièce d&apos;identité</span>
                  </Button>
                </div>
                <CheckCircle2 className="text-success size-5" />
              </div>
            )}

            {request.proxyPowerOfAttorney && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Procuration</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      request.proxyPowerOfAttorney &&
                      setPreviewDoc({
                        url: request.proxyPowerOfAttorney,
                        title: 'Procuration',
                        type: request.proxyPowerOfAttorney.endsWith('.pdf')
                          ? 'pdf'
                          : 'image',
                      })
                    }
                  >
                    <Eye className="size-4" />
                    <span className="text-sm">Voir la procuration</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {request.trackingNumber && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Numéro de suivi</p>
              <p className="font-medium">{request.trackingNumber}</p>
            </div>
          </div>
        )}

        {request.deliveryStatus && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Statut de livraison</p>
              <p className="font-medium">
                {t_inputs(`deliveryStatus.options.${request.deliveryStatus}`)}
              </p>
            </div>
          </div>
        )}

        {request.chosenProcessingMode && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Mode de traitement</p>
              <p className="font-medium">
                {t_inputs(`processingMode.options.${request.chosenProcessingMode}`)}
              </p>
            </div>
          </div>
        )}
      </CardContainer>
      {previewDoc && (
        <DocumentPreview
          isOpen={!!previewDoc}
          setIsOpenAction={() => setPreviewDoc(null)}
          url={previewDoc.url}
          title={previewDoc.title}
          type={previewDoc.url.endsWith('.pdf') ? 'pdf' : 'image'}
        />
      )}
    </>
  );
}

function getStepFieldsValue(request: RequestDetails, stepId: string): ReviewStepField[] {
  const step = request.service.steps.find((step) => step.id === stepId);
  if (!step || !step.fields) return [];

  const formattedFormData = JSON.parse(request.formData as string);

  const stepFormData = formattedFormData[stepId] as Record<string, unknown> | undefined;

  if (!stepFormData) return [];

  const fields = JSON.parse(`${step.fields ?? '[]'}`) as ServiceField[];

  return fields.map((field) => {
    const fieldId = field.name;
    const value = stepFormData[fieldId];

    return { ...field, value };
  });
}

interface ServiceRequestDocumentsProps {
  request: RequestDetails;
}

export function ServiceRequestDocuments({ request }: ServiceRequestDocumentsProps) {
  const t_inputs = useTranslations('inputs');
  const service = request.service;
  const userDocuments: AppUserDocument[] = request.submittedBy.documents || [];
  const t_review = useTranslations('admin.registrations.review');

  const allServiceDocuments = [
    ...service.requiredDocuments.map((type) => ({ type, required: true })),
    ...service.optionalDocuments.map((type) => ({ type, required: false })),
  ];

  // Map service documents to user documents
  const documentsToDisplay = allServiceDocuments.map((serviceDoc) => {
    const userDoc = userDocuments.find(
      (doc: AppUserDocument) => doc.type === serviceDoc.type,
    );
    return {
      type: serviceDoc.type,
      required: serviceDoc.required,
      document: userDoc || null,
    };
  });

  return (
    <CardContainer
      title={t_review('sections.documents')}
      contentClass="grid sm:grid-cols-2 gap-4 sm:gap-6"
    >
      {documentsToDisplay.map((docItem) => {
        const { document, type } = docItem;

        return (
          <UserDocument
            key={document?.id}
            document={document}
            label={t_inputs(`userDocument.options.${type}`)}
          />
        );
      })}
    </CardContainer>
  );
}

export function DocumentReview({
  document: localDocument,
}: {
  document: AppUserDocument;
}) {
  const t_inputs = useTranslations('inputs');

  return (
    <UserDocument
      document={localDocument}
      label={t_inputs(`userDocument.options.${localDocument.type}`)}
    />
  );
}

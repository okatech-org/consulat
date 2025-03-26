import { FullServiceRequest } from '@/types/service-request';
import { useStoredTabs } from './use-tabs';
import { ServiceField } from '@/types/consular-service';
import CardContainer from '@/components/layouts/card-container';
import { DocumentType, DeliveryMode, UserDocument } from '@prisma/client';
import { useDateLocale } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  Package,
  Truck,
  UserCheck,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { DisplayAddress } from '@/components/ui/display-address';
import { DocumentPreview } from '@/components/ui/document-preview';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DocumentValidationDialog } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/document-validation-dialog';
import { documentValidations, validateDocument } from '@/lib/document-validation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export type ServiceReviewTab = {
  value: string;
  label: string;
  component: React.ReactNode;
};

export type ReviewStepField = ServiceField & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export default function useServiceReview(request: FullServiceRequest) {
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
  request: FullServiceRequest;
};

function StepReview({ fields }: StepReviewProps) {
  const { formatDate } = useDateLocale();

  const renderFieldValue = (field: ReviewStepField) => {
    const { type, value } = field;

    if (value === null || value === undefined) {
      return '-';
    }

    switch (type) {
      case 'date':
        return value ? formatDate(value, 'PPP') : '-';
      case 'select':
      case 'radio':
        // For single select or radio
        if (typeof value === 'string' && field.options) {
          const option = field.options.find((opt) => opt.value === value);
          return option ? option.label : value;
        }
        // For multiple select
        if (Array.isArray(value) && field.options) {
          return value
            .map((v) => {
              const option = field.options?.find((opt) => opt.value === v);
              return option ? option.label : v;
            })
            .join(', ');
        }
        return String(value);
      case 'checkbox':
        if (typeof value === 'boolean') {
          return value ? 'Oui' : 'Non';
        }
        if (Array.isArray(value) && field.options) {
          return value
            .map((v) => {
              const option = field.options?.find((opt) => opt.value === v);
              return option ? option.label : v;
            })
            .join(', ');
        }
        return String(value);
      case 'address':
        return value ? (
          <div>
            <p>{value.firstLine}</p>
            {value.secondLine && <p>{value.secondLine}</p>}
            <p>
              {value.city}, {value.zipCode}
            </p>
            <p>{value.country}</p>
          </div>
        ) : (
          '-'
        );
      case 'file':
      case 'document':
      case 'photo':
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Voir le fichier
          </a>
        ) : (
          '-'
        );
      default:
        return String(value);
    }
  };

  return (
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
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{field.label}</p>
              <div className="font-medium break-words">{renderFieldValue(field)}</div>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
            {field.value ? (
              <CheckCircle2 className="text-success size-5 mt-1 flex-shrink-0" />
            ) : field.required ? (
              <XCircle className="size-5 text-destructive mt-1 flex-shrink-0" />
            ) : (
              <Badge className="mt-1" variant="outline">
                Optionnel
              </Badge>
            )}
          </div>
        ))
      ) : (
        <p className="text-muted-foreground col-span-2">Aucun champ à afficher</p>
      )}
    </CardContainer>
  );
}

type AppointmentReviewProps = {
  request: FullServiceRequest;
};

function AppointmentReview({ request }: AppointmentReviewProps) {
  const { formatDate } = useDateLocale();

  const appointment = request.appointment;

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
          <CheckCircle2 className="text-success size-5" />
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
          <CheckCircle2 className="text-success size-5" />
        </div>
      </div>

      {appointment.location && (
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Adresse</p>
            <DisplayAddress address={appointment.location} />
          </div>
          <CheckCircle2 className="text-success size-5" />
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
            appointment.status.toLowerCase() as
              | 'default'
              | 'destructive'
              | 'outline'
              | 'secondary'
              | 'success'
          }
        >
          {appointment.status}
        </Badge>
      </div>
    </CardContainer>
  );
}

type DeliveryReviewProps = {
  request: FullServiceRequest;
};

function DeliveryReview({ request }: DeliveryReviewProps) {
  const getDeliveryModeLabel = (mode: DeliveryMode): string => {
    const modes: Record<DeliveryMode, string> = {
      IN_PERSON: 'En personne',
      POSTAL: 'Par voie postale',
      ELECTRONIC: 'Électronique',
      BY_PROXY: 'Par procuration',
    };

    return modes[mode] || mode;
  };

  const getProcessingModeLabel = (mode: string): string => {
    const modes: Record<string, string> = {
      ONLINE_ONLY: 'En ligne uniquement',
      PRESENCE_REQUIRED: 'Présence requise',
      HYBRID: 'Hybride',
      BY_PROXY: 'Par procuration',
    };

    return modes[mode] || mode;
  };

  const getDeliveryModeIcon = (mode: DeliveryMode) => {
    switch (mode) {
      case 'IN_PERSON':
        return <UserCheck className="size-5 text-muted-foreground" />;
      case 'POSTAL':
        return <Truck className="size-5 text-muted-foreground" />;
      case 'ELECTRONIC':
        return <Package className="size-5 text-muted-foreground" />;
      case 'BY_PROXY':
        return <UserCheck className="size-5 text-muted-foreground" />;
      default:
        return <Package className="size-5 text-muted-foreground" />;
    }
  };

  return (
    <CardContainer title="Option de livraison" contentClass="space-y-4">
      <div className="flex items-center gap-3">
        {getDeliveryModeIcon(request.chosenDeliveryMode)}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Mode de livraison</p>
          <p className="font-medium">
            {getDeliveryModeLabel(request.chosenDeliveryMode)}
          </p>
        </div>
        <CheckCircle2 className="text-success size-5" />
      </div>

      {request.chosenDeliveryMode === 'POSTAL' && request.deliveryAddress && (
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Adresse de livraison</p>
            <p className="whitespace-pre-line">{request.deliveryAddress}</p>
          </div>
          <CheckCircle2 className="text-success size-5" />
        </div>
      )}

      {request.chosenDeliveryMode === 'BY_PROXY' && (
        <>
          {request.proxyName && (
            <div className="flex items-center gap-3">
              <UserCheck className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nom du mandataire</p>
                <p className="font-medium">{request.proxyName}</p>
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>
          )}

          {request.proxyIdentityDoc && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Pièce d&apos;identité du mandataire
                </p>
                <DocumentPreview
                  url={request.proxyIdentityDoc}
                  title="Pièce d'identité du mandataire"
                  type="IDENTITY_CARD"
                />
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>
          )}

          {request.proxyPowerOfAttorney && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Procuration</p>
                <DocumentPreview
                  url={request.proxyPowerOfAttorney}
                  title="Procuration"
                  type="OTHER"
                />
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>
          )}
        </>
      )}

      {request.trackingNumber && (
        <div className="flex items-center gap-3">
          <Package className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Numéro de suivi</p>
            <p className="font-medium">{request.trackingNumber}</p>
          </div>
          <CheckCircle2 className="text-success size-5" />
        </div>
      )}

      {request.deliveryStatus && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Statut de livraison</p>
            <p className="font-medium">{request.deliveryStatus}</p>
          </div>
          <CheckCircle2 className="text-success size-5" />
        </div>
      )}

      <div className="pt-2 border-t">
        <p className="text-sm font-medium">Mode de traitement</p>
        <p className="text-sm text-muted-foreground">
          {getProcessingModeLabel(request.chosenProcessingMode)}
        </p>
      </div>
    </CardContainer>
  );
}

function getStepFieldsValue(
  request: FullServiceRequest,
  stepId: string,
): ReviewStepField[] {
  const step = request.service.steps.find((step) => step.id === stepId);
  if (!step || !step.fields || !Array.isArray(step.fields)) return [];

  const formattedFormData = JSON.parse(JSON.stringify(request.formData));
  const stepFormData = formattedFormData[stepId] as Record<string, unknown> | undefined;
  if (!stepFormData) return [];

  const fields = JSON.parse(JSON.stringify(step.fields)) as ServiceField[];

  return fields.map((field) => {
    const fieldId = field.name;
    const value = stepFormData[fieldId];

    return { ...field, value };
  });
}

interface ServiceRequestDocumentsProps {
  request: FullServiceRequest;
}

export function ServiceRequestDocuments({ request }: ServiceRequestDocumentsProps) {
  const documents = request.requiredDocuments;
  const t_inputs = useTranslations('inputs');
  const t = useTranslations('common');
  const t_errors = useTranslations('messages.errors');
  const t_review = useTranslations('admin.registrations.review');
  const router = useRouter();
  const { formatDate } = useDateLocale();

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    type: string;
  } | null>(null);

  return (
    <CardContainer
      title={t_review('sections.documents')}
      contentClass="grid sm:grid-cols-2 gap-4 sm:gap-6"
    >
      {documents.map((document) => {
        const validation = validateDocument(document, true);

        return (
          <div
            key={document.id}
            className="flex flex-col justify-between pb-4 border-b gap-4 last:border-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {t_inputs(`userDocument.options.${document.type}`)}
                </p>

                {documentValidations?.[document?.type as DocumentType]?.required && (
                  <Badge variant="outline">{t_review('documents.required')}</Badge>
                )}
                {document?.status && (
                  <Badge variant={document.status.toLowerCase() as BadgeVariant}>
                    {t(`status.${document.status}`)}
                  </Badge>
                )}
              </div>
              {document && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {document.issuedAt && (
                    <p>
                      {t_review('documents.issued_at')}:{' '}
                      {formatDate(document.issuedAt, 'PPP')}
                    </p>
                  )}
                  {document.expiresAt && (
                    <p>
                      {t_review('documents.expires_at')}:{' '}
                      {formatDate(document.expiresAt, 'PPP')}
                    </p>
                  )}
                </div>
              )}
              {!document && validation.errors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t_errors('not_provided')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {document && (
                <>
                  <DocumentPreview
                    url={document.fileUrl}
                    title={t_inputs(`userDocument.options.${document.type}`)}
                    type={document.type}
                    onDownload={() =>
                      handleDownload(
                        document.fileUrl,
                        `${document.type.toLowerCase()}.${document.fileUrl.split('.').pop()}`,
                      )
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDocument({
                        id: document.id,
                        type: document.type,
                      })
                    }
                  >
                    <Shield className="size-4" />
                    <span className="text-sm">Valider</span>
                  </Button>
                  <Tooltip>
                    <TooltipTrigger>
                      {validation.isValid ? (
                        <CheckCircle2 className="text-success size-5" />
                      ) : (
                        <AlertTriangle className="size-5 text-warning" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {validation.isValid
                        ? t_review('documents.valid')
                        : validation.errors.join(', ')}
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        );
      })}

      {selectedDocument && (
        <DocumentValidationDialog
          documentId={selectedDocument.id}
          documentType={selectedDocument.type}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onValidated={() => {
            router.refresh();
          }}
        />
      )}
    </CardContainer>
  );
}

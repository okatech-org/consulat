import { FullProfile } from '@/types/profile';
import { FullServiceRequest } from '@/types/service-request';
import { useStoredTabs } from './use-tabs';
import { ServiceField } from '@/types/consular-service';
import CardContainer from '@/components/layouts/card-container';
import { DocumentType, DeliveryMode } from '@prisma/client';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DisplayAddress } from '@/components/ui/display-address';
import { DocumentPreview } from '@/components/ui/document-preview';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

export default function useServiceReview({ request }: ServiceReviewProps) {
  const service = request.service;
  const tabs: ServiceReviewTab[] = [];

  if (service.requiredDocuments.length > 0 || service.optionalDocuments.length > 0) {
    tabs.push({
      value: 'documents',
      label: 'Documents',
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

type DocumentsReviewProps = {
  request: FullServiceRequest;
};

function DocumentsReview({ request }: DocumentsReviewProps) {
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

  const getDocumentLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      PASSPORT: 'Passeport',
      IDENTITY_CARD: 'Carte d&apos;identité',
      BIRTH_CERTIFICATE: 'Extrait de naissance',
      RESIDENCE_PERMIT: 'Titre de séjour',
      PROOF_OF_ADDRESS: 'Justificatif de domicile',
      MARRIAGE_CERTIFICATE: 'Acte de mariage',
      DEATH_CERTIFICATE: 'Acte de décès',
      DIVORCE_DECREE: 'Jugement de divorce',
      NATIONALITY_CERTIFICATE: 'Certificat de nationalité',
      OTHER: 'Autre document',
      VISA_PAGES: 'Pages de visa',
      EMPLOYMENT_PROOF: 'Attestation d&apos;emploi',
      NATURALIZATION_DECREE: 'Décret de naturalisation',
      IDENTITY_PHOTO: 'Photo d&apos;identité',
      CONSULAR_CARD: 'Carte consulaire',
    };

    return labels[type] || type;
  };

  const requiredDocuments = request.service.requiredDocuments.map((type) => {
    const document = request.requiredDocuments.find((doc) => doc.type === type);
    return {
      type,
      label: getDocumentLabel(type),
      document,
      required: true,
    };
  });

  const optionalDocuments = request.service.optionalDocuments.map((type) => {
    const document = request.requiredDocuments.find((doc) => doc.type === type);
    return {
      type,
      label: getDocumentLabel(type),
      document,
      required: false,
    };
  });

  const allDocuments = [...requiredDocuments, ...optionalDocuments];

  const getStatusLabel = (status: string): string => {
    const statuses: Record<string, string> = {
      PENDING: 'En attente',
      VALIDATED: 'Validé',
      REJECTED: 'Rejeté',
      EXPIRED: 'Expiré',
      EXPIRING: 'Bientôt expiré',
    };

    return statuses[status] || status;
  };

  return (
    <CardContainer title="Documents" contentClass="grid sm:grid-cols-2 gap-4 sm:gap-6">
      {allDocuments.length > 0 ? (
        allDocuments.map(({ type, label, document, required }) => (
          <div
            key={type}
            className="flex flex-col justify-between pb-4 border-b gap-4 last:border-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{label}</p>
                {required && <Badge variant="outline">Obligatoire</Badge>}
                {document?.status && (
                  <Badge
                    variant={
                      document.status.toLowerCase() as
                        | 'default'
                        | 'destructive'
                        | 'outline'
                        | 'secondary'
                        | 'success'
                    }
                  >
                    {getStatusLabel(document.status)}
                  </Badge>
                )}
              </div>
              {document && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {document.issuedAt && (
                    <p>Date d&apos;émission: {formatDate(document.issuedAt, 'PPP')}</p>
                  )}
                  {document.expiresAt && (
                    <p>Date d&apos;expiration: {formatDate(document.expiresAt, 'PPP')}</p>
                  )}
                </div>
              )}
              {!document && required && (
                <p className="text-sm text-muted-foreground">Non fourni</p>
              )}
              {!document && !required && (
                <p className="text-sm text-muted-foreground">Non fourni (optionnel)</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {document && (
                <>
                  <DocumentPreview
                    url={document.fileUrl}
                    title={label}
                    type={type as DocumentType}
                    onDownload={() =>
                      handleDownload(
                        document.fileUrl,
                        `${type.toLowerCase()}.${document.fileUrl.split('.').pop()}`,
                      )
                    }
                  />
                  <Tooltip>
                    <TooltipTrigger>
                      {document.status === 'VALIDATED' ? (
                        <CheckCircle2 className="text-success size-5" />
                      ) : (
                        <XCircle className="size-5 text-destructive" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {document.status === 'VALIDATED'
                        ? 'Document validé'
                        : 'Document non validé'}
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground col-span-2">Aucun document requis</p>
      )}
    </CardContainer>
  );
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

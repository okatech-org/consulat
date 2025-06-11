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
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DisplayAddress } from '@/components/ui/display-address';
import { DocumentPreview } from '@/components/ui/document-preview';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DocumentValidationDialog } from '@/components/profile/document-validation-dialog';
import { documentValidations, validateDocument } from '@/lib/document-validation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InfoField } from '@/components/ui/info-field';

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
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(
    null,
  );

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
  request: FullServiceRequest;
};

function AppointmentReview({ request }: AppointmentReviewProps) {
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
            appointment.status === 'VALIDATED'
              ? 'default'
              : appointment.status === 'CANCELLED'
                ? 'destructive'
                : appointment.status === 'PENDING'
                  ? 'secondary'
                  : 'outline'
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
  const t_inputs = useTranslations('inputs');
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(
    null,
  );

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
    <>
      <CardContainer title="Option de livraison" contentClass="space-y-4">
        <div className="flex items-center gap-3">
          {getDeliveryModeIcon(request.chosenDeliveryMode)}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Mode de livraison</p>
            <p className="font-medium">
              {t_inputs(`deliveryMode.options.${request.chosenDeliveryMode}`)}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      request.proxyIdentityDoc &&
                      setPreviewDoc({
                        url: request.proxyIdentityDoc,
                        title: "Pièce d'identité du mandataire",
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
                      })
                    }
                  >
                    <Eye className="size-4" />
                    <span className="text-sm">Voir la procuration</span>
                  </Button>
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
            {t_inputs(`processingMode.options.${request.chosenProcessingMode}`)}
          </p>
        </div>
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

function getStepFieldsValue(
  request: FullServiceRequest,
  stepId: string,
): ReviewStepField[] {
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
  request: FullServiceRequest;
}

export function ServiceRequestDocuments({ request }: ServiceRequestDocumentsProps) {
  const service = request.service;
  const userDocuments = request.submittedBy?.documents || [];
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
      // Get file extension from content type
      const contentType = response.headers.get('content-type');
      const extension = contentType?.split('/')[1] || 'pdf';
      a.download = `${filename}.${extension}`;
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
    url?: string;
    title?: string;
  } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    type: 'pdf' | 'image';
  } | null>(null);

  // Combine required and optional documents
  const allServiceDocuments = [
    ...service.requiredDocuments.map((type) => ({ type, required: true })),
    ...service.optionalDocuments.map((type) => ({ type, required: false })),
  ];

  // Map service documents to user documents
  const documentsToDisplay = allServiceDocuments.map((serviceDoc) => {
    const userDoc = userDocuments.find((doc) => doc.type === serviceDoc.type);
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
        const { type, required, document } = docItem;
        const validation = document
          ? validateDocument(document, true)
          : { isValid: false, errors: [] };

        return (
          <div
            key={type}
            className="flex flex-col justify-between pb-4 border-b gap-4 last:border-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{t_inputs(`userDocument.options.${type}`)}</p>

                {required && (
                  <Badge variant="outline">{t_review('documents.required')}</Badge>
                )}
                {document?.status && (
                  <Badge
                    variant={
                      document.status === 'VALIDATED'
                        ? 'default'
                        : document.status === 'REJECTED'
                          ? 'destructive'
                          : document.status === 'PENDING'
                            ? 'secondary'
                            : 'outline'
                    }
                  >
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
              {!document && (
                <p className="text-sm text-muted-foreground">
                  {required
                    ? t_errors('not_provided') + ' (Requis)'
                    : t_errors('not_provided') + ' (Optionnel)'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {document ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewDoc({
                        url: document.fileUrl,
                        title: t_inputs(`userDocument.options.${type}`),
                        type: document.fileUrl.endsWith('.pdf') ? 'pdf' : 'image',
                      })
                    }
                  >
                    <Eye className="size-4" />
                    <span className="text-sm">Voir</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedDocument({
                        id: document.id,
                        type: type,
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
              ) : required ? (
                <XCircle className="size-5 text-destructive" />
              ) : (
                <Badge variant="outline">Non fourni</Badge>
              )}
            </div>
          </div>
        );
      })}

      {selectedDocument && !selectedDocument.url && (
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
      {previewDoc && (
        <DocumentPreview
          isOpen={!!previewDoc}
          setIsOpenAction={() => setPreviewDoc(null)}
          url={previewDoc.url}
          title={previewDoc.title}
          type={previewDoc.type}
          onDownload={() =>
            handleDownload(previewDoc.url, previewDoc.title || 'document')
          }
        />
      )}
    </CardContainer>
  );
}

export function DocumentReview({ document: localDocument }: { document: UserDocument }) {
  const validation = validateDocument(localDocument, true);

  const t_inputs = useTranslations('inputs');
  const t_review = useTranslations('admin.registrations.review');
  const t = useTranslations('common');
  const t_errors = useTranslations('messages.errors');
  const { formatDate } = useDateLocale();
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const router = useRouter();

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      // Get file extension from content type
      const contentType = response.headers.get('content-type');
      const extension = contentType?.split('/')[1] || 'pdf';
      a.download = `${filename}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div
      key={localDocument.id}
      className="flex flex-col justify-between pb-4 border-b gap-4 last:border-0"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {t_inputs(`userDocument.options.${localDocument.type}`)}
          </p>

          {documentValidations?.[localDocument?.type as DocumentType]?.required && (
            <Badge variant="outline">{t_review('documents.required')}</Badge>
          )}
          {localDocument?.status && (
            <Badge
              variant={
                localDocument.status === 'VALIDATED'
                  ? 'default'
                  : localDocument.status === 'REJECTED'
                    ? 'destructive'
                    : localDocument.status === 'PENDING'
                      ? 'secondary'
                      : 'outline'
              }
            >
              {t(`status.${localDocument.status}`)}
            </Badge>
          )}
        </div>
        {localDocument && (
          <div className="space-y-1 text-sm text-muted-foreground">
            {localDocument.issuedAt && (
              <p>
                {t_review('documents.issued_at')}:{' '}
                {formatDate(localDocument.issuedAt, 'PPP')}
              </p>
            )}
            {localDocument.expiresAt && (
              <p>
                {t_review('documents.expires_at')}:{' '}
                {formatDate(localDocument.expiresAt, 'PPP')}
              </p>
            )}
          </div>
        )}
        {!localDocument && validation.errors.length === 0 && (
          <p className="text-sm text-muted-foreground">{t_errors('not_provided')}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {localDocument && (
          <>
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="size-4" />
              <span className="text-sm">Voir</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
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
      <DocumentValidationDialog
        documentId={localDocument.id}
        documentType={localDocument.type}
        isOpen={open}
        onClose={() => setOpen(false)}
        onValidated={() => {
          setOpen(false);
          router.refresh();
        }}
      />
      {previewOpen && (
        <DocumentPreview
          isOpen={previewOpen}
          setIsOpenAction={setPreviewOpen}
          url={localDocument.fileUrl}
          title={t_inputs(`userDocument.options.${localDocument.type}`)}
          type={localDocument.fileUrl.endsWith('.pdf') ? 'pdf' : 'image'}
          onDownload={() =>
            handleDownload(
              localDocument.fileUrl,
              `${localDocument.type.toLowerCase()}.${localDocument.fileUrl.split('.').pop()}`,
            )
          }
        />
      )}
    </div>
  );
}

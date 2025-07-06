'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getServiceRequestDetails } from '@/actions/services';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Calendar,
  CreditCard,
  EyeIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { FullServiceRequest } from '@/types/service-request';
import { RequestStatus } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { ROUTES } from '@/schemas/routes';
import CardContainer from '@/components/layouts/card-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Timeline } from '@/components/ui/timeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Define icon components
type IconComponent = React.ReactElement;

// Define type for status info
type StatusInfoType = { label: string; color: string; icon: IconComponent };

// Define type for form field value
type FormFieldValue = {
  id?: string;
  type?: string;
  status?: string;
  fileUrl?: string;
  value?: string | number;
};

// Define type for form data
type FormData = { [key: string]: { [key: string]: FormFieldValue } };

// Define types for action data
type ActionData = { notes?: string; status?: string };

type ServiceAction = {
  id: string;
  type: string;
  data: ActionData;
  createdAt: string;
  user: { name: string; image: string | null };
};

type ServiceNote = {
  id: string;
  content: string;
  createdAt: string;
  author?: { name: string | null; image: string | null };
};

// Status config for display
const getStatusInfo = (status: RequestStatus): StatusInfoType => {
  // Define possible status values
  const statusMap: Record<string, StatusInfoType> = {
    DRAFT: {
      label: 'Brouillon',
      color: 'bg-slate-400',
      icon: <FileText className="h-5 w-5" />,
    },
    SUBMITTED: {
      label: 'Soumise',
      color: 'bg-blue-400',
      icon: <FileText className="h-5 w-5" />,
    },
    EDITED: {
      label: 'Modifiée',
      color: 'bg-gray-400',
      icon: <FileText className="h-5 w-5" />,
    },
    PENDING: {
      label: 'En traitement',
      color: 'bg-amber-400',
      icon: <Clock className="h-5 w-5" />,
    },
    PENDING_COMPLETION: {
      label: "En attente d'information",
      color: 'bg-purple-400',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    VALIDATED: {
      label: 'Validée',
      color: 'bg-green-400',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    REJECTED: {
      label: 'Rejetée',
      color: 'bg-red-400',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    CARD_IN_PRODUCTION: {
      label: 'En production',
      color: 'bg-cyan-400',
      icon: <Clock className="h-5 w-5" />,
    },
    READY_FOR_PICKUP: {
      label: 'Prête au retrait',
      color: 'bg-emerald-400',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    APPOINTMENT_SCHEDULED: {
      label: 'RDV programmé',
      color: 'bg-violet-400',
      icon: <Clock className="h-5 w-5" />,
    },
    COMPLETED: {
      label: 'Terminée',
      color: 'bg-green-600',
      icon: <CheckCircle className="h-5 w-5" />,
    },
  };

  // Safely access the status info
  return (
    statusMap[status.toString()] || {
      label: 'Inconnu',
      color: 'bg-gray-400',
      icon: <FileText className="h-5 w-5" />,
    }
  );
};

export default function ServiceRequestDetailsPage() {
  const { id } = useParams() as { id: string };
  const t = useTranslations('services');
  const [requestDetails, setRequestDetails] = useState<FullServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const details = await getServiceRequestDetails(id);
        setRequestDetails(details);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <LoadingSkeleton variant="grid" aspectRatio="4/3" />
      </div>
    );
  }

  if (error || !requestDetails) {
    return (
      <div className="container mx-auto py-6">
        <Link href={ROUTES.user.services}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="size-icon" />
            {t('actions.backToServices')}
          </Button>
        </Link>
        <CardContainer
          title={<span className="text-red-500">Error</span>}
          footerContent={<Button onClick={() => window.location.reload()}>Retry</Button>}
        >
          <p>{error || 'Failed to load request details'}</p>
        </CardContainer>
      </div>
    );
  }

  const {
    service,
    status,
    createdAt,
    assignedTo,
    notes,
    requiredDocuments,
    estimatedCompletionDate,
  } = requestDetails;
  const statusInfo = getStatusInfo(status as RequestStatus);

  const isConsularRegistration = requestDetails?.service.category === 'REGISTRATION';
  const formData: FormData | null = requestDetails?.formData
    ? JSON.parse(requestDetails.formData as string)
    : null;

  // Function to render consular registration details
  const renderConsularRegistrationDetails = () => {
    if (!requestDetails?.requestedFor) return null;
    const person = requestDetails.requestedFor;

    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return '';
      return format(new Date(date), 'dd/MM/yyyy');
    };

    return (
      <div className="space-y-6">
        <CardContainer
          title="Informations personnelles"
          subtitle="Détails de votre inscription consulaire"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={person.identityPicture?.fileUrl}
                  alt={`${person.firstName || ''} ${person.lastName || ''}`}
                />
                <AvatarFallback>
                  {person.firstName?.[0] || ''}
                  {person.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {person.firstName} {person.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{person.email}</p>
                <p className="text-sm text-muted-foreground">{person.phoneNumber}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Date de naissance:</span>{' '}
                {formatDate(person.birthDate)}
              </p>
              <p>
                <span className="font-medium">Lieu de naissance:</span>{' '}
                {person.birthPlace}, {person.birthCountry}
              </p>
              <p>
                <span className="font-medium">Nationalité:</span> {person.nationality}
              </p>
              <p>
                <span className="font-medium">Profession:</span> {person.profession}
              </p>
            </div>
          </div>
        </CardContainer>

        {person.cardNumber && (
          <CardContainer
            title="Carte consulaire"
            subtitle="Détails de votre carte consulaire"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">{person.cardNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Valide du {formatDate(person.cardIssuedAt)} au{' '}
                    {formatDate(person.cardExpiresAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContainer>
        )}
      </div>
    );
  };

  // Function to render form data
  const renderFormData = () => {
    if (!formData) return null;
    return Object.entries(formData).map(([stepId, data]) => {
      const step = requestDetails?.service.steps.find((s) => s.id === stepId);
      if (!step) return null;

      return (
        <CardContainer key={stepId} title={step.title} subtitle={step.description}>
          <div className="space-y-4">
            {Object.entries(data).map(([fieldName, fieldValue]) => {
              const value =
                typeof fieldValue === 'object'
                  ? fieldValue
                  : { value: String(fieldValue) };
              return (
                <div key={fieldName} className="flex items-start gap-2">
                  {value.fileUrl ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <a
                        href={value.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {value.type}
                      </a>
                      <Badge
                        variant={value.status === 'VALIDATED' ? 'success' : 'default'}
                      >
                        {value.status}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm">
                      <span className="font-medium">{fieldName}:</span> {value.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContainer>
      );
    });
  };

  // Function to render timeline
  const renderTimeline = () => {
    if (!requestDetails?.actions?.length) return null;

    return (
      <ScrollArea className="h-[400px] pr-4">
        <Timeline>
          {(requestDetails.actions as unknown as ServiceAction[]).map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-2 mb-4 pb-4 border-b last:border-b-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={action.user.image || undefined}
                  alt={action.user.name}
                />
                <AvatarFallback>{action.user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{action.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(action.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <p className="mt-1 text-sm">{action.type}</p>
                {action.data?.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {action.data.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </Timeline>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-4">
      <Link href={ROUTES.user.services}>
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-1 size-icon" />
          {t('actions.backToServices')}
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{service.name}</h1>
          <p className="text-muted-foreground">
            {t('request.submittedOn')} {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge
          className={`${statusInfo.color} py-2 px-3 text-white flex items-center gap-2`}
        >
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
      </div>

      <Separator />

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="timeline">Historique</TabsTrigger>
          {notes.length > 0 && <TabsTrigger value="notes">Notes</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {isConsularRegistration
            ? renderConsularRegistrationDetails()
            : renderFormData()}

          <CardContainer title="Informations de traitement">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedTo && (
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={assignedTo.image || ''}
                      alt={assignedTo.name || ''}
                    />
                    <AvatarFallback>{assignedTo.name?.[0] || ''}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">Agent assigné</p>
                  </div>
                </div>
              )}
              {estimatedCompletionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(estimatedCompletionDate), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date estimée de complétion
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContainer>
        </TabsContent>

        <TabsContent value="timeline">{renderTimeline()}</TabsContent>

        <TabsContent value="notes">
          <CardContainer title="Notes">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {(notes as unknown as ServiceNote[]).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-2 p-4 bg-muted rounded-lg"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={note.author?.image || undefined}
                        alt={note.author?.name || undefined}
                      />
                      <AvatarFallback>{note.author?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{note.author?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <p className="mt-1">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContainer>
        </TabsContent>
      </Tabs>

      {/* Actions section */}
      <CardContainer title="Actions" className="mt-6">
        <div className="flex flex-wrap gap-4">
          {status === 'PENDING_COMPLETION' && (
            <Button variant="default">
              <FileText className="size-icon" />
              Fournir les informations
            </Button>
          )}

          {status === 'READY_FOR_PICKUP' && (
            <Button variant="default" asChild>
              <Link
                href={`${ROUTES.user.new_appointment}?serviceRequestId=${requestDetails.id}&type=DOCUMENT_COLLECTION`}
              >
                <Calendar className="size-icon" />
                Programmer le retrait
              </Link>
            </Button>
          )}

          {requiredDocuments.length > 0 && (
            <Button variant="outline">
              <FileText className="size-icon" />
              Voir les documents
            </Button>
          )}

          {isConsularRegistration && status === 'READY_FOR_PICKUP' && (
            <Button variant="outline" asChild>
              <Link href={ROUTES.user.profile}>
                <EyeIcon className="size-icon" />
                Voir mon profil
              </Link>
            </Button>
          )}
        </div>
      </CardContainer>
    </div>
  );
}

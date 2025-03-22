'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getServiceRequestDetails } from '@/actions/services';
import { ArrowLeft, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FullServiceRequest } from '@/types/service-request';
import { RequestStatus } from '@prisma/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ROUTES } from '@/schemas/routes';

// Define icon components
type IconComponent = JSX.Element;

// Define type for status info
type StatusInfoType = {
  label: string;
  color: string;
  icon: IconComponent;
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
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !requestDetails) {
    return (
      <div className="container mx-auto py-6">
        <Link href={ROUTES.user.services}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.backToServices')}
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Failed to load request details'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { service, status, createdAt, updatedAt, assignedTo, notes, requiredDocuments } =
    requestDetails;
  const statusInfo = getStatusInfo(status as RequestStatus);
  const formattedLastUpdate = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: fr })
    : '';

  // Check if status matches PENDING_COMPLETION (safely)
  const isPendingCompletion = status === 'PENDING_COMPLETION';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Link href={ROUTES.user.services}>
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('request.status')}</CardTitle>
            <CardDescription>
              {t('request.lastUpdated')}: {formattedLastUpdate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignedTo && (
                <p className="text-sm">
                  <span className="font-medium">{t('request.assignedTo')}:</span>{' '}
                  {assignedTo.name}
                </p>
              )}
              {requestDetails.lastActionAt && (
                <p className="text-sm">
                  <span className="font-medium">{t('request.lastAction')}:</span>{' '}
                  {formatDistanceToNow(new Date(requestDetails.lastActionAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('request.documents')}</CardTitle>
            <CardDescription>
              {requiredDocuments.length} {t('request.documentsProvided')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requiredDocuments.length > 0 ? (
              <ul className="space-y-2">
                {requiredDocuments.slice(0, 3).map((doc) => (
                  <li key={doc.id} className="text-sm flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {doc.type} - {doc.status}
                  </li>
                ))}
                {requiredDocuments.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    +{requiredDocuments.length - 3} {t('request.moreDocuments')}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t('request.noDocuments')}</p>
            )}
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('request.notes')}</CardTitle>
            <CardDescription>
              {notes.length} {t('request.notesCount')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notes.length > 0 ? (
              <ul className="space-y-2">
                {notes.slice(0, 2).map((note) => (
                  <li key={note.id} className="text-sm">
                    <p className="line-clamp-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {note.author?.name} -{' '}
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
                {notes.length > 2 && (
                  <li className="text-sm text-muted-foreground">
                    +{notes.length - 2} {t('request.moreNotes')}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t('request.noNotes')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('request.actions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              {t('request.viewDocuments')}
            </Button>
            {isPendingCompletion && (
              <Button variant="default">
                <FileText className="mr-2 h-4 w-4" />
                {t('request.provideInformation')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

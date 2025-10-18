'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { format } from 'date-fns';
import { ROUTES } from '@/schemas/routes';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Status config for display
const getStatusInfo = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; color: string; icon: React.ReactElement; progress: number }
  > = {
    draft: {
      label: 'Brouillon',
      color: 'bg-slate-400',
      icon: <FileText className="h-5 w-5" />,
      progress: 0,
    },
    submitted: {
      label: 'Envoyé',
      color: 'bg-blue-400',
      icon: <FileText className="h-5 w-5" />,
      progress: 20,
    },
    under_review: {
      label: 'En cours de révision',
      color: 'bg-amber-400',
      icon: <Clock className="h-5 w-5" />,
      progress: 40,
    },
    validated: {
      label: 'Validée',
      color: 'bg-green-400',
      icon: <CheckCircle className="h-5 w-5" />,
      progress: 80,
    },
    rejected: {
      label: 'Rejetée',
      color: 'bg-red-400',
      icon: <AlertTriangle className="h-5 w-5" />,
      progress: 0,
    },
    in_production: {
      label: 'En production',
      color: 'bg-cyan-400',
      icon: <Clock className="h-5 w-5" />,
      progress: 90,
    },
    ready_for_pickup: {
      label: 'Prête au retrait',
      color: 'bg-emerald-400',
      icon: <CheckCircle className="h-5 w-5" />,
      progress: 95,
    },
    appointment_scheduled: {
      label: 'RDV programmé',
      color: 'bg-violet-400',
      icon: <Calendar className="h-5 w-5" />,
      progress: 85,
    },
    completed: {
      label: 'Terminée',
      color: 'bg-green-600',
      icon: <CheckCircle className="h-5 w-5" />,
      progress: 100,
    },
  };

  return (
    statusMap[status.toString()] || {
      label: 'Inconnu',
      color: 'bg-gray-400',
      icon: <FileText className="h-5 w-5" />,
      progress: 0,
    }
  );
};

export default function ServiceRequestDetailsPage() {
  const { id } = useParams() as { id: string };
  const t = useTranslations('requests.details');

  const request = useQuery(api.functions.request.getRequest, {
    requestId: id as Id<'requests'>,
  });
  const service = useQuery(
    api.functions.service.getService,
    request?.serviceId ? { serviceId: request.serviceId } : 'skip',
  );

  if (request === undefined || (request?.serviceId && service === undefined)) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <LoadingSkeleton variant="grid" aspectRatio="4/3" />
      </div>
    );
  }

  if (!request || !service) {
    return (
      <div className="container mx-auto py-6">
        <Link href={ROUTES.user.services}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
        </Link>
        <CardContainer title={t('error_title')} className="text-center">
          <p className="text-destructive mb-4">{t('error_loading')}</p>
          <Button onClick={() => window.location.reload()}>{t('retry')}</Button>
        </CardContainer>
      </div>
    );
  }

  const statusInfo = getStatusInfo(request.status);

  return (
    <PageContainer
      title={service.name}
      description={t('subtitle')}
      action={
        <Link href={ROUTES.user.services}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
        </Link>
      }
    >
      <CardContainer className="bg-muted/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="font-semibold">{t('progress.title')}</h3>
          <Badge
            className={`${statusInfo.color} py-1 px-3 text-white flex items-center gap-2`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
        <div className="mb-4">
          <Progress value={statusInfo.progress} className="h-2" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground flex-wrap gap-2">
          <div
            className={`text-center min-w-[80px] ${statusInfo.progress >= 20 ? 'text-green-600 font-medium' : ''}`}
          >
            {statusInfo.progress >= 20 ? '✓ ' : ''}
            {t('progress.steps.submitted')}
          </div>
          <div
            className={`text-center min-w-[80px] ${statusInfo.progress >= 40 ? 'text-green-600 font-medium' : ''}`}
          >
            {statusInfo.progress >= 40 ? '✓ ' : ''}
            {t('progress.steps.verified')}
          </div>
          <div
            className={`text-center min-w-[80px] ${statusInfo.progress >= 60 ? 'text-primary font-semibold' : ''}`}
          >
            {statusInfo.progress >= 60 ? '• ' : ''}
            {t('progress.steps.processing')}
          </div>
          <div
            className={`text-center min-w-[80px] ${statusInfo.progress >= 80 ? 'text-green-600 font-medium' : ''}`}
          >
            {statusInfo.progress >= 80 ? '✓ ' : ''}
            {t('progress.steps.validation')}
          </div>
          <div
            className={`text-center min-w-[80px] ${statusInfo.progress >= 100 ? 'text-green-600 font-medium' : ''}`}
          >
            {statusInfo.progress >= 100 ? '✓ ' : ''}
            {t('progress.steps.completed')}
          </div>
        </div>
      </CardContainer>
      <CardContainer>
        <div className="space-y-6">
          {/* Information Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('info.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-start p-3 bg-muted/50 rounded">
                <span className="font-medium">{t('info.request_number')}</span>
                <span className="text-muted-foreground">{request.number}</span>
              </div>
              <div className="flex justify-between items-start p-3 bg-muted/50 rounded">
                <span className="font-medium">{t('info.submission_date')}</span>
                <span className="text-muted-foreground">
                  {format(new Date(request._creationTime), 'dd/MM/yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-start p-3 bg-muted/50 rounded">
                <span className="font-medium">{t('info.last_update')}</span>
                <span className="text-muted-foreground">
                  {t('info.days_ago', {
                    count: Math.floor(
                      (new Date().getTime() - request._creationTime) /
                        (1000 * 60 * 60 * 24),
                    ),
                  })}
                </span>
              </div>
              <div className="flex justify-between items-start p-3 bg-muted/50 rounded">
                <span className="font-medium">{t('info.estimated_deadline')}</span>
                <span className="text-muted-foreground">{'N/A'}</span>
              </div>
              <div className="flex justify-between items-start p-3 bg-muted/50 rounded">
                <span className="font-medium">{t('info.fees')}</span>
                <span className="text-muted-foreground">
                  {service.isFree
                    ? t('info.free')
                    : `${service.price} ${service.currency}`}
                </span>
              </div>
            </div>
          </div>

          {/* Documents Section 
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('documents.title')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{t('documents.passport')}</div>
                    <div className="text-sm text-green-600">
                      {t('documents.verified')} ✓
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {t('documents.view')}
                </Button>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{t('documents.address_proof')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('documents.under_review')}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {t('documents.view')}
                </Button>
              </div>
            </div>
          </div>
          
          */}

          {/* Actions */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('actions.title')}</h3>
            <div className="flex flex-wrap gap-4">
              <Link href={ROUTES.user.contact}>
                <Button leftIcon={<MessageCircle className="size-icon" />}>
                  {t('actions.contact_consulate')}
                </Button>
              </Link>
              <Button
                variant="outline"
                disabled
                leftIcon={<FileText className="size-icon" />}
              >
                {t('actions.add_document')}
              </Button>
            </div>
          </div>
        </div>
      </CardContainer>
    </PageContainer>
  );
}

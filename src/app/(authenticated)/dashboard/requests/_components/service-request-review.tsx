'use client';

import { FullServiceRequest } from '@/types/service-request';
import { CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDateLocale } from '@/lib/utils';
import { DocumentsList } from '@/components/documents-list';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  CalendarClock,
} from 'lucide-react';
import { UserProfile } from '@/components/profile/user-profile';
import CardContainer from '@/components/layouts/card-container';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { RequestStatus, ServicePriority, User as DbUser } from '@prisma/client';
import { toast } from '@/hooks/use-toast';
import {
  assignServiceRequest,
  updateServiceRequest,
  updateServiceRequestStatus,
} from '@/actions/service-requests';
import { MultiSelect } from '@/components/ui/multi-select';
import { hasAnyRole } from '@/lib/permissions/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { FullProfile } from '@/types/profile';
interface ServiceRequestReviewProps {
  request: FullServiceRequest & { profile: FullProfile | null };
  agents: DbUser[];
}

export function ServiceRequestReview({
  request,
  agents = [],
}: ServiceRequestReviewProps) {
  const user = useCurrentUser();
  const { formatDate } = useDateLocale();
  const t = useTranslations('requests');
  const t_common = useTranslations('common');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateServiceRequestStatus(
        request.id,
        newStatus,
        notes || undefined,
      );

      if (result.error) {
        toast({
          title: t('update.error.title'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('update.success.title'),
        description: t('update.success.description'),
      });
    } catch (error) {
      toast({
        title: t('update.error.title'),
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec les informations principales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>{t('service_request.title')}</CardTitle>
          <Badge variant="secondary">
            {t_common(`status.${request.status.toLowerCase()}`)}
          </Badge>
          <Badge variant={request.priority === 'URGENT' ? 'destructive' : 'outline'}>
            {t_common(`priority.${request.priority.toLowerCase()}`)}
          </Badge>
        </div>
        <div className="flex gap-2">
          {request.status === 'SUBMITTED' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('REVIEW')}
                disabled={isUpdating}
              >
                <Clock className="mr-2 size-4" />
                {t('actions.start_processing')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={isUpdating}
              >
                <XCircle className="mr-2 size-4" />
                {t('actions.reject')}
              </Button>
            </>
          )}
          {request.status === 'REVIEW' && (
            <Button
              variant="default"
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="mr-2 size-4" />
              {t('actions.complete')}
            </Button>
          )}
        </div>
      </div>

      {/* Informations de base */}
      <CardContainer>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Service Info */}
            <div>
              <h3 className="font-medium">{t('service_request.service_info')}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>{request.service.name}</p>
                <p className="text-muted-foreground">{request.service.description}</p>
              </div>
            </div>

            {/* Submission Info */}
            <div>
              <h3 className="font-medium">{t('service_request.submission_info')}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    {t('service_request.submitted_on', {
                      date: formatDate(request.submittedAt ?? ''),
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>
                    {t('service_request.processing_mode')}:{' '}
                    {t(`processing_mode.${request.chosenProcessingMode.toLowerCase()}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-muted-foreground" />
                  <span>
                    {t('service_request.delivery_mode')}:{' '}
                    {t(`delivery_mode.${request.chosenDeliveryMode.toLowerCase()}`)}
                  </span>
                </div>
                {request.deadline && (
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-muted-foreground" />
                    <span>
                      {t('service_request.deadline')}: {formatDate(request.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions de gestion */}
          <div className="flex flex-wrap gap-2">
            {/* Voir le profil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="size-4" />
                  {t('service_request.view_profile')}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-4xl">
                <SheetHeader>
                  <SheetTitle>{t('service_request.applicant_profile')}</SheetTitle>
                </SheetHeader>

                {request.profile && (
                  <div className="mt-6">
                    <UserProfile profile={request.profile} />
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Autres actions */}
            {request.status === 'REVIEW' && (
              <>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="size-4" />
                  {t('actions.send_message')}
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="size-4" />
                  {t('actions.request_documents')}
                </Button>
                <Button variant="outline" className="gap-2">
                  <AlertTriangle className="size-4" />
                  {t('actions.report_issue')}
                </Button>
              </>
            )}
          </div>

          {/* Notes administratives */}
          <div className="space-y-2">
            <h3 className="font-medium">{t('service_request.admin_notes')}</h3>
            <Textarea
              placeholder={t('service_request.notes_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />
          </div>

          {/* Priorité */}
          <div className="space-y-2">
            <h3 className="font-medium">{t('service_request.priority')}</h3>
            <MultiSelect
              type="single"
              options={[
                { value: 'STANDARD', label: t_common('priority.standard') },
                { value: 'URGENT', label: t_common('priority.urgent') },
              ]}
              selected={[request.priority]}
              onChange={async (values) => {
                if (values[0]) {
                  await updateServiceRequest({
                    id: request.id,
                    priority: values[0] as ServicePriority,
                  });
                }
              }}
              placeholder={t('service_request.select_priority')}
            />
          </div>

          {/* Assign to (ADMIN, MANAGER, SUPER_ADMIN) */}
          {user && hasAnyRole(user, ['ADMIN', 'MANAGER', 'SUPER_ADMIN']) && (
            <div className="space-y-2">
              <h3 className="font-medium">{t('service_request.assign_to')}</h3>
              <MultiSelect
                type="single"
                options={agents.map((agent) => ({
                  value: agent.id,
                  label: `${agent.firstName} ${agent.lastName}`,
                }))}
                selected={request.assignedToId ? [request.assignedToId] : []}
                onChange={async (values) => {
                  if (values[0]) {
                    await assignServiceRequest(request.id, values[0]);
                  }
                }}
                placeholder={t('service_request.select_agent')}
              />
            </div>
          )}

          {/* Assign to (AGENT) */}
        </div>
      </CardContainer>

      {/* Documents fournis */}
      <CardContainer title={t('service_request.documents')}>
        <DocumentsList documents={request.documents} />
      </CardContainer>

      {/* Données du formulaire si présentes */}
      {request.formData && (
        <CardContainer title={t('service_request.form_data')}>
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
            {JSON.stringify(request.formData, null, 2)}
          </pre>
        </CardContainer>
      )}
    </div>
  );
}

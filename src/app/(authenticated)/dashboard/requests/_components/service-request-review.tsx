'use client';

import { FullServiceRequest } from '@/types/service-request';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tryCatch, useDateLocale } from '@/lib/utils';
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
import { hasAnyRole, RoleGuard } from '@/lib/permissions/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { FullProfile } from '@/types/profile';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusTimeline } from '@/components/consular/status-timeline';
import { Label } from '@/components/ui/label';
import { ReviewNotes } from '../../(admin)/_utils/components/requests/review-notes';
import useServiceReview from '@/hooks/use-service-review';

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
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(request.status);

  // Use the service review hook for handling tabs
  const { currentTab, setCurrentTab, tabs } = useServiceReview({
    request,
    profile: request.profile as FullProfile,
  });

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    setIsUpdating(true);
    try {
      const result = await tryCatch(
        updateServiceRequestStatus(request.id, newStatus, notes || undefined),
      );

      if (result.error) {
        toast({
          title: 'Erreur lors de la mise à jour',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Mise à jour réussie',
          description: 'La demande a été mise à jour avec succès',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur lors de la mise à jour',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actions */}
      <CardContainer>
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-1">
            <h2 className="text-xl md:text-2xl flex items-center gap-2 font-semibold">
              {request.service.name}{' '}
              <Badge variant="secondary">{t_common(`status.${request.status}`)}</Badge>
              <Badge variant={request.priority === 'URGENT' ? 'destructive' : 'outline'}>
                {t_common(`priority.${request.priority}`)}
              </Badge>
            </h2>
            {request.submittedBy && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <User className="size-4" />
                {request.submittedBy.name}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Soumis le {formatDate(request.submittedAt ?? '')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {request.status === 'SUBMITTED' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('PENDING')}
                  disabled={isUpdating}
                >
                  <Clock className="mr-2 size-4" />
                  Commencer le traitement
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-2 size-4" />
                  Rejeter
                </Button>
              </>
            )}
            {request.status === 'PENDING' && (
              <Button
                variant="default"
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={isUpdating}
              >
                <CheckCircle2 className="mr-2 size-4" />
                Terminer
              </Button>
            )}
          </div>
        </div>
      </CardContainer>

      {/* Timeline du statut */}
      <CardContainer>
        {request.profile ? (
          <StatusTimeline
            currentStatus={request.status}
            request={request}
            profile={request.profile}
          />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Aucun profil associé à cette demande
          </div>
        )}
      </CardContainer>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Basic info card that's always shown */}
          <CardContainer>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Service Info */}
              <div>
                <h3 className="font-medium">Informations sur le service</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>{request.service.name}</p>
                  <p className="text-muted-foreground">{request.service.description}</p>
                </div>
              </div>

              {/* Submission Info */}
              <div>
                <h3 className="font-medium">Informations de soumission</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>Soumis le {formatDate(request?.submittedAt ?? '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span>
                      Mode de traitement:{' '}
                      {t(`processing_mode.${request.chosenProcessingMode}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-muted-foreground" />
                    <span>
                      Mode de livraison:{' '}
                      {t(`delivery_mode.${request.chosenDeliveryMode}`)}
                    </span>
                  </div>
                  {request.deadline && (
                    <div className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-muted-foreground" />
                      <span>Date limite: {formatDate(request.deadline)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContainer>

          {/* Service review tabs */}
          {tabs.length > 0 && (
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
              <TabsList className="w-full">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Panneau latéral pour les actions et validations */}
        <div className="space-y-4 col-span-1">
          {/* Voir le profil */}
          <CardContainer title="Demandeur">
            <div className="space-y-4">
              {request.profile && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Sheet>
                    <SheetTrigger className="w-full">
                      <User className="size-4" />
                      Voir le profil
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-4xl">
                      <SheetHeader>
                        <SheetTitle>Profil du demandeur</SheetTitle>
                      </SheetHeader>

                      <div className="mt-6">
                        <UserProfile profile={request.profile} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </Button>
              )}

              {/* Autres actions */}
              {request.status === 'PENDING' && (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full gap-2">
                    <MessageSquare className="size-4" />
                    Envoyer un message
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="size-4" />
                    Demander des documents
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <AlertTriangle className="size-4" />
                    Signaler un problème
                  </Button>
                </div>
              )}
            </div>
          </CardContainer>

          {/* Paramètres de la demande */}
          <CardContainer title="Paramètres" contentClass="space-y-4">
            {/* Priorité */}
            <div className="space-y-2">
              <Label>Priorité</Label>
              <MultiSelect<ServicePriority>
                type="single"
                options={[
                  { value: 'STANDARD', label: t_common('priority.STANDARD') },
                  { value: 'URGENT', label: t_common('priority.URGENT') },
                ]}
                selected={request.priority}
                onChange={async (value) => {
                  if (value) {
                    await updateServiceRequest({
                      id: request.id,
                      priority: value,
                    });
                  }
                }}
                placeholder="Sélectionner une priorité"
              />
            </div>

            {/* Assign to (ADMIN, MANAGER, SUPER_ADMIN) */}
            <RoleGuard roles={['ADMIN', 'MANAGER', 'SUPER_ADMIN']}>
              <div className="space-y-2">
                <Label>Assigner à</Label>
                <MultiSelect<string>
                  type="single"
                  options={agents.map((agent) => ({
                    value: agent.id,
                    label: `${agent.name}`,
                  }))}
                  selected={request.assignedToId ?? undefined}
                  onChange={async (value) => {
                    if (value) {
                      await assignServiceRequest(request.id, value);
                    }
                  }}
                  placeholder="Sélectionner un agent"
                />
              </div>
            </RoleGuard>

            {/* Request status */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <MultiSelect<RequestStatus>
                type="single"
                options={[
                  { value: 'SUBMITTED', label: t_common('status.SUBMITTED') },
                  { value: 'PENDING', label: t_common('status.PENDING') },
                  {
                    value: 'PENDING_COMPLETION',
                    label: t_common('status.PENDING_COMPLETION'),
                  },
                  {
                    value: 'APPOINTMENT_SCHEDULED',
                    label: t_common('status.APPOINTMENT_SCHEDULED'),
                  },
                  {
                    value: 'READY_FOR_PICKUP',
                    label: t_common('status.READY_FOR_PICKUP'),
                  },
                  { value: 'VALIDATED', label: t_common('status.VALIDATED') },
                  { value: 'REJECTED', label: t_common('status.REJECTED') },
                  { value: 'COMPLETED', label: t_common('status.COMPLETED') },
                ]}
                selected={selectedStatus}
                onChange={(value) => {
                  if (value) {
                    setSelectedStatus(value as RequestStatus);
                  }
                }}
                placeholder="Sélectionner un statut"
                disabled={
                  request.status === 'COMPLETED' &&
                  user &&
                  // @ts-expect-error - The user type from useCurrentUser is compatible
                  !hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN'])
                }
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Ajouter des notes concernant cette demande..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-24"
              />
            </div>

            {/* Update button */}
            <Button
              className="w-full"
              disabled={isUpdating || selectedStatus === request.status}
              onClick={async () => {
                await handleStatusUpdate(selectedStatus);
              }}
            >
              Mettre à jour le statut
            </Button>
          </CardContainer>

          {/* Notes historiques */}
          <ReviewNotes requestId={request.id} notes={request.notes} />
        </div>
      </div>
    </div>
  );
}

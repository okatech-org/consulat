'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-role-data';
import { hasRole, hasAnyRole } from '@/lib/permissions/utils';
import { UserRole, RequestStatus, ServicePriority, type User } from '@prisma/client';
import { useDateLocale, getOrganizationIdFromUser } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, XCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import type { FullServiceRequest } from '@/types/service-request';
import type { FullProfile } from '@/types/profile';
import {
  updateServiceRequestStatus,
  updateServiceRequest,
  assignServiceRequest,
} from '@/actions/service-requests';
import { MultiSelect } from '@/components/ui/multi-select';
import { RoleGuard } from '@/lib/permissions/utils';
import { tryCatch } from '@/lib/utils';
import { toast } from 'sonner';
import CardContainer from '@/components/layouts/card-container';
import { StatusTimeline } from '@/components/consular/status-timeline';
import { ReviewNotes } from '@/components/requests/review-notes';
import useServiceReview from '@/hooks/use-service-review';
import { AircallCallButton } from '@/components/requests/aircall-call-button';
import { useOrganization } from '@/hooks/use-organizations';

interface ServiceRequestReviewProps {
  request: FullServiceRequest & { profile: FullProfile | null };
  agents: User[];
}

export function ServiceRequestReview({
  request,
  agents = [],
}: ServiceRequestReviewProps) {
  const { user } = useCurrentUser();
  const cantUpdateRequest =
    hasRole(user, UserRole.AGENT) && request.assignedToId !== user?.id;
  const { formatDate } = useDateLocale();
  const t_common = useTranslations('common');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(request.status);
  const { currentTab, tabs, setCurrentTab } = useServiceReview(request);

  // Récupérer l'organisation de l'utilisateur connecté
  const userOrganizationId = getOrganizationIdFromUser(user);
  const { organization } = useOrganization(userOrganizationId || '');

  // Récupérer la configuration Aircall de l'organisation
  const firstCountry = organization?.countries?.[0];
  const aircallConfig =
    firstCountry?.code && organization?.metadata
      ? (organization.metadata as Record<string, any>)?.[firstCountry.code]?.settings
          ?.aircall
      : undefined;

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

  // Récupérer le numéro de téléphone de l'utilisateur
  const phoneNumber = request.submittedBy?.phoneNumber || request.profile?.phoneNumber;
  const userDisplayName =
    request.submittedBy?.name ||
    `${request.profile?.firstName} ${request.profile?.lastName}`.trim();

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
                <UserIcon className="size-4" />
                {request.submittedBy.name}
                {phoneNumber && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {phoneNumber}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Soumis le {formatDate(request.submittedAt ?? '')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Bouton d'appel Aircall */}
            {phoneNumber && (
              <AircallCallButton
                phoneNumber={phoneNumber}
                userDisplayName={userDisplayName}
                requestId={request.id}
                config={{
                  enabled: true,
                  workspaceSize: 'big',
                  events: {
                    onLogin: true,
                    onLogout: true,
                    onCallStart: true,
                    onCallEnd: true,
                    onCallAnswer: true,
                  },
                  permissions: {
                    canMakeOutboundCalls: true,
                    canReceiveInboundCalls: true,
                    canTransferCalls: true,
                    canRecordCalls: false,
                  },
                }}
                disabled={true}
              />
            )}

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
      <CardContainer contentClass="!p-3">
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
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="col-span-2">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>

        <div className="space-y-6">
          {/* Notes historiques */}
          <ReviewNotes
            requestId={request.id}
            notes={request.notes}
            canUpdate={!cantUpdateRequest}
          />
          {/* Paramètres de la demande */}
          <CardContainer title="Paramètres" contentClass="space-y-2">
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
              <Label>Statut de la demande</Label>
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
                    value: 'DOCUMENT_IN_PRODUCTION',
                    label: t_common('status.DOCUMENT_IN_PRODUCTION'),
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
                  !hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
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
              disabled={
                isUpdating || selectedStatus === request.status || cantUpdateRequest
              }
              onClick={async () => {
                await handleStatusUpdate(selectedStatus);
              }}
            >
              Mettre à jour le statut
            </Button>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}

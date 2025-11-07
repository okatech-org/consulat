'use client';

import { Suspense, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { hasRole, hasAnyRole } from '@/lib/permissions/utils';
import { UserRole, RequestStatus, RequestPriority } from '@/convex/lib/constants';
import { useDateLocale } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, XCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';
import CardContainer from '@/components/layouts/card-container';
import { AircallCallButton } from '@/components/requests/aircall-call-button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NotFoundComponent } from '@/components/ui/not-found';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface ServiceRequestReviewProps {
  request: Doc<'requests'>;
}

export function ServiceRequestReviewBase({ request }: ServiceRequestReviewProps) {
  const { user } = useCurrentUser();

  if (!request) {
    return (
      <NotFoundComponent description="La demande que vous cherchez n'existe pas ou vous n'avez pas les permissions pour la voir." />
    );
  }

  const cantUpdateRequest =
    hasRole(user, UserRole.Agent) && request.assignedAgentId !== user?.membership?._id;

  const { formatDate } = useDateLocale();
  const t = useTranslations('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(
    request.status as RequestStatus,
  );

  // Fetch organization agents
  const agents = useQuery(
    api.functions.membership.getOrganizationAgents,
    request.organizationId ? { organizationId: request.organizationId } : 'skip',
  );

  const updateRequestStatus = useMutation(api.functions.request.updateRequestStatus);
  const updateRequestMutation = useMutation(api.functions.request.updateRequest);
  const assignRequestMutation = useMutation(api.functions.request.assignRequestToAgent);
  const addNoteMutation = useMutation(api.functions.request.addRequestNote);

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    setIsUpdating(true);
    try {
      await updateRequestStatus({
        requestId: request._id,
        status: newStatus,
      });

      if (notes && user?.membership?._id) {
        await addNoteMutation({
          requestId: request._id,
          note: {
            type: 'internal',
            content: notes,
          },
          addedById: user.membership._id,
        });
      }

      toast.success('La demande a été mise à jour avec succès');
      setNotes('');
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsUpdating(false);
    }
  };

  // Récupérer le numéro de téléphone de l'utilisateur
  const phoneNumber = request.metadata.requester?.phoneNumber;
  const userDisplayName = `${request.metadata.requester?.firstName} ${request.metadata.requester?.lastName}`;

  return (
    <div className="space-y-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        {/* En-tête avec statut et actions */}
        <CardContainer>
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-1">
              <h2 className="text-xl md:text-2xl flex items-center gap-2 font-semibold">
                {request.metadata.service?.name}{' '}
                <Badge variant="secondary">
                  {t(`inputs.requestStatus.options.${request.status}`)}
                </Badge>
                <Badge
                  variant={request.priority === 'urgent' ? 'destructive' : 'outline'}
                >
                  {t(`inputs.priority.options.${request.priority}`)}
                </Badge>
              </h2>
              {request.metadata.requester && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <UserIcon className="size-4" />
                  {request.metadata.requester.firstName}{' '}
                  {request.metadata.requester.lastName}
                  {phoneNumber && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {phoneNumber}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Soumis le{' '}
                  {request.submittedAt
                    ? formatDate(new Date(request.submittedAt), 'PPP')
                    : '-'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Bouton d'appel Aircall */}
              {phoneNumber && (
                <AircallCallButton
                  phoneNumber={phoneNumber}
                  userDisplayName={userDisplayName ?? ''}
                  requestId={request._id}
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

              {request.status === 'submitted' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(RequestStatus.Pending)}
                    disabled={isUpdating}
                  >
                    <Clock className="mr-2 size-4" />
                    Commencer le traitement
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate(RequestStatus.Rejected)}
                    disabled={isUpdating}
                  >
                    <XCircle className="mr-2 size-4" />
                    Rejeter
                  </Button>
                </>
              )}
              {request.status === 'pending' && (
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate(RequestStatus.Completed)}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Terminer
                </Button>
              )}
            </div>
          </div>
        </CardContainer>

        {/* Request Details */}
        <CardContainer title="Détails de la demande" contentClass="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Numéro de demande</p>
              <p className="font-medium">{request.number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pays</p>
              <p className="font-medium">{t(`countries.${request.countryCode}`)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{request.metadata.service?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="font-medium">
                {request.metadata.service?.category &&
                  t(
                    `inputs.serviceCategory.options.${request.metadata.service.category}`,
                  )}
              </p>
            </div>
          </div>
        </CardContainer>
      </div>

      <div className="space-y-4">
        {/* Paramètres de la demande */}
        <CardContainer title="Options de la demande" contentClass="space-y-2">
          {/* Priorité */}
          <div className="space-y-2">
            <Label>{t('inputs.priority.label')}</Label>
            <MultiSelect<string>
              type="single"
              options={[
                {
                  value: RequestPriority.Normal,
                  label: t(`inputs.priority.options.${RequestPriority.Normal}`),
                },
                {
                  value: RequestPriority.Urgent,
                  label: t(`inputs.priority.options.${RequestPriority.Urgent}`),
                },
                {
                  value: RequestPriority.Critical,
                  label: t(`inputs.priority.options.${RequestPriority.Critical}`),
                },
              ]}
              selected={request.priority}
              onChange={async (value) => {
                if (value) {
                  await updateRequestMutation({
                    requestId: request._id,
                    priority: value as RequestPriority,
                  });
                }
              }}
              placeholder="Sélectionner une priorité"
            />
          </div>

          {/* Assign to (ADMIN, MANAGER, SUPER_ADMIN) */}
          {hasAnyRole(user, [UserRole.Admin, UserRole.Manager, UserRole.SuperAdmin]) && (
            <div className="space-y-2">
              <Label>Assigner à</Label>
              <MultiSelect<string>
                type="single"
                options={
                  agents?.map((agent) => ({
                    value: agent._id,
                    label: `${agent.firstName} ${agent.lastName}`,
                  })) || []
                }
                selected={request.assignedAgentId ?? undefined}
                onChange={async (value) => {
                  if (value) {
                    await assignRequestMutation({
                      requestId: request._id,
                      agentId: value as Id<'memberships'>,
                    });
                  }
                }}
                placeholder="Sélectionner un agent"
              />
            </div>
          )}

          {/* Request status */}
          <div className="space-y-2">
            <Label>Statut de la demande</Label>
            <MultiSelect<string>
              type="single"
              options={Object.values(RequestStatus).map((status) => ({
                value: status,
                label: t(`inputs.requestStatus.options.${status}`),
              }))}
              selected={selectedStatus}
              onChange={(value) => {
                if (value) {
                  setSelectedStatus(value as RequestStatus);
                }
              }}
              placeholder="Sélectionner un statut"
              disabled={
                request.status === 'completed' &&
                !hasAnyRole(user, [UserRole.Admin, UserRole.SuperAdmin, UserRole.Manager])
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

        {/* Activity History */}
        <CardContainer title="Historique d'activité" contentClass="space-y-3">
          {request.metadata.activities.length > 0 ? (
            request.metadata.activities
              .slice()
              .reverse()
              .slice(0, 5)
              .map((activity, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <p className="text-sm font-medium">{getActivityLabel(activity.type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date(activity.timestamp), 'PPp')}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucune activité</p>
          )}
        </CardContainer>
      </div>
    </div>
  );
}

// Helper function to get activity label
function getActivityLabel(type: string): string {
  const labels: Record<string, string> = {
    request_created: 'Demande créée',
    request_submitted: 'Demande soumise',
    request_assigned: 'Demande assignée',
    status_changed: 'Statut modifié',
    document_uploaded: 'Document ajouté',
    comment_added: 'Commentaire ajouté',
    request_completed: 'Demande terminée',
  };
  return labels[type] || type;
}

export function ServiceRequestReview({ request }: ServiceRequestReviewProps) {
  return (
    <Suspense fallback={<LoadingSkeleton variant="form" className="w-full" />}>
      <ServiceRequestReviewBase request={request} />
    </Suspense>
  );
}

'use client';

import { useRequest } from '@/hooks/use-requests';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, Calendar, MapPin, ClipboardList } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { useDateLocale } from '@/lib/utils';
import { hasAnyRole } from '@/lib/permissions/utils';
import { Timeline } from '@/components/ui/timeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import CardContainer from '@/components/layouts/card-container';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface RequestDetailPageClientProps {
  requestId: string;
  showReview?: boolean;
}

export default function RequestDetailPageClient({
  requestId,
  showReview = false,
}: RequestDetailPageClientProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const { request, actionHistory, notes, isLoading, error, addNote } =
    useRequest(requestId);

  const t = useTranslations();
  const { formatDate } = useDateLocale();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Erreur lors du chargement de la demande: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !request) {
    return <RequestDetailSkeleton />;
  }

  const isAdmin = user ? hasAnyRole(user, ['ADMIN', 'MANAGER']) : false;

  const getActionButton = () => {
    const isSubmitted = request.status === 'SUBMITTED';
    const label = isSubmitted
      ? t('requests.actions.start_processing')
      : t('requests.actions.continue_processing');

    return (
      <Button asChild>
        <Link href={ROUTES.dashboard.service_request_review(request.id)}>
          <FileText className="size-4" />
          {label}
        </Link>
      </Button>
    );
  };

  // Si c'est en mode review, utiliser le composant existant
  if (showReview) {
    // TODO: Implémenter la vue review avec tRPC
    return (
      <div className="p-6 text-center">
        <p>Mode review - À implémenter avec tRPC</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('requests.view.title')}</h1>
        {getActionButton()}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-full space-y-6 md:col-span-8">
          {/* Informations de la demande */}
          <CardContainer title={t('requests.view.request_info')} contentClass="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={request.status === 'SUBMITTED' ? 'outline' : 'default'}>
                  {t(`common.status.${request.status}`)}
                </Badge>
                <Badge
                  variant={request.priority === 'URGENT' ? 'destructive' : 'outline'}
                >
                  {t(`common.priority.${request.priority}`)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {t('requests.view.submitted_at')}:{' '}
                {formatDate(request.submittedAt || request.createdAt, 'PPP')}
              </div>
              {request.assignedTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  {t('requests.view.assigned_to')}: {request.assignedTo.name}
                </div>
              )}
              {request.lastActionAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {t('requests.view.last_action')}:{' '}
                  {formatDate(request.lastActionAt, 'PPP')}
                </div>
              )}
            </div>
          </CardContainer>

          {/* Informations du demandeur */}
          <CardContainer
            title={t('requests.view.requester_info')}
            contentClass="space-y-2"
          >
            <h3 className="font-medium">{request.submittedBy?.name}</h3>
            <p className="text-sm text-muted-foreground">{request.submittedBy?.email}</p>

            {request.requestedFor && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="size-4" />
                    {t('requests.service_request.view_profile')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-4xl">
                  <SheetHeader>
                    <SheetTitle>
                      {t('requests.service_request.applicant_profile')}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">
                          {request.requestedFor.firstName} {request.requestedFor.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Profil pour la demande #{request.id}
                        </p>
                      </div>
                      {/* TODO: Intégrer UserProfile quand le profile complet sera disponible */}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </CardContainer>
        </div>

        {/* Sidebar avec actions et informations */}
        <CardContainer
          className="col-span-full md:col-span-4"
          contentClass="flex flex-col gap-4"
        >
          {/* Édition rapide pour les admins */}
          {isAdmin && (
            <div className="space-y-4">
              <h4 className="font-medium">
                {t('requests.view.actions.edit_assigned_agent')}
              </h4>
              {request.assignedTo && (
                <p className="text-sm text-muted-foreground">{request.assignedTo.name}</p>
              )}
              {/* TODO: Implémenter RequestQuickEditFormDialog avec tRPC */}
              <Button variant="outline" className="w-full">
                Éditer la demande
              </Button>
              <Separator className="my-4" />
            </div>
          )}

          {/* Informations du service */}
          <div className="space-y-4">
            <CardTitle className="text-xl">{t('requests.view.service_info')}</CardTitle>
            <div>
              <h4 className="font-medium">{request.service?.name}</h4>
              <p className="text-sm text-muted-foreground">
                {request.service?.description}
              </p>
            </div>
            <Badge variant="outline">
              {t(`inputs.serviceCategory.options.${request.serviceCategory}`)}
            </Badge>
            <Separator className="my-4" />
          </div>

          {/* Informations de rendez-vous si disponibles */}
          {request.appointments && request.appointments.length > 0 && (
            <div className="space-y-4">
              <CardTitle className="text-xl">{t('requests.view.appointment')}</CardTitle>
              {request.appointments.map((appointment) => (
                <CardContainer
                  key={appointment.id}
                  className="border-l-4 border-l-primary"
                  contentClass="space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4" />
                    {formatDate(appointment.date, 'PPP')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4" />
                    {t('common.duration.in_minutes', {
                      minutes: appointment.duration,
                    })}
                  </div>
                  {appointment.locationId && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      <span>Lieu: {appointment.locationId}</span>
                    </div>
                  )}
                </CardContainer>
              ))}
              <Separator className="my-4" />
            </div>
          )}

          {/* Historique des actions */}
          <div className="flex-grow">
            <h4 className="font-medium mb-3">{t('requests.view.history')}</h4>
            <ScrollArea className="h-full pr-4">
              <Timeline>
                {actionHistory?.slice(0, 6).map((action) => (
                  <Timeline.Item
                    key={action.id}
                    icon={<ClipboardList className="size-4" />}
                    time={formatDate(action.createdAt, 'Pp')}
                    title={t(`inputs.requestAction.options.${action.type}`)}
                    description={`Par ${action.user?.name || action.user?.email || 'Système'}`}
                  />
                ))}
              </Timeline>
            </ScrollArea>
          </div>

          {/* Section des notes */}
          <div className="space-y-4">
            <h4 className="font-medium">{t('requests.view.notes')}</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notes?.map((note) => (
                <div key={note.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">
                      {note.author?.name || note.author?.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt, 'Pp')}
                    </span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
              {(!notes || notes.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  Aucune note pour le moment
                </p>
              )}
            </div>

            {/* Ajouter une note */}
            <div className="space-y-2">
              <textarea
                placeholder="Ajouter une note..."
                className="w-full p-2 text-sm border rounded-md resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    const content = e.currentTarget.value.trim();
                    if (content) {
                      addNote({
                        requestId: request.id,
                        content,
                        type: 'INTERNAL',
                      });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Ctrl + Entrée pour ajouter</p>
            </div>
          </div>
        </CardContainer>
      </div>
    </div>
  );
}

// Composant de skeleton pour le loading
function RequestDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-full space-y-6 md:col-span-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-full md:col-span-4">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

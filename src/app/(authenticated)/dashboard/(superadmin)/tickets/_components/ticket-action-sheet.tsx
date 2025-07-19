'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, Phone, Star, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface TicketActionSheetProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const actionSchema = z.object({
  response: z.string().optional(),
  notifyUser: z.boolean().default(true),
  channels: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  changeStatus: z.boolean().default(true),
  newStatus: z.enum(['PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
});

type ActionFormValues = z.infer<typeof actionSchema>;

export function TicketActionSheet({
  ticketId,
  open,
  onOpenChange,
  onSuccess,
}: TicketActionSheetProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les détails du ticket
  const { data: tickets } = api.feedback.getAdminList.useQuery(
    { page: 1, limit: 100 },
    { enabled: open && !!ticketId },
  );

  const ticket = tickets?.feedbacks.find((f) => f.id === ticketId);

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      response: '',
      notifyUser: true,
      channels: {
        email: true,
        sms: false,
      },
      changeStatus: true,
      newStatus: 'RESOLVED',
    },
  });

  const respondMutation = api.feedback.respondToFeedback.useMutation({
    onSuccess: () => {
      toast.success(t('feedback.admin.tickets.response.success'));
      form.reset();
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('feedback.admin.tickets.response.error'));
    },
  });

  const updateStatusMutation = api.feedback.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(t('feedback.admin.tickets.statusUpdate.success'));
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('feedback.admin.tickets.statusUpdate.error'));
    },
  });

  const onSubmit = async (data: ActionFormValues) => {
    if (!ticket) return;

    setIsSubmitting(true);
    try {
      const promises = [];

      // Si il y a une réponse, l'envoyer
      if (data.response && data.response.trim()) {
        const channels: ('EMAIL' | 'SMS')[] = [];
        if (data.notifyUser) {
          if (data.channels.email) channels.push('EMAIL');
          if (data.channels.sms) channels.push('SMS');
        }

        promises.push(
          respondMutation.mutateAsync({
            feedbackId: ticket.id,
            response: data.response,
            notifyUser: data.notifyUser,
            channels,
          }),
        );
      }

      // Si on doit changer le statut
      if (data.changeStatus && data.newStatus && data.newStatus !== ticket.status) {
        promises.push(
          updateStatusMutation.mutateAsync({
            feedbackId: ticket.id,
            status: data.newStatus,
          }),
        );
      }

      await Promise.all(promises);

      if (promises.length === 0) {
        toast.error('Aucune action sélectionnée');
        return;
      }

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting ticket action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_REVIEW':
        return 'secondary';
      case 'RESOLVED':
        return 'default';
      case 'CLOSED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const hasEmail = ticket?.user?.email || ticket?.email;
  const hasPhone = ticket?.user?.phoneNumber || ticket?.phoneNumber;

  if (!ticket) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-2xl">
          <div className="text-center py-8">
            <p>Ticket introuvable</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full min-w-2xl overflow-y-auto">
        <SheetHeader className="text-left border-b pb-4 mb-6 sticky top-0 bg-background">
          <SheetTitle>
            Ticket #{ticket.id.slice(-8)} - {ticket.subject}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Informations du ticket */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('feedback.admin.tickets.details.info')}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {t(
                      `feedback.admin.tickets.list.status.${ticket.status.toLowerCase()}`,
                    )}
                  </Badge>
                  <Badge variant="outline">
                    {t(`inputs.feedback.categories.options.${ticket.category}`)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('feedback.admin.tickets.details.createdAt')}
                </label>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(ticket.createdAt), 'PPP', { locale: fr })}</span>
                  <span className="text-muted-foreground">
                    (
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                    )
                  </span>
                </div>
              </div>
            </div>

            {/* Note si présente */}
            {ticket.rating && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Note</label>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{ticket.rating}/5</span>
                </div>
              </div>
            )}

            {/* Utilisateur */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('feedback.admin.tickets.details.createdBy')}
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{ticket.user?.name || 'Utilisateur anonyme'}</span>
                </div>

                {hasEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{ticket.user?.email || ticket.email}</span>
                  </div>
                )}

                {hasPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{ticket.user?.phoneNumber || ticket.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('feedback.admin.tickets.details.message')}
              </label>
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
              </div>
            </div>

            {/* Réponse existante */}
            {ticket.response && ticket.respondedBy && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('feedback.admin.tickets.details.response')}
                </label>
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {t('feedback.admin.tickets.details.respondedBy')}{' '}
                    {ticket.respondedBy.name}
                    {ticket.respondedAt && (
                      <span className="ml-2">
                        le {format(new Date(ticket.respondedAt), 'PPP', { locale: fr })}
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{ticket.response}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Formulaire d'action */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Réponse */}
              <FormField
                control={form.control}
                name="response"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('feedback.admin.tickets.response.form.response')} (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'feedback.admin.tickets.response.form.responsePlaceholder',
                        )}
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options de notification */}
              {form.watch('response') && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notifyUser"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('feedback.admin.tickets.response.form.notifyUser')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('notifyUser') && (
                    <div className="space-y-3 pl-6 border-l-2 border-muted">
                      <label className="text-sm font-medium">
                        {t('feedback.admin.tickets.response.form.channels')}
                      </label>

                      <FormField
                        control={form.control}
                        name="channels.email"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!hasEmail}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel
                                className={!hasEmail ? 'text-muted-foreground' : ''}
                              >
                                {t('feedback.admin.tickets.response.form.email')}
                                {!hasEmail && ' (non disponible)'}
                              </FormLabel>
                              {hasEmail && (
                                <p className="text-xs text-muted-foreground">
                                  {ticket.user?.email || ticket.email}
                                </p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="channels.sms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!hasPhone}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel
                                className={!hasPhone ? 'text-muted-foreground' : ''}
                              >
                                {t('feedback.admin.tickets.response.form.sms')}
                                {!hasPhone && ' (non disponible)'}
                              </FormLabel>
                              {hasPhone && (
                                <p className="text-xs text-muted-foreground">
                                  {ticket.user?.phoneNumber || ticket.phoneNumber}
                                </p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Changement de statut */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="changeStatus"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t('feedback.admin.tickets.statusUpdate.title')}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Décochez si vous souhaitez répondre sans changer le statut du
                          ticket
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('changeStatus') && (
                  <FormField
                    control={form.control}
                    name="newStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('feedback.admin.tickets.statusUpdate.newStatus')}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un nouveau statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">
                              {t('feedback.admin.tickets.list.status.pending')}
                            </SelectItem>
                            <SelectItem value="IN_REVIEW">
                              {t('feedback.admin.tickets.list.status.in_review')}
                            </SelectItem>
                            <SelectItem value="RESOLVED">
                              {t('feedback.admin.tickets.list.status.resolved')}
                            </SelectItem>
                            <SelectItem value="CLOSED">
                              {t('feedback.admin.tickets.list.status.closed')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('feedback.admin.tickets.response.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (!form.watch('response')?.trim() && !form.watch('changeStatus'))
                  }
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

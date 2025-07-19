'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface TicketResponseDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const responseSchema = z.object({
  response: z.string().min(10, {
    message: 'La réponse doit contenir au moins 10 caractères',
  }),
  notifyUser: z.boolean().default(true),
  channels: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

export function TicketResponseDialog({
  ticketId,
  open,
  onOpenChange,
  onSuccess,
}: TicketResponseDialogProps) {
  const t = useTranslations();

  // Récupérer les détails du ticket
  const { data: tickets } = api.feedback.getAdminList.useQuery(
    { page: 1, limit: 100 },
    { enabled: open },
  );

  const ticket = tickets?.feedbacks.find((f) => f.id === ticketId);

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      response: '',
      notifyUser: true,
      channels: {
        email: true,
        sms: false,
      },
    },
  });

  const respondMutation = api.feedback.respondToFeedback.useMutation({
    onSuccess: () => {
      toast({
        variant: 'success',
        title: t('feedback.admin.tickets.response.success'),
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t('feedback.admin.tickets.response.error'),
      });
    },
  });

  const onSubmit = (data: ResponseFormValues) => {
    const channels: ('EMAIL' | 'SMS')[] = [];

    if (data.notifyUser) {
      if (data.channels.email) channels.push('EMAIL');
      if (data.channels.sms) channels.push('SMS');
    }

    respondMutation.mutate({
      feedbackId: ticketId,
      response: data.response,
      notifyUser: data.notifyUser,
      channels,
    });
  };

  const hasEmail = ticket?.user?.email || ticket?.email;
  const hasPhone = ticket?.user?.phoneNumber || ticket?.phoneNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('feedback.admin.tickets.response.title')}</DialogTitle>
          <DialogDescription>
            Répondre au ticket #{ticket?.id.slice(-8)} - {ticket?.subject}
          </DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {t(`inputs.feedback.categories.options.${ticket.category}`)}
              </Badge>
              <Badge variant={ticket.status === 'PENDING' ? 'destructive' : 'secondary'}>
                {t(`feedback.admin.tickets.list.status.${ticket.status.toLowerCase()}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{ticket.message}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('feedback.admin.tickets.response.form.response')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'feedback.admin.tickets.response.form.responsePlaceholder',
                      )}
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyUser"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                        <FormLabel className={!hasEmail ? 'text-muted-foreground' : ''}>
                          {t('feedback.admin.tickets.response.form.email')}
                          {!hasEmail && ' (non disponible)'}
                        </FormLabel>
                        {hasEmail && (
                          <p className="text-xs text-muted-foreground">
                            {ticket?.user?.email || ticket?.email}
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
                        <FormLabel className={!hasPhone ? 'text-muted-foreground' : ''}>
                          {t('feedback.admin.tickets.response.form.sms')}
                          {!hasPhone && ' (non disponible)'}
                        </FormLabel>
                        {hasPhone && (
                          <p className="text-xs text-muted-foreground">
                            {ticket?.user?.phoneNumber || ticket?.phoneNumber}
                          </p>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('feedback.admin.tickets.response.form.cancel')}
              </Button>
              <Button
                type="submit"
                loading={respondMutation.isPending}
                disabled={!form.formState.isValid}
              >
                {t('feedback.admin.tickets.response.form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

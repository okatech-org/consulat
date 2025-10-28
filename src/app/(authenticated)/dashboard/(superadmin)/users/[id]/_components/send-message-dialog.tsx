'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { NotificationChannel, NotificationType } from '@/convex/lib/constants';
import type { Id } from '@/convex/_generated/dataModel';

const messageSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  channels: z
    .array(z.enum(['EMAIL', 'SMS', 'APP']))
    .min(1, 'Sélectionnez au moins un canal'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface SendMessageDialogProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
}

export function SendMessageDialog({ user }: SendMessageDialogProps) {
  const t_common = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendNotification = useAction(
    api.functions.notification.sendMultiChannelNotification,
  );

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: '',
      message: '',
      channels: ['APP'],
      priority: 'normal',
    },
  });

  const onSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true);

    try {
      // Préparer les canaux de notification
      const notificationChannels: NotificationChannel[] = [];

      if (data.channels.includes('EMAIL') && user.email) {
        notificationChannels.push(NotificationChannel.Email);
      }

      if (data.channels.includes('SMS') && user.phoneNumber) {
        notificationChannels.push(NotificationChannel.Sms);
      }

      if (data.channels.includes('APP')) {
        notificationChannels.push(NotificationChannel.App);
      }

      if (notificationChannels.length === 0) {
        toast.error('Aucun canal de notification disponible pour cet utilisateur');
        return;
      }

      // Envoyer la notification via Convex
      await sendNotification({
        userId: user.id as Id<'users'>,
        type: NotificationType.Feedback,
        title: data.title,
        content: data.message,
        channels: notificationChannels,
        priority: data.priority,
      });

      toast.success('Message envoyé avec succès');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableChannels = [
    { id: 'APP', label: 'Application', available: true },
    { id: 'EMAIL', label: 'Email', available: !!user.email },
    { id: 'SMS', label: 'SMS', available: !!user.phoneNumber },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          leftIcon={<MessageSquare className="size-icon" />}
        >
          Envoyer un message
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-icon" />
            Envoyer un message à {user.name || 'cet utilisateur'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Mise à jour importante de votre dossier"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Saisissez votre message..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channels"
              render={() => (
                <FormItem>
                  <FormLabel>Canaux de notification</FormLabel>
                  <div className="space-y-2">
                    {availableChannels.map((channel) => (
                      <FormField
                        key={channel.id}
                        control={form.control}
                        name="channels"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(
                                  channel.id as 'EMAIL' | 'SMS' | 'APP',
                                )}
                                disabled={!channel.available}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, channel.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== channel.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel
                                className={`text-sm ${!channel.available ? 'text-muted-foreground' : ''}`}
                              >
                                {channel.label}
                                {!channel.available && ' (non disponible)'}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  {t_common('actions.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

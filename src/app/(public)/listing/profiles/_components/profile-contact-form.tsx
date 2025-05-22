'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage,
} from '@/components/ui/form';
import { sendProfileMessage } from '../_actions/contact';
import { Input } from '@/components/ui/input';
import CardContainer from '@/components/layouts/card-container';
import { Loader2 } from 'lucide-react';

const contactFormSchema = z.object({
  contact: z.string().min(1, 'Le contact est obligatoire'),
  from: z.string().min(1, 'L&apos;expéditeur est obligatoire'),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ProfileContactFormProps {
  userId: string;
  recipientName: string;
  recipientEmail: string;
}

export function ProfileContactForm({
  userId,
  recipientName,
  recipientEmail,
}: ProfileContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      message: '',
      from: '',
      contact: '',
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);

    try {
      await sendProfileMessage(
        userId,
        data.message,
        recipientEmail,
        data.from,
        data.contact,
      );

      toast({
        variant: 'success',
        title: 'Message envoyé',
        description: `Votre message a été envoyé à ${recipientName}`,
      });

      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'envoi du message",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContainer
          title="Envoyer un message"
          subtitle="Envoyez un message à cette personne. Elle recevra une notification et pourra vous répondre."
          footerContent={
            <div className="flex sm:justify-end">
              <Button type="submit" className="w-full sm:w-max" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {'Envoyer le message'}
              </Button>
            </div>
          }
          contentClass="space-y-4"
        >
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre contact (email ou numéro de téléphone)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    autoComplete="email"
                    placeholder="Votre email ou numéro de téléphone"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <TradFormMessage />
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
                    placeholder="Écrivez votre message ici..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContainer>
      </form>
    </Form>
  );
}

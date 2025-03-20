'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FeedbackFormValues, feedbackSchema } from '@/schemas/feedback';
import { submitFeedback } from '@/actions/feedback';

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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface FeedbackFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FeedbackForm({ onOpenChange, onSuccess }: FeedbackFormProps) {
  const t = useTranslations('feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: '',
      message: '',
      category: 'improvement',
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback(data);

      if (result.success) {
        form.reset();
        toast({
          variant: 'success',
          title: t('confirmation.title'),
          description: t('confirmation.message'),
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: t('error.unknown'),
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error.unknown'),
      });
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.category')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.category')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">{t('form.categories.bug')}</SelectItem>
                  <SelectItem value="feature">{t('form.categories.feature')}</SelectItem>
                  <SelectItem value="improvement">
                    {t('form.categories.improvement')}
                  </SelectItem>
                  <SelectItem value="other">{t('form.categories.other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.subject')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.subjectPlaceholder')} {...field} />
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
              <FormLabel>{t('form.message')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('form.messagePlaceholder')}
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onOpenChange) onOpenChange(false);
            }}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('loading.submitting') : t('form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { type FeedbackFormValues, feedbackSchema } from '@/schemas/feedback';
import { useCreateFeedback } from '@/hooks/use-feedback';

import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
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
import { toast } from 'sonner';
import { FeedbackCategory } from '@/convex/lib/constants';

interface FeedbackFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FeedbackForm({ onOpenChange, onSuccess }: FeedbackFormProps) {
  const t = useTranslations('feedback');
  const { createFeedback, isCreating } = useCreateFeedback();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { subject: '', message: '', category: FeedbackCategory.Improvement },
  });

  const onSubmit = (data: FeedbackFormValues) => {
    createFeedback(
      {
        subject: data.subject,
        message: data.message,
        category: data.category,
        rating: data.rating,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success(t('confirmation.message'));
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feedback-form-category">{t('form.category')}</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="feedback-form-category" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t('form.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUG">{t('form.categories.bug')}</SelectItem>
                    <SelectItem value="FEATURE">{t('form.categories.feature')}</SelectItem>
                    <SelectItem value="IMPROVEMENT">
                      {t('form.categories.improvement')}
                    </SelectItem>
                    <SelectItem value="OTHER">{t('form.categories.other')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="subject"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feedback-form-subject">{t('form.subject')}</FieldLabel>
                <Input
                  id="feedback-form-subject"
                  placeholder={t('form.subjectPlaceholder')}
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feedback-form-message">{t('form.message')}</FieldLabel>
                <Textarea
                  id="feedback-form-message"
                  placeholder={t('form.messagePlaceholder')}
                  rows={5}
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feedback-form-email">{t('form.email')}</FieldLabel>
                <Input
                  id="feedback-form-email"
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  {...field}
                  value={field.value || ''}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="phoneNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="feedback-form-phone">{t('form.phoneNumber')}</FieldLabel>
                <Input
                  id="feedback-form-phone"
                  type="tel"
                  placeholder={t('form.phoneNumberPlaceholder')}
                  {...field}
                  value={field.value || ''}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Nous pourrons vous contacter directement si nécessaire.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

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
          <Button type="submit" loading={isCreating}>
            {t('form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Doc } from '@/convex/_generated/dataModel';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  TradFormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TranscriptDocumentSchema,
  type TranscriptDocumentInput,
  TranscriptDocumentType,
} from '@/schemas/transcript-service';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { DynamicFieldsEditor } from '@/components/organization/dynamic-fields-editor';
import { profileFields } from '@/types/profile';
import type { ServiceField } from '@/types/consular-service';

interface TranscriptServiceFormProps {
  userProfile?: Doc<'profiles'> | null;
  onSubmit: (data: TranscriptDocumentInput) => Promise<void>;
}

export function TranscriptServiceForm({
  userProfile,
  onSubmit,
}: TranscriptServiceFormProps) {
  const t = useTranslations('services.transcript');
  const [isLoading, setIsLoading] = useState(false);

  // Predefined fields for document information
  const documentFields: ServiceField[] = [
    {
      name: 'documentType',
      type: 'select',
      label: t('fields.documentType'),
      required: true,
      options: Object.values(TranscriptDocumentType).map((type) => ({
        value: type,
        label: t(`documentTypes.${type.toLowerCase()}`),
      })),
    },
    {
      name: 'documentDate',
      type: 'date',
      label: t('fields.documentDate'),
      required: true,
    },
    {
      name: 'issuingCountry',
      type: 'select',
      label: t('fields.issuingCountry'),
      required: true,
      options: Object.values(TranscriptDocumentType).map((type) => ({
        value: type,
        label: t(`documentTypes.${type.toLowerCase()}`),
      })),
    },
    {
      name: 'issuingAuthority',
      type: 'text',
      label: t('fields.issuingAuthority'),
      required: true,
    },
    {
      name: 'originalLanguage',
      type: 'text',
      label: t('fields.originalLanguage'),
      required: true,
    },
  ];

  // Predefined fields for requester information
  const requesterFields: ServiceField[] = [
    {
      name: 'requesterName',
      type: 'text',
      label: t('fields.requesterName'),
      required: true,
      profileField: 'fullName',
    },
    {
      name: 'birthDate',
      type: 'date',
      label: t('fields.birthDate'),
      required: true,
      profileField: 'birthDate',
    },
    {
      name: 'birthPlace',
      type: 'text',
      label: t('fields.birthPlace'),
      required: true,
      profileField: 'birthPlace',
    },
    {
      name: 'relationship',
      type: 'text',
      label: t('fields.relationship'),
      required: true,
      description: t('descriptions.relationship'),
    },
  ];

  const form = useForm<TranscriptDocumentInput>({
    resolver: zodResolver(TranscriptDocumentSchema),
    defaultValues: {},
  });

  const handleSubmit = async (data: TranscriptDocumentInput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast.success(t('messages.success'));
    } catch {
      toast.error(t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.document.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicFieldsEditor
              fields={documentFields}
              onChange={(fields) => {
                fields.forEach((field) => {
                  form.setValue(
                    field.name as keyof TranscriptDocumentInput,
                    field.defaultValue,
                  );
                });
              }}
              profileFields={[]}
            />
          </CardContent>
        </Card>

        {/* Requester Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.requester.title')}</CardTitle>
            {userProfile && (
              <div className="flex items-center gap-2 rounded-lg border p-4">
                <InfoCircledIcon className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  {t('messages.profileLinkAvailable')}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <DynamicFieldsEditor
              fields={requesterFields}
              onChange={(fields) => {
                fields.forEach((field) => {
                  form.setValue(
                    field.name as keyof TranscriptDocumentInput,
                    field.defaultValue,
                  );
                });
              }}
              profileFields={profileFields}
            />
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.notes.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('placeholders.additionalNotes')}
                      rows={4}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" loading={isLoading}>
          {t('actions.submit')}
        </Button>
      </form>
    </Form>
  );
}

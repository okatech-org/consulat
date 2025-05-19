'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DocumentType } from '@prisma/client';
import { CreateDocumentTemplateSchema, CreateDocumentTemplateInput } from './schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet';
import { tryCatch } from '@/lib/utils';
import { createDocumentTemplate } from '@/actions/document-generation';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { LoaderIcon } from 'lucide-react';

interface CreateDocumentTemplateFormProps {
  organizationId: string;
}

export function CreateDocumentTemplateForm({
  organizationId,
}: CreateDocumentTemplateFormProps) {
  const router = useRouter();
  const t = useTranslations('inputs');
  const tMessages = useTranslations('messages');
  const form = useForm<CreateDocumentTemplateInput>({
    resolver: zodResolver(CreateDocumentTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      content: {},
      type: undefined,
      organizationId,
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CreateDocumentTemplateInput) => {
    setLoading(true);

    const response = await tryCatch(createDocumentTemplate(data));

    if (response.error) {
      toast({
        title: tMessages('errors.fail_to_create_document_template'),
        variant: 'destructive',
      });
    }

    if (response.data) {
      toast({
        title: tMessages('success.document_template.create_success'),
      });
      router.push(ROUTES.dashboard.doc_template_edit(response.data.id));
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('documentTemplate.name.label')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('documentTemplate.name.placeholder')} />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('documentTemplate.description.label')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('documentTemplate.description.placeholder')}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('documentTemplate.type.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('documentTemplate.type.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(DocumentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`userDocument.options.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {t('documentTemplate.actions.submit')}
          {loading && <LoaderIcon className="size-icon ml-1" />}
        </Button>
      </form>
    </Form>
  );
}

export function CreateDocumentTemplateFormSheet({
  organizationId,
}: CreateDocumentTemplateFormProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Nouveau modèle</Button>
      </SheetTrigger>
      <SheetContent side="right" className="max-w-5xl">
        <CreateDocumentTemplateForm organizationId={organizationId} />
      </SheetContent>
    </Sheet>
  );
}

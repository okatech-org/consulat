'use client';

import React, { useEffect, useState } from 'react';
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
import { DocumentTemplate, DocumentType } from '@prisma/client';
import { CreateDocumentTemplateSchema, CreateDocumentTemplateInput } from './schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import {
  createDocumentTemplate,
  updateDocumentTemplate,
} from '@/actions/document-generation';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { LoaderIcon } from 'lucide-react';
import CardContainer from '../layouts/card-container';
import { MultiSelect } from '../ui/multi-select';
import { Config, PDFBuilder } from './pdf-builder';

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

    const response = await tryCatch(createDocumentTemplate(data as DocumentTemplate));

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

interface EditionFormProps {
  template: DocumentTemplate;
}

export default function EditionForm({ template }: EditionFormProps) {
  const t = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const defaultPageId = crypto.randomUUID();
  const defaultConfig: Config = {
    fonts: [
      {
        family: 'Oswald',
        src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
      },
    ],
    document: {
      title: template.name,
    },
    children: [
      {
        element: 'Page',
        id: defaultPageId,
        parentId: 'root',
        props: {
          size: 'A4',
          orientation: 'portrait',
          wrap: true,
          style: {
            paddingTop: 35,
            paddingBottom: 65,
            paddingHorizontal: 35,
          },
        },
        children: [
          {
            element: 'Text',
            id: crypto.randomUUID(),
            parentId: defaultPageId,
            content: 'Nouveau texte',
            props: {
              style: {
                fontSize: 20,
                textAlign: 'center',
                fontFamily: 'Oswald',
              },
            },
          },
        ],
      },
    ],
  };
  const [builderConfig, setBuilderConfig] = useState<Config>({
    ...defaultConfig,
    ...(template.content ? JSON.parse(template.content as string) : {}),
  });

  const form = useForm<CreateDocumentTemplateInput>({
    resolver: zodResolver(CreateDocumentTemplateSchema),
    defaultValues: {
      name: template.name,
      description: template.description ?? '',
      content: builderConfig,
      type: template.type,
      organizationId: template.organizationId ?? '',
    },
  });

  const onSubmit = async (data: CreateDocumentTemplateInput) => {
    setIsLoading(true);

    const editedFields = filterUneditedKeys(data, form.formState.dirtyFields);

    const response = await tryCatch(
      updateDocumentTemplate(template.id, editedFields as Partial<DocumentTemplate>),
    );

    if (response.error) {
      toast({
        title: response.error.message,
        variant: 'destructive',
      });
    }

    if (response.data) {
      toast({
        title: 'Modèle de document mis à jour avec succès',
        variant: 'success',
      });

      router.refresh();
    }

    setIsLoading(false);
  };

  useEffect(() => {
    form.setValue('content', builderConfig, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [builderConfig, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <div className="col-span-4">
            <PDFBuilder config={builderConfig} onChange={setBuilderConfig} />
          </div>
          <CardContainer
            title="Informations"
            className="col-span-2"
            contentClass="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('documentTemplate.name.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('documentTemplate.name.placeholder')}
                      disabled={isLoading}
                    />
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
                      disabled={isLoading}
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
                  <FormControl>
                    <MultiSelect<DocumentType>
                      options={Object.values(DocumentType).map((type) => ({
                        value: type,
                        label: t(`userDocument.options.${type}`),
                      }))}
                      onChange={field.onChange}
                      selected={field.value}
                      type="single"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {t('documentTemplate.actions.submit')}
              {isLoading && <LoaderIcon className="size-icon ml-1 animate-spin" />}
            </Button>
          </CardContainer>
        </div>
      </form>
    </Form>
  );
}

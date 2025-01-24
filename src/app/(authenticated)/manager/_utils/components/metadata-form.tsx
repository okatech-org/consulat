'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentType } from '@prisma/client';

interface MetadataFormProps {
  documentType: DocumentType;
  metadata: Record<string, unknown> | null;
  onSubmit: (metadata: Record<string, unknown>) => void;
}

export function MetadataForm({ documentType, metadata, onSubmit }: MetadataFormProps) {
  const t = useTranslations('common.components');

  // Définir les champs de métadonnées selon le type de document
  const getMetadataFields = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PASSPORT:
        return [
          {
            name: 'documentNumber',
            label: 'document_number',
            type: 'text',
            required: true,
          },
          {
            name: 'issuingAuthority',
            label: 'issuing_authority',
            type: 'text',
            required: true,
          },
        ];
      case DocumentType.RESIDENCE_PERMIT:
        return [
          { name: 'permitNumber', label: 'permit_number', type: 'text', required: true },
          {
            name: 'issuingAuthority',
            label: 'issuing_authority',
            type: 'text',
            required: true,
          },
          {
            name: 'permitType',
            label: 'permit_type',
            type: 'select',
            required: true,
            options: ['TEMPORARY', 'PERMANENT', 'STUDENT', 'WORK'],
          },
        ];
      case DocumentType.BIRTH_CERTIFICATE:
        return [
          {
            name: 'registryNumber',
            label: 'registry_number',
            type: 'text',
            required: true,
          },
          {
            name: 'issuingAuthority',
            label: 'issuing_authority',
            type: 'text',
            required: true,
          },
          { name: 'placeOfBirth', label: 'place_of_birth', type: 'text', required: true },
        ];
      case DocumentType.PROOF_OF_ADDRESS:
        return [
          {
            name: 'documentType',
            label: 'document_type',
            type: 'select',
            required: true,
            options: ['UTILITY_BILL', 'BANK_STATEMENT', 'TAX_NOTICE', 'RENTAL_AGREEMENT'],
          },
          { name: 'issuer', label: 'issuer', type: 'text', required: true },
        ];
      default:
        return [];
    }
  };

  const fields = getMetadataFields(documentType);
  const form = useForm<Record<string, unknown>>({
    defaultValues: metadata || {},
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{t(`metadata.${field.label}`)}</FormLabel>
                <FormControl>
                  {field.type === 'select' ? (
                    <Select
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t(`metadata.select_${field.label}`)} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`metadata.${field.label}_options.${option.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input {...formField} />
                  )}
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full">
          {t('actions.save')}
        </Button>
      </form>
    </Form>
  );
}

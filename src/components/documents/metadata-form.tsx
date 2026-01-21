'use client';

import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
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
import { DocumentType } from '@/convex/lib/constants';

interface MetadataFormProps {
  documentType: DocumentType;
  metadata: Record<string, unknown> | null;
  onSubmit: (metadata: Record<string, unknown>) => void;
}

export function MetadataForm({ documentType, metadata, onSubmit }: MetadataFormProps) {
  const t = useTranslations('common.documents');

  // Définir les champs de métadonnées selon le type de document
  const getMetadataFields = (type: DocumentType) => {
    switch (type) {
      case DocumentType.Passport:
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
      case DocumentType.ResidencePermit:
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
      case DocumentType.BirthCertificate:
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
      case DocumentType.ProofOfAddress:
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
        <FieldGroup>
          {fields.map((field) => (
            <Controller
              key={field.name}
              name={field.name}
              control={form.control}
              render={({ field: formField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`metadata-form-${field.name}`}>
                    {t(`metadata.${field.label}`)}
                  </FieldLabel>
                  {field.type === 'select' ? (
                    <Select
                      onValueChange={formField.onChange}
                      defaultValue={formField.value as string}
                    >
                      <SelectTrigger id={`metadata-form-${field.name}`} aria-invalid={fieldState.invalid}>
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
                    <Input
                      {...formField}
                      id={`metadata-form-${field.name}`}
                      value={formField.value as string}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          ))}
        </FieldGroup>
        <Button type="submit" className="w-full" size="sm">
          {t('actions.save')}
        </Button>
      </form>
    </Form>
  );
}

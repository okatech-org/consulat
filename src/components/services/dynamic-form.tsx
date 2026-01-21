'use client';

import { type ServiceField } from '@/types/consular-service';
import { Controller, type ControllerRenderProps, useForm, type UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, ArrowRight } from 'lucide-react';
import { UserDocument } from '../documents/user-document';
import { PhoneInput } from '../ui/phone-input';
import { Textarea } from '../ui/textarea';
import { MultiSelect } from '../ui/multi-select';
import { type ServiceForm } from '@/hooks/use-service-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { MobileProgress } from '../registration/mobile-progress';
import CardContainer from '../layouts/card-container';
import { AddressField } from '../ui/address-field';
import type { Doc } from '@/convex/_generated/dataModel';
import { getAutocompleteForField } from '@/lib/form/autocomplete';

interface DynamicFormProps {
  formData: ServiceForm;
  onNext: (data: Record<string, unknown>) => void;
  onPrevious: () => void;
  userId: string;
  isLoading?: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

export function DynamicForm({
  formData,
  onNext,
  onPrevious,
  userId,
  isLoading = false,
  currentStepIndex,
  totalSteps,
}: DynamicFormProps) {
  const form = useForm({
    resolver: zodResolver(formData.schema),
    defaultValues: formData.defaultValues,
  });

  const currentStepValidity = form.formState.isValid;
  const currentStepErrors = form.formState.errors;

  const handleSubmit = (data: Record<string, unknown>) => {
    if (!currentStepValidity) {
      toast.error('Formulaire incomplet ou invalide', {
        description:
          'Veuillez vérifier que tous les champs sont correctement remplis et que les documents sont valides',
      });
    } else {
      onNext(data);
    }
  };

  const renderField = (field: ServiceField) => {
    return (
      <Controller
        key={field.name}
        name={field.name}
        control={form.control}
        render={({ field: formField, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`dynamic-form-${field.name}`}>{field.label}</FieldLabel>
            {getFieldComponent(form, field, formField, userId)}
            {field.description && !['file', 'photo', 'document'].includes(field.type) && (
              <FieldDescription>{field.description}</FieldDescription>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    );
  };

  return (
    <CardContainer title={formData.title} subtitle={formData.description}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FieldGroup>{formData.stepData?.fields.map(renderField)}</FieldGroup>

          <div className="flex justify-between gap-4">
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              disabled={isLoading || currentStepIndex === 0}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              {'Retour'}
            </Button>

            <Button
              type="submit"
              loading={isLoading}
              className="ml-auto"
              rightIcon={
                currentStepIndex !== totalSteps - 1 ? (
                  <ArrowRight className="size-4" />
                ) : undefined
              }
            >
              {currentStepIndex === totalSteps - 1 ? 'Soumettre ma demande' : 'Suivant'}
            </Button>
          </div>
          {!currentStepValidity && (
            <div className="errors flex flex-col gap-2">
              <p className="text-sm max-w-[90%] mx-auto items-center text-muted-foreground flex gap-2 w-full">
                <Info className="size-icon min-w-max text-blue-500" />
                <span>
                  Veuillez vérifier que tous les champs sont correctement remplis
                </span>
              </p>
              <ul className="flex flex-col items-center gap-2">
                {Object.entries(currentStepErrors).map(([error]) => (
                  <li key={error} className="text-red-500 list-disc">
                    <span className="font-medium text-sm">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <MobileProgress
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            stepTitle={formData.title}
            isOptional={false}
          />
        </form>
      </Form>
    </CardContainer>
  );
}

function getFieldComponent(
  form: UseFormReturn<Record<string, unknown>>,
  field: ServiceField,
  formField: ControllerRenderProps<Record<string, unknown>, string>,
  userId?: string,
) {
  switch (field.type) {
    case 'document':
      return (
        <UserDocument
          document={formField.value as Doc<'documents'>}
          description={field.description}
          label={field.label}
          onUpload={formField.onChange}
          onDelete={() => formField.onChange(null)}
          accept={field.accept}
          userId={userId}
        />
      );
    case 'photo':
      return (
        <UserDocument
          document={formField.value as Doc<'documents'>}
          description={field.description}
          label={field.label}
          onUpload={formField.onChange}
          onDelete={() => formField.onChange(null)}
          accept={field.accept}
          userId={userId}
        />
      );
    case 'file':
      return (
        <UserDocument
          document={formField.value as Doc<'documents'>}
          description={field.description}
          label={field.label}
          onUpload={formField.onChange}
          onDelete={() => formField.onChange(null)}
          accept={field.accept}
          userId={userId}
        />
      );
    case 'date':
      return (
        <Input
          {...formField}
          id={`dynamic-form-${field.name}`}
          type="date"
          aria-invalid={formField.value ? false : undefined}
          autoComplete={getAutocompleteForField(field.name)}
        />
      );
    case 'email':
      return (
        <Input
          {...formField}
          id={`dynamic-form-${field.name}`}
          type="email"
          autoComplete={getAutocompleteForField('email')}
          aria-invalid={formField.value ? false : undefined}
        />
      );
    case 'number':
      return (
        <Input
          {...formField}
          id={`dynamic-form-${field.name}`}
          type="number"
          autoComplete={getAutocompleteForField(field.name)}
          aria-invalid={formField.value ? false : undefined}
        />
      );
    case 'phone':
      return (
        <PhoneInput
          id={`dynamic-form-${field.name}`}
          value={formField.value as string}
          onChange={formField.onChange}
          autoComplete={getAutocompleteForField('phone')}
        />
      );
    case 'select':
      return (
        <MultiSelect
          id={`dynamic-form-${field.name}`}
          options={field.options.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          onChange={formField.onChange}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selected={formField.value as any}
          type={field.selectType}
        />
      );
    case 'address':
      return (
        <AddressField
          form={form}
          fields={{
            firstLine: `${field.name}.firstLine`,
            secondLine: `${field.name}.secondLine`,
            city: `${field.name}.city`,
            postalCode: `${field.name}.postalCode`,
            country: `${field.name}.country`,
          }}
          countries={field.countries}
        />
      );
    case 'textarea':
      return (
        <Textarea
          {...formField}
          id={`dynamic-form-${field.name}`}
          minLength={field.minLength}
          maxLength={field.maxLength}
          aria-invalid={formField.value ? false : undefined}
        />
      );
    default:
      return (
        <Input
          {...formField}
          id={`dynamic-form-${field.name}`}
          type={field.type}
          aria-invalid={formField.value ? false : undefined}
          autoComplete={getAutocompleteForField(field.name)}
        />
      );
  }
}

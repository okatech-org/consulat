'use client';
import { useTranslations } from 'next-intl';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { ServiceField } from '@/types/consular-service';
import { DocumentUploadField } from '@/components/ui/document-upload';
import { PhoneNumberInput } from './phone-number';
import { getAutocompleteForField } from '@/lib/form/autocomplete';

interface DynamicFieldProps<T extends FieldValues> {
  data: ServiceField;
  form: UseFormReturn<T>;
  isPreFilled?: boolean;
  disabled?: boolean;
}

export function DynamicField({
  data,
  form,
  isPreFilled,
  disabled,
}: DynamicFieldProps<FieldValues>) {
  const t = useTranslations('consular.form');

  const renderFieldInput = (formField: FieldValues) => {
    switch (data.type) {
      case 'file':
        return (
          <DocumentUploadField
            id={data.name}
            field={data}
            form={form}
            label={data.label}
            description={data.description}
            required={data.required}
          />
        );
      case 'select':
        return (
          <Select
            disabled={disabled}
            onValueChange={formField.onChange}
            defaultValue={formField.value}
          >
            <SelectTrigger>
              <SelectValue placeholder={data.placeholder || t('select_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {data.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'phone':
        return (
          <PhoneNumberInput
            value={formField.value}
            onChangeAction={formField.onChange}
            disabled={disabled}
            className={cn(isPreFilled && 'bg-muted text-muted-foreground')}
            autoComplete={getAutocompleteForField('phone')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...formField}
            disabled={disabled}
            placeholder={data.placeholder}
            className={cn(isPreFilled && 'bg-muted text-muted-foreground')}
          />
        );

      case 'date':
        return (
          <Input
            {...formField}
            type="date"
            disabled={disabled}
            className={cn(isPreFilled && 'bg-muted text-muted-foreground')}
            autoComplete={getAutocompleteForField(data.name)}
          />
        );

      default:
        return (
          <Input
            {...formField}
            type={data.type}
            disabled={disabled}
            placeholder={data.placeholder}
            className={cn(isPreFilled && 'bg-muted text-muted-foreground')}
            autoComplete={getAutocompleteForField(data.name)}
          />
        );
    }
  };

  return (
    <Controller
      name={data.name}
      control={form.control}
      render={({ field: formField, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor={data.name} className={cn(isPreFilled && 'text-muted-foreground')}>
              {data.label}
            </FieldLabel>
            {isPreFilled && (
              <Badge variant="outline" className="text-xs">
                {t('prefilled')}
              </Badge>
            )}
          </div>
          {renderFieldInput({ ...formField, id: data.name, 'aria-invalid': fieldState.invalid })}
          {data.description && <FieldDescription>{data.description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

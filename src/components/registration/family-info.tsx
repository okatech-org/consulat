'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { MaritalStatus } from '@/convex/lib/constants';
import { type FamilyInfoFormData, FamilyInfoSchema } from '@/schemas/registration';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CompleteProfile } from '@/convex/lib/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getFieldLabel } from '@/lib/utils';
import { handleFormInvalid } from '@/lib/form/validation';

interface FamilyInfoFormProps {
  profile: CompleteProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function FamilyInfoForm({
  profile,
  onSave,
  banner,
  onNext,
  onPrevious,
}: Readonly<FamilyInfoFormProps>) {
  if (!profile) return null;
  const t_inputs = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);

  const updateFamilyInfo = useMutation(api.functions.profile.updateFamilyInfo);

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    defaultValues: {
      maritalStatus: profile.family?.maritalStatus ?? MaritalStatus.Single,
      father: profile.family?.father,
      mother: profile.family?.mother,
      spouse: profile.family?.spouse,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const maritalStatus = form.watch('maritalStatus');
  const showSpouseFields =
    maritalStatus === MaritalStatus.Married ||
    maritalStatus === MaritalStatus.Cohabiting ||
    maritalStatus === MaritalStatus.CivilUnion;

  const handleSubmit = async (data: FamilyInfoFormData) => {
    setIsLoading(true);
    try {
      await updateFamilyInfo({
        profileId: profile._id,
        family: data,
      });

      toast.success(t_inputs('success.title'), {
        description: t_inputs('success.description'),
      });

      onSave();
      if (onNext) onNext();
    } catch (error) {
      toast.error(t_inputs('error.title'), {
        description: t_inputs('error.description'),
      });
      console.error('Failed to update family info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalid = (errors: any) => {
    handleFormInvalid(errors, (field) => getFieldLabel(field, t_inputs));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="space-y-6"
      >
        {banner}
        {/* État civil */}

        <FieldGroup className="pt-4">
          <Controller
            name="maritalStatus"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="family-info-marital-status">
                  {t_inputs('maritalStatus.label')}
                </FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (
                      value !== MaritalStatus.Married &&
                      value !== MaritalStatus.Cohabiting &&
                      value !== MaritalStatus.CivilUnion
                    ) {
                      form.setValue('spouse', undefined);
                    }
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="family-info-marital-status" disabled={isLoading} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t_inputs('maritalStatus.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MaritalStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {t_inputs(`maritalStatus.options.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {showSpouseFields && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Controller
                name="spouse.firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-info-spouse-firstname">
                      {t_inputs('firstName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="family-info-spouse-firstname"
                      value={field.value ?? ''}
                      disabled={isLoading}
                      placeholder={t_inputs('firstName.placeholder')}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="spouse.lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-info-spouse-lastname">
                      {t_inputs('lastName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="family-info-spouse-lastname"
                      value={field.value ?? ''}
                      disabled={isLoading}
                      placeholder={t_inputs('lastName.placeholder')}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          )}

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="father.firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-info-father-firstname">
                      {t_inputs('firstName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="family-info-father-firstname"
                      value={field.value ?? ''}
                      disabled={isLoading}
                      placeholder={t_inputs('firstName.placeholder')}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="father.lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-info-father-lastname">
                      {t_inputs('lastName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="family-info-father-lastname"
                      value={field.value ?? ''}
                      disabled={isLoading}
                      placeholder={t_inputs('lastName.placeholder')}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="mother.firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-info-mother-firstname">
                      {t_inputs('firstName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="family-info-mother-firstname"
                      value={field.value ?? ''}
                      disabled={isLoading}
                      placeholder={t_inputs('firstName.placeholder')}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="mother.lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="family-info-mother-lastname">
                      {t_inputs('lastName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="family-info-mother-lastname"
                      value={field.value ?? ''}
                      disabled={isLoading}
                      placeholder={t_inputs('lastName.placeholder')}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </FieldGroup>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          {onPrevious && (
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              leftIcon={<ArrowLeft className="size-icon" />}
            >
              Précédent
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            rightIcon={<ArrowRight className="size-icon" />}
          >
            {form.formState.isDirty ? 'Enregistrer et continuer' : 'Continuer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

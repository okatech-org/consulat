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
import { WorkStatus } from '@/convex/lib/constants';
import {
  type ProfessionalInfoFormData,
  ProfessionalInfoSchema,
} from '@/schemas/registration';
import CardContainer from '../layouts/card-container';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CompleteProfile } from '@/convex/lib/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getFieldLabel } from '@/lib/utils';
import { handleFormInvalid } from '@/lib/form/validation';

interface ProfessionalInfoFormProps {
  profile: CompleteProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ProfessionalInfoForm({
  profile,
  onSave,
  banner,
  onNext,
  onPrevious,
}: Readonly<ProfessionalInfoFormProps>) {
  if (!profile) return null;
  const t_inputs = useTranslations('inputs');
  const t = useTranslations('registration');
  const [isLoading, setIsLoading] = useState(false);

  const updateProfessionalInfo = useMutation(
    api.functions.profile.updateProfessionalInfo,
  );

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: profile.professionSituation?.workStatus ?? WorkStatus.Unemployed,
      profession: profile.professionSituation?.profession,
      employer: profile.professionSituation?.employer,
      employerAddress: profile.professionSituation?.employerAddress,
      activityInGabon: profile.professionSituation?.activityInGabon,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const workStatus = form.watch('workStatus');
  const showEmployerFields = workStatus === WorkStatus.Employee;
  const showProfessionField =
    workStatus === WorkStatus.Employee || workStatus === WorkStatus.Entrepreneur;

  const handleSubmit = async (data: ProfessionalInfoFormData) => {
    setIsLoading(true);
    try {
      await updateProfessionalInfo({
        profileId: profile._id,
        professionSituation: data,
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
      console.error('Failed to update professional info:', error);
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
        {/* Statut professionnel */}
        <div className="space-y-6 pt-4">
          {/* Statut professionnel */}
          <CardContainer
            title={t_inputs('professionalStatus.label')}
            subtitle={t_inputs('professionalStatus.help')}
          >
            <Controller
              name="workStatus"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== WorkStatus.Employee) {
                        form.setValue('profession', undefined);
                        form.setValue('employer', undefined);
                        form.setValue('employerAddress', undefined);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="professional-info-workStatus" disabled={isLoading} aria-invalid={fieldState.invalid}>
                      <SelectValue
                        placeholder={t_inputs('professionalStatus.select')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(WorkStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t_inputs(`professionalStatus.options.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </CardContainer>

          {(showProfessionField || showEmployerFields) && (
            <CardContainer title={t('form.professional_info')}>
              <FieldGroup>
                {showProfessionField && (
                  <Controller
                    name="profession"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="professional-info-profession">
                          {t_inputs('profession.label')}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="professional-info-profession"
                          value={field.value ?? ''}
                          placeholder={t_inputs('profession.placeholder')}
                          disabled={isLoading}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                )}

                {showEmployerFields && (
                  <>
                    <Controller
                      name="employer"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="professional-info-employer">
                            {t_inputs('employer.label')}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="professional-info-employer"
                            value={field.value ?? ''}
                            placeholder={t_inputs('employer.placeholder')}
                            disabled={isLoading}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="employerAddress"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="professional-info-employer-address">
                            {t_inputs('employerAddress.label')}
                          </FieldLabel>
                          <Input
                            {...field}
                            id="professional-info-employer-address"
                            value={field.value ?? ''}
                            placeholder={t_inputs('employerAddress.placeholder')}
                            disabled={isLoading}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </>
                )}
              </FieldGroup>
            </CardContainer>
          )}

          <CardContainer
            title={t('form.gabon_activity')}
            subtitle={t('form.gabon_activity_description')}
          >
            <Controller
              name="activityInGabon"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="professional-info-activity-gabon"
                    value={field.value ?? ''}
                    placeholder={t_inputs('activityInGabon.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </CardContainer>
        </div>

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
            Enregistrer et continuer
          </Button>
        </div>
      </form>
    </Form>
  );
}

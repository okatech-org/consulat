'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { WorkStatus } from '@prisma/client';
import { ProfessionalInfoFormData } from '@/schemas/registration';
import CardContainer from '../layouts/card-container';

interface ProfessionalInfoFormProps {
  form: UseFormReturn<ProfessionalInfoFormData>;
  onSubmit: (data: ProfessionalInfoFormData) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
  banner?: React.ReactNode;
}

export function ProfessionalInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
  banner,
}: Readonly<ProfessionalInfoFormProps>) {
  const t_inputs = useTranslations('inputs');
  const t = useTranslations('registration');

  const workStatus = form.watch('workStatus');
  const showEmployerFields = workStatus === WorkStatus.EMPLOYEE;
  const showProfessionField =
    workStatus === WorkStatus.EMPLOYEE || workStatus === WorkStatus.ENTREPRENEUR;

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {banner}
        {/* Statut professionnel */}
        <div className="space-y-6 pt-4">
          {/* Statut professionnel */}
          <CardContainer
            title={t_inputs('professionalStatus.label')}
            subtitle={t_inputs('professionalStatus.help')}
          >
            <FormField
              control={form.control}
              name="workStatus"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== WorkStatus.EMPLOYEE) {
                        form.setValue('profession', undefined);
                        form.setValue('employer', undefined);
                        form.setValue('employerAddress', undefined);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue
                          placeholder={t_inputs('professionalStatus.select')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(WorkStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t_inputs(`professionalStatus.options.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </CardContainer>

          {/* Informations professionnelles */}
          {(showProfessionField || showEmployerFields) && (
            <CardContainer title={t('form.professional_info')}>
              <div className="grid gap-4">
                {showProfessionField && (
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t_inputs('profession.label')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder={t_inputs('profession.placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {showEmployerFields && (
                  <>
                    <FormField
                      control={form.control}
                      name="employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t_inputs('employer.label')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder={t_inputs('employer.placeholder')}
                            />
                          </FormControl>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t_inputs('employerAddress.label')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder={t_inputs('employerAddress.placeholder')}
                            />
                          </FormControl>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </CardContainer>
          )}

          {/* Dernière activité au Gabon */}
          <CardContainer
            title={t('form.gabon_activity')}
            subtitle={t('form.gabon_activity_description')}
          >
            <FormField
              control={form.control}
              name="activityInGabon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t_inputs('activityInGabon.placeholder')}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </CardContainer>
        </div>
      </form>
    </Form>
  );
}

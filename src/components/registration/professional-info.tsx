'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ProfessionalInfoFormProps {
  form: UseFormReturn<ProfessionalInfoFormData>;
  onSubmit: (data: ProfessionalInfoFormData) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
}

export function ProfessionalInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
}: Readonly<ProfessionalInfoFormProps>) {
  const t_inputs = useTranslations('inputs');
  const t = useTranslations('registration');

  const workStatus = form.watch('workStatus');
  const showEmployerFields = workStatus === WorkStatus.EMPLOYEE;
  const showProfessionField =
    workStatus === WorkStatus.EMPLOYEE || workStatus === WorkStatus.ENTREPRENEUR;

  React.useEffect(() => {
    console.log(form.formState.errors);
    console.log(form.getValues());
  }, [form, form.formState, form.getValues]);

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Statut professionnel */}
        <Card>
          <CardHeader>
            <CardTitle>{t_inputs('professionalStatus.label')}</CardTitle>
            <FormDescription>{t_inputs('professionalStatus.help')}</FormDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        {(showProfessionField || showEmployerFields) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('form.professional_info')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
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
            </CardContent>
          </Card>
        )}

        {/* Dernière activité au Gabon */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.gabon_activity')}</CardTitle>
            <FormDescription>{t('form.gabon_activity_description')}</FormDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
    reValidateMode: 'onBlur',
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
    const invalidFields = Object.keys(errors)
      .map((field) => getFieldLabel(field, t_inputs))
      .join(', ');

    toast.error('Champs invalides ou manquants', {
      description: invalidFields
        ? `Champs à corriger : ${invalidFields}`
        : 'Veuillez corriger les champs invalides avant de continuer',
    });
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
            <FormField
              control={form.control}
              name="workStatus"
              render={({ field }) => (
                <FormItem>
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
                            disabled={isLoading}
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
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

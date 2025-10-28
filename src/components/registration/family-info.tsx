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
    reValidateMode: 'onBlur',
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {banner}
        {/* État civil */}

        <div className={'space-y-6 pt-4'}>
          <div>
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('maritalStatus.label')}</FormLabel>
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
                    <FormControl>
                      <SelectTrigger disabled={isLoading}>
                        <SelectValue placeholder={t_inputs('maritalStatus.select')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MaritalStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t_inputs(`maritalStatus.options.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Champs spécifiques si marié(e) */}
            {showSpouseFields && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spouse.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                          placeholder={t_inputs('firstName.placeholder')}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spouse.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoading}
                          placeholder={t_inputs('lastName.placeholder')}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="father.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoading}
                        placeholder={t_inputs('firstName.placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="father.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoading}
                        placeholder={t_inputs('lastName.placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mother.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoading}
                        placeholder={t_inputs('firstName.placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mother.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoading}
                        placeholder={t_inputs('lastName.placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
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
            {form.formState.isDirty ? 'Enregistrer et continuer' : 'Continuer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

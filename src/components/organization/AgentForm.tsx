'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelectCountries } from '@/components/ui/multi-select-countries';
import { MultiSelect } from '@/components/ui/multi-select';
import { AgentFormData, AgentSchema } from '@/schemas/user';
import { useToast } from '@/hooks/use-toast';
import { ServiceCategory } from '@prisma/client';
import { createNewAgent } from '@/actions/organizations';
import { Organization } from '@/types/organization';
import { tryCatch } from '@/lib/utils';
import { PhoneNumberInput } from '../ui/phone-number';
import { CountryCode } from '@/lib/autocomplete-datas';

interface AgentFormProps {
  initialData?: Partial<AgentFormData>;
  countries: Organization['countries'];
  onSuccess?: () => void;
}

export function AgentForm({ initialData, countries, onSuccess }: AgentFormProps) {
  const t = useTranslations('organization.settings.agents');
  const t_inputs = useTranslations('inputs');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      ...initialData,
      countryIds: initialData?.countryIds ?? [],
      serviceCategories: initialData?.serviceCategories ?? [],
      phoneNumber: initialData?.phoneNumber ?? '+33-',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(data: AgentFormData) {
    setIsLoading(true);

    const result = await tryCatch(createNewAgent(data));

    if (result.data) {
      toast({
        title: t_messages('success.create'),
        variant: 'success',
      });
      onSuccess?.();
    }

    if (result.error) {
      toast({
        title: t_messages('errors.create'),
        description: `${result.error.message}`,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className={'col-span-full lg:col-span-1'}>
              <FormLabel>{t_inputs('firstName.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t_inputs('firstName.placeholder')}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className={'col-span-full lg:col-span-1'}>
              <FormLabel>{t_inputs('lastName.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t_inputs('lastName.placeholder')}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className={'col-span-full'}>
              <FormLabel>{t_inputs('email.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t_inputs('email.placeholder')}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>{t_inputs('phone.label')}</FormLabel>
              <FormControl>
                <PhoneNumberInput
                  value={field.value ?? '+33-'}
                  onChangeAction={field.onChange}
                  disabled={isLoading}
                  options={countries.map((country) => country.code as CountryCode)}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t_inputs('country.label')}</FormLabel>
              <FormControl>
                <MultiSelectCountries
                  placeholder={t_inputs('country.select_placeholder')}
                  countries={countries}
                  selected={field.value}
                  onChangeAction={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceCategories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('service_categories')}</FormLabel>
              <FormControl>
                <MultiSelect<ServiceCategory>
                  placeholder="Sélectionner les catégories"
                  options={Object.values(ServiceCategory).map((cat) => ({
                    label: t_common(`service_categories.${cat}`),
                    value: cat,
                  }))}
                  selected={field.value}
                  onChange={field.onChange}
                  type={'multiple'}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-full flex flex-end">
          <Button type="submit" className="ml-2" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t_common('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

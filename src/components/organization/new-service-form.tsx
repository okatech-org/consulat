'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { ServiceCategory } from '@/convex/lib/constants';
import type { Country, Organization } from '@/types';
import type { ConsularServiceListingItem } from '@/types/consular-service';
import { NewServiceSchema, type NewServiceSchemaInput } from '@/schemas/consular-service';
import { CountrySelect } from '../ui/country-select';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { ErrorCard } from '../ui/error-card';
import { useServices } from '@/hooks/use-services';
import type { Id } from '@/convex/_generated/dataModel';
interface ServiceFormProps {
  initialData?: Partial<ConsularServiceListingItem>;
  countries: Country[];
  organizations: Organization[];
}

export function NewServiceForm({
  initialData,
  countries,
  organizations,
}: ServiceFormProps) {
  const router = useRouter();
  const tInputs = useTranslations('inputs');
  const t = useTranslations('services');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createService } = useServices();

  const isCategoryPreSelected = initialData?.category !== undefined;

  const form = useForm<NewServiceSchemaInput>({
    resolver: zodResolver(NewServiceSchema),
    defaultValues: {
      id: initialData?.id ?? '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || ServiceCategory.CivilStatus,
      organizationId: initialData?.organizationId ?? '',
      countryCode: initialData?.countryCode ?? '',
    },
  });

  const handleSubmit = async (data: NewServiceSchemaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const serviceId = await createService({
        code: data.id || `SRV-${Date.now()}`,
        name: data.name,
        description: data.description,
        category: data.category,
        organizationId: data.organizationId as Id<'organizations'>,
        countries: data.countryCode ? [data.countryCode] : [],
        steps: [],
        processing: {
          mode: 'online_only' as any,
          appointment: {
            requires: false,
          },
        },
        delivery: {
          modes: [],
        },
        pricing: {
          isFree: true,
        },
      });
      router.push(ROUTES.dashboard.edit_service(serviceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.name.placeholder')}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description.label')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('form.description.placeholder')}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col gap-2">
              <FormLabel>{tInputs('serviceCategory.label')}</FormLabel>
              <MultiSelect<ServiceCategory>
                type="single"
                options={Object.values(ServiceCategory).map((category) => ({
                  label: tInputs(`serviceCategory.options.${category}`),
                  value: category,
                }))}
                onChange={field.onChange}
                selected={field.value}
                disabled={isLoading || isCategoryPreSelected}
              />
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col gap-2">
              <FormLabel>{tInputs('organization.label')}</FormLabel>
              <MultiSelect<string>
                type="single"
                options={organizations?.map((organization) => ({
                  label: organization.name,
                  value: (organization as any)._id || organization.id,
                }))}
                onChange={field.onChange}
                selected={field.value}
                disabled={isLoading || Boolean(initialData?.organizationId)}
                className="min-w-max"
              />
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tInputs('country.label')}</FormLabel>
              <FormControl>
                <CountrySelect
                  type="single"
                  selected={field.value as CountryCode}
                  onChange={(value) => field.onChange(value)}
                  options={countries?.map((item) => item.code as CountryCode)}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" loading={isLoading} disabled={!form.formState.isValid}>
            {initialData ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
        {error && <ErrorCard title={t('messages.error.create')} description={error} />}
      </form>
    </Form>
  );
}

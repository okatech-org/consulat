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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Country, ServiceCategory } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { ConsularServiceListingItem } from '@/types/consular-service';
import { NewServiceSchema, NewServiceSchemaInput } from '@/schemas/consular-service';
import { InfoField } from '@/components/ui/info-field';
import { CountrySelect } from '../ui/country-select';
import { CountryCode } from '@/lib/autocomplete-datas';

interface ServiceFormProps {
  initialData?: Partial<ConsularServiceListingItem>;
  handleSubmit: (data: NewServiceSchemaInput) => Promise<void>;
  isLoading?: boolean;
  countries: Country[];
}

export function NewServiceForm({
  initialData,
  handleSubmit,
  isLoading,
  countries,
}: ServiceFormProps) {
  const tInputs = useTranslations('inputs');
  const t = useTranslations('services');
  const t_common = useTranslations('common');

  const form = useForm<NewServiceSchemaInput>({
    resolver: zodResolver(NewServiceSchema),
    defaultValues: {
      id: initialData?.id ?? '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || ServiceCategory.CIVIL_STATUS,
      organizationId: initialData?.organizationId ?? '',
      countryCode: initialData?.countryCode ?? '',
    },
  });

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
            <FormItem>
              <FormLabel>{t('form.category.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.category.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ServiceCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {t_common(`service_categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {initialData?.organizationId && (
          <InfoField
            label={t('form.organizationId.label')}
            value={initialData.organizationId}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="size-icon animate-spin" />}
            {initialData ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

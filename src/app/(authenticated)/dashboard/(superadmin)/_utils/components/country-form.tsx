'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { countrySchema, type CountrySchemaInput } from '@/schemas/country';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCountries } from '@/hooks/use-countries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CountrySelect } from '@/components/ui/country-select';
import { tryCatch } from '@/lib/utils';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { CountryCode, CountryStatus } from '@/convex/lib/constants';

interface CountryFormProps {
  initialData?: Partial<Doc<'countries'>>;
  isLoading?: boolean;
  onSubmit?: (data: CountrySchemaInput) => Promise<void>;
}

export function CountryForm({ initialData, onSubmit, isLoading }: CountryFormProps) {
  const t = useTranslations('sa.countries');
  const t_countries = useTranslations('countries');
  const { updateCountry } = useCountries();
  const form = useForm<CountrySchemaInput>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      ...(initialData?._id && { countryId: initialData._id }),
      ...(initialData?.code && { code: initialData.code }),
      ...(initialData?.name && { name: initialData.name }),
      ...(initialData?.flag && { flag: initialData.flag }),
      status: initialData?.status || CountryStatus.Active,
    },
  });

  const handleCountrySelect = (code: CountryCode) => {
    form.setValue('code', code);
    form.setValue('name', t_countries(code));
    form.setValue('flag', `https://flagcdn.com/${code.toLowerCase()}.svg`);
  };

  const handleSubmit = async (data: CountrySchemaInput) => {
    if (!data.countryId) return;

    const result = await tryCatch(
      updateCountry({
        countryId: data.countryId as Id<'countries'>,
        name: data.name,
        code: data.code,
        flag: data.flag ?? undefined,
        status: data.status,
      }),
    );

    if (result.error) {
      toast.error(t('messages.error.update'));
      return;
    }

    toast.success(t('messages.updateSuccess'));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit ? onSubmit : handleSubmit)}
        className="space-y-4"
      >
        {!initialData && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.label')}</FormLabel>
                <FormControl>
                  <CountrySelect
                    type="single"
                    selected={field.value}
                    onChange={handleCountrySelect}
                    placeholder={t('form.placeholder')}
                    searchPlaceholder={t('form.search')}
                    emptyText={t('form.empty')}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input disabled placeholder={t('form.name.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={t('form.status.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CountryStatus.Active}>
                    {t('form.status.options.active')}
                  </SelectItem>
                  <SelectItem value={CountryStatus.Inactive}>
                    {t('form.status.options.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData ? t('actions.update') : t('actions.create')}
        </Button>
      </form>
    </Form>
  );
}

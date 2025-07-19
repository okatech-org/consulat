'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Country } from '@/types/country';
import { countrySchema, type CountrySchemaInput } from '@/schemas/country';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage,
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
import { Textarea } from '@/components/ui/textarea';
import { updateCountry } from '@/actions/countries';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CountrySelect } from '@/components/ui/country-select';
import { tryCatch } from '@/lib/utils';

interface CountryFormProps {
  initialData?: Country;
  isLoading?: boolean;
  onSubmit?: (data: CountrySchemaInput) => Promise<void>;
}

export function CountryForm({ initialData, onSubmit, isLoading }: CountryFormProps) {
  const t = useTranslations('sa.countries');
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');

  const form = useForm<CountrySchemaInput>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      ...(initialData?.id && { id: initialData.id }),
      ...(initialData?.metadata && { metadata: initialData.metadata }),
      ...(initialData?.code && { code: initialData.code }),
      ...(initialData?.name && { name: initialData.name }),
      ...(initialData?.flag && { flag: initialData.flag }),
      status: initialData?.status || 'ACTIVE',
    },
  });

  const handleCountrySelect = (code: CountryCode) => {
    form.setValue('code', code);
    form.setValue('name', t_countries(code));
    form.setValue('flag', `https://flagcdn.com/${code.toLowerCase()}.svg`);
  };

  const handleSubmit = async (data: CountrySchemaInput) => {
    if (!data.id) return;

    const result = await tryCatch(updateCountry(data));

    if (result.error) {
      toast({
        title: t('messages.error.update'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('messages.updateSuccess'),
    });
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
                    selected={field.value as CountryCode}
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
                  <SelectItem value="ACTIVE">
                    {t('form.status.options.active')}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {t('form.status.options.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <h3 className="text-md col-span-full font-medium">
                {t_inputs('regionalSettings.currency')}
              </h3>
              <FormField
                control={form.control}
                name="metadata.currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.currencyCode')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs('regionalSettings.currencyCodePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.currencySymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.currencySymbol')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs(
                          'regionalSettings.currencySymbolPlaceholder',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.currencyFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.currencyFormat')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs(
                          'regionalSettings.currencyFormatPlaceholder',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.currencySymbolPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t_inputs('regionalSettings.currencySymbolPosition')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t_inputs(
                              'regionalSettings.currencySymbolPositionPlaceholder',
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="before">
                          {t_inputs('regionalSettings.currencySymbolPositionBefore')}
                        </SelectItem>
                        <SelectItem value="after">
                          {t_inputs('regionalSettings.currencySymbolPositionAfter')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <h3 className="text-md col-span-full font-medium">
                {t_inputs('regionalSettings.language')}
              </h3>
              <FormField
                control={form.control}
                name="metadata.defaultLocale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.defaultLocale')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs(
                          'regionalSettings.defaultLocalePlaceholder',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.locales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.locales')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t_inputs('regionalSettings.localesPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <h3 className="text-md col-span-full font-medium">
                {t_inputs('regionalSettings.format')}
              </h3>
              <FormField
                control={form.control}
                name="metadata.dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.dateFormat')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs('regionalSettings.dateFormatPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.timeFormat')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs('regionalSettings.timeFormatPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('regionalSettings.timeZone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t_inputs('regionalSettings.timeZonePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData ? t('actions.update') : t('actions.create')}
        </Button>
      </form>
    </Form>
  );
}

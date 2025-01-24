'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Country } from '@/types/country';
import { countrySchema, CountrySchemaInput } from '@/schemas/country';
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
import { useEffect, useState } from 'react';
import { cn, CountryItem, getWorldCountries } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateCountry } from '@/actions/countries';
import { useToast } from '@/hooks/use-toast';

interface CountryFormProps {
  initialData?: Country;
  isLoading?: boolean;
  onSubmit?: (data: CountrySchemaInput) => Promise<void>;
}

export function CountryForm({ initialData, onSubmit, isLoading }: CountryFormProps) {
  const t = useTranslations('superadmin.countries');
  const t_inputs = useTranslations('inputs');
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const locale = useLocale();
  const { toast } = useToast();

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

  useEffect(() => {
    getWorldCountries(locale).then((data) => {
      setCountries(data);
      setIsLoadingCountries(false);
    });
  }, [locale]);

  function getSelectedCountry(code: string) {
    return countries.find((country) => country.code === code);
  }

  const handleCountrySelect = (code: string) => {
    const country = getSelectedCountry(code);
    if (country) {
      form.setValue('code', country.code);
      form.setValue('name', country.name);
      form.setValue('flag', country.flag);
    }
    setOpen(false);
  };

  const handleSubmit = async (data: CountrySchemaInput) => {
    if (!data.id) return;

    const result = await updateCountry(data);

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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground',
                        )}
                        disabled={isLoading || isLoadingCountries}
                        type="button"
                      >
                        {isLoadingCountries ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <div className="flex items-center gap-2">
                            {field.value && getSelectedCountry(field.value) ? (
                              <>
                                <Image
                                  src={`https://flagcdn.com/${field.value.toLowerCase()}.svg`}
                                  alt={getSelectedCountry(field.value)?.name || ''}
                                  width={20}
                                  height={15}
                                  className="rounded object-contain"
                                />
                                <span>{getSelectedCountry(field.value)?.name}</span>
                              </>
                            ) : (
                              <span>{t('form.placeholder')}</span>
                            )}
                          </div>
                        )}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={t('form.search')}
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandEmpty>{t('form.empty')}</CommandEmpty>
                      <CommandList>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {countries.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.name}
                              onSelect={() => handleCountrySelect(country.code)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{country.name}</span>
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    field.value === country.name
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

        <Button type="submit" disabled={isLoading || isLoadingCountries}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {initialData ? t('actions.update') : t('actions.create')}
        </Button>
      </form>
    </Form>
  );
}

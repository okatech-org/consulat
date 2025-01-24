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
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTranslations } from 'next-intl';
import { countryKeys } from '@/lib/autocomplete-datas';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { PhoneInput, PhoneValue } from '@/components/ui/phone-input';
import { Separator } from '@/components/ui/separator';
import { ContactInfoFormData } from '@/schemas/registration';
import { Card, CardContent } from '@/components/ui/card';

interface ContactInfoFormProps {
  form: UseFormReturn<ContactInfoFormData>;
  onSubmit: (data: ContactInfoFormData) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
}

export function ContactInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
}: Readonly<ContactInfoFormProps>) {
  const t = useTranslations('registration');
  const t_countries = useTranslations('countries');
  const [openCountrySelect, setOpenCountrySelect] = React.useState(false);

  const country = form.watch('address.country');
  const showGabonAddress = country && country !== 'gabon';

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 pt-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-full w-full md:col-span-1">
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('form.email_placeholder')}
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="col-span-full w-full md:col-span-1">
                  <FormLabel>{t('form.phone')}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      value={field.value as unknown as PhoneValue}
                      placeholder={t('form.phone_placeholder')}
                      disabled={isLoading}
                      error={!!form.formState.errors.phone}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <Separator className="col-span-full" />

            {/* Current Address */}
            <fieldset className="col-span-full grid grid-cols-2 gap-x-4 space-y-4">
              <legend className="text-sm font-medium">{t('form.address')}</legend>

              {/* Address Line 1 */}
              <FormField
                control={form.control}
                name="address.firstLine"
                render={({ field }) => (
                  <FormItem className={'col-span-full md:col-span-1'}>
                    <FormLabel>{t('form.street_address')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.street_address_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {/* Address Line 2 */}
              <FormField
                control={form.control}
                name="address.secondLine"
                render={({ field }) => (
                  <FormItem className={'col-span-full md:col-span-1'}>
                    <FormLabel>{t('form.second_line')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('form.address_complement_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {/* City and Zip Code */}
              <div className="col-span-full grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem className={'col-span-2'}>
                      <FormLabel>{t('form.city')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.city_placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.postal_code')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.postal_code_placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Country */}
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem className={'col-span-full'}>
                    <FormLabel>{t('form.country')}</FormLabel>
                    <Popover open={openCountrySelect} onOpenChange={setOpenCountrySelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCountrySelect}
                          className="w-full justify-between"
                        >
                          {field.value
                            ? t_countries(field.value)
                            : t('form.select_country')}
                          <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder={t('form.search_country')}
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>{t('form.no_country_found')}</CommandEmpty>
                            <CommandGroup>
                              {countryKeys.map((countryKey) => (
                                <CommandItem
                                  key={countryKey}
                                  value={countryKey}
                                  onSelect={() => {
                                    form.setValue('address.country', countryKey);
                                    setOpenCountrySelect(false);
                                  }}
                                >
                                  {t_countries(countryKey)}
                                  <CheckIcon
                                    className={cn(
                                      'ml-auto h-4 w-4',
                                      field.value === countryKey
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <Separator className="col-span-full" />

            {/* Gabon Address */}
            {showGabonAddress && (
              <fieldset className="col-span-2 space-y-4">
                <legend className="text-sm font-medium">{t('form.address_gabon')}</legend>

                {/* Gabon Address */}
                <FormField
                  control={form.control}
                  name="addressInGabon.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.street_address')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.street_address_placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {/* District */}
                <FormField
                  control={form.control}
                  name="addressInGabon.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.district')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.district_placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="addressInGabon.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.city')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('form.city_placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

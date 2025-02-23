import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { countryKeys } from '@/lib/autocomplete-datas';
import { NationalityAcquisition } from '@prisma/client';
import { BasicInfoFormData } from '@/schemas/registration';
import { DocumentUploadField } from '@/components/ui/document-upload';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

type BasicInfoFormProps = {
  form: UseFormReturn<BasicInfoFormData>; // Ajouter cette prop
  onSubmit: () => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
  displayIdentityPicture?: boolean;
};

export function BasicInfoForm({
  form, // Utiliser le form passé en prop
  onSubmit,
  formRef,
  isLoading = false,
  displayIdentityPicture = true,
}: Readonly<BasicInfoFormProps>) {
  const t = useTranslations('registration');
  const t_assets = useTranslations('assets');
  const t_countries = useTranslations('countries');
  const [openNationalitySelect, setOpenNationalitySelect] = React.useState(false);

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    if (typeof date === 'string') {
      // Si c'est déjà une date ISO
      if (date.includes('T')) return date.split('T')[0];
      // Si c'est une date au format DD/MM/YYYY
      const [day, month, year] = date.split('/');
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return date;
    }
    return date.toISOString().split('T')[0];
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className={'grid gap-6 pt-4'}>
            {displayIdentityPicture && (
              <FormField
                control={form.control}
                name={'identityPictureFile'}
                render={({ field }) => (
                  <DocumentUploadField<BasicInfoFormData>
                    id={field.name}
                    field={field}
                    form={form}
                    required={true}
                    disabled={isLoading}
                  />
                )}
              />
            )}

            {/* Genre */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('form.gender')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="MALE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t_assets('gender.male')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="FEMALE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t_assets('gender.female')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Nom et prénom */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.first_name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.first_name_placeholder')}
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
                  <FormItem>
                    <FormLabel>{t('form.last_name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.last_name_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date et lieu de naissance */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birth_date')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        disabled={isLoading}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birth_place')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.birth_place_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pays de naissance */}
            <FormField
              control={form.control}
              name="birthCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.birth_country')}</FormLabel>
                  <Popover
                    open={openNationalitySelect}
                    onOpenChange={setOpenNationalitySelect}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openNationalitySelect}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? t_countries(field.value)
                          : t('form.select_nationality')}
                        <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder={t('form.search_nationality')}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>{t('form.no_nationality_found')}</CommandEmpty>
                          <CommandGroup>
                            {countryKeys.map((country) => (
                              <CommandItem
                                key={country}
                                value={country}
                                onSelect={() => {
                                  form.setValue('birthCountry', country);
                                  setOpenNationalitySelect(false);
                                }}
                              >
                                {t_countries(country)}
                                <CheckIcon
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    field.value === country ? 'opacity-100' : 'opacity-0',
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

            {/* Mode d'acquisition de la nationalité */}
            <FormField
              control={form.control}
              name="acquisitionMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    {t('nationality_acquisition.label')}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap items-center gap-4"
                    >
                      {Object.values(NationalityAcquisition).map((acquisition) => (
                        <FormItem key={acquisition} className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value={acquisition} />
                          </FormControl>
                          <FormLabel className="!mt-0 font-normal">
                            {t(
                              `nationality_acquisition.modes.${acquisition.toLowerCase()}`,
                            )}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <Separator className="w-full" />

            <FormField
              control={form.control}
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.passport.number.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('form.passport.number.placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>{t('form.passport.number.help')}</FormDescription>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Dates d'émission et d'expiration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passportIssueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.passport.issue_date.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={formatDateForInput(field.value)}
                        max={new Date().toISOString().split('T')[0]}
                        placeholder={t('form.passport.issue_date.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('form.passport.issue_date.help')}
                    </FormDescription>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.passport.expiry_date.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={formatDateForInput(field.value)}
                        type="date"
                        placeholder={t('form.passport.expiry_date.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('form.passport.expiry_date.help')}
                    </FormDescription>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Autorité émettrice */}
            <FormField
              control={form.control}
              name="passportIssueAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.passport.authority.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('form.passport.authority.placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>{t('form.passport.authority.help')}</FormDescription>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* NIP (optionnel) */}
            <FormField
              control={form.control}
              name="cardPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.card_pin.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder={t('form.card_pin.placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>{t('form.card_pin.help')}</FormDescription>
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

'use client';

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
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { ContactInfoFormData } from '@/schemas/registration';
import { CountryCode, getCountryCode } from '@/lib/autocomplete-datas';
import CardContainer from '../layouts/card-container';
import { MultiSelect } from '../ui/multi-select';
import { FamilyLink } from '@prisma/client';
import { CountrySelect } from '../ui/country-select';
import { Button } from '../ui/button';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { FullProfile } from '@/types';
import { PhoneNumberInput } from '../ui/phone-number';

interface ContactInfoFormProps {
  form: UseFormReturn<ContactInfoFormData>;
  onSubmitAction: (data: ContactInfoFormData) => Promise<void>;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
  banner?: React.ReactNode;
  profile: FullProfile;
}

const homeLandCountryCode = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as
  | CountryCode
  | undefined;

export function ContactInfoForm({
  form,
  onSubmitAction,
  formRef,
  isLoading = false,
  banner,
  profile,
}: Readonly<ContactInfoFormProps>) {
  const t_countries = useTranslations('countries');
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const residenceCountryCode = profile.residenceCountyCode as CountryCode;
  const defaultNumber = `${getCountryCode(residenceCountryCode as CountryCode)}-`;

  function toggleHomeLandContact() {
    const homeLandContact = form.getValues('homeLandContact');

    if (homeLandContact) {
      form.setValue('homeLandContact', undefined);
    } else {
      form.setValue('homeLandContact', {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: defaultNumber,
        relationship: 'MOTHER',
        address: {
          firstLine: '',
          city: '',
          country: homeLandCountryCode as CountryCode,
          zipCode: '',
          secondLine: '',
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmitAction)}
        className="space-y-6"
      >
        {banner}
        <CardContainer contentClass="grid grid-cols-2 gap-6 pt-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-full w-full sm:col-span-1">
                <FormLabel>{t('form.email')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('form.email_placeholder')}
                    autoComplete="email"
                    disabled={Boolean(profile.email) || isLoading}
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
              <FormItem className="sm:col-span-1">
                <FormLabel>{t_inputs('phone.label')}</FormLabel>
                <FormControl>
                  <PhoneNumberInput
                    value={field.value ?? defaultNumber}
                    onChangeAction={field.onChange}
                    disabled={Boolean(profile.phoneNumber) || isLoading}
                    options={residenceCountryCode ? [residenceCountryCode] : undefined}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-full" />

          {/* Current Address */}
          <fieldset className="col-span-full grid grid-cols-2 gap-4">
            {/* Address Line 1 */}
            <FormField
              control={form.control}
              name="address.firstLine"
              render={({ field }) => (
                <FormItem className={'col-span-full sm:col-span-1'}>
                  <FormLabel>{t_inputs('address.firstLine.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t_inputs('address.firstLine.placeholder')}
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
                <FormItem className={'col-span-full sm:col-span-1'}>
                  <FormLabel>{t_inputs('address.secondLine.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t_inputs('address.secondLine.placeholder')}
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
                    <FormLabel>{t_inputs('address.city.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t_inputs('address.city.placeholder')}
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
                    <FormLabel>{t_inputs('address.zipCode.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? undefined}
                        placeholder={t_inputs('address.zipCode.placeholder')}
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
                  <FormLabel>{t_inputs('address.country.label')}</FormLabel>
                  <FormControl>
                    <CountrySelect
                      type="single"
                      selected={field.value as CountryCode}
                      onChange={field.onChange}
                      {...(residenceCountryCode && { options: [residenceCountryCode] })}
                      disabled={Boolean(isLoading || residenceCountryCode)}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <Separator className="col-span-full" />

          {/* Resident Contact */}
          <CardContainer
            className="col-span-full"
            headerClass="p-4"
            contentClass="col-span-full grid sm:grid-cols-2 gap-4 p-4 pt-0"
            title={
              t_inputs('emergencyContact.label') +
              ' - ' +
              t_countries(residenceCountryCode as CountryCode)
            }
          >
            <FormField
              control={form.control}
              name="residentContact.firstName"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
              name="residentContact.lastName"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder={t_inputs('lastName.placeholder')}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="residentContact.relationship"
              render={({ field }) => (
                <FormItem className="sm:col-span-full flex flex-col gap-2">
                  <FormLabel>{t_inputs('familyLink.label')}</FormLabel>
                  <FormControl>
                    <MultiSelect<FamilyLink>
                      type="single"
                      options={Object.values(FamilyLink).map((link) => ({
                        label: t_inputs(`familyLink.options.${link}`),
                        value: link,
                      }))}
                      selected={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="residentContact.email"
              render={({ field }) => (
                <FormItem className="w-full sm:col-span-1">
                  <FormLabel>{t_inputs('email.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? undefined}
                      type="email"
                      placeholder={t_inputs('email.placeholder')}
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="residentContact.phoneNumber"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>{t_inputs('phone.label')}</FormLabel>
                  <FormControl>
                    <PhoneNumberInput
                      value={field.value ?? defaultNumber}
                      onChangeAction={field.onChange}
                      disabled={isLoading}
                      options={residenceCountryCode ? [residenceCountryCode] : undefined}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <fieldset className="sm:col-span-full grid grid-cols-2 gap-x-4 space-y-4">
              <legend className="text-sm font-medium sr-only">
                {t_inputs('address.labelIn', {
                  country: `${t_countries(residenceCountryCode as CountryCode)}`,
                })}
              </legend>
              {/* Address Line 1 */}
              <FormField
                control={form.control}
                name="residentContact.address.firstLine"
                render={({ field }) => (
                  <FormItem className={'col-span-full sm:col-span-1'}>
                    <FormLabel>{t_inputs('address.firstLine.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t_inputs('address.firstLine.placeholder')}
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
                name="residentContact.address.secondLine"
                render={({ field }) => (
                  <FormItem className={'col-span-full sm:col-span-1'}>
                    <FormLabel>{t_inputs('address.secondLine.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t_inputs('address.secondLine.placeholder')}
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
                  name="residentContact.address.city"
                  render={({ field }) => (
                    <FormItem className={'col-span-2'}>
                      <FormLabel>{t_inputs('address.city.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t_inputs('address.city.placeholder')}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residentContact.address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('address.zipCode.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? undefined}
                          placeholder={t_inputs('address.zipCode.placeholder')}
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
                name="residentContact.address.country"
                render={({ field }) => (
                  <FormItem className={'col-span-full'}>
                    <FormLabel>{t_inputs('address.country.label')}</FormLabel>
                    <FormControl>
                      <CountrySelect
                        type="single"
                        selected={field.value as CountryCode}
                        onChange={field.onChange}
                        {...(residenceCountryCode && { options: [residenceCountryCode] })}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          </CardContainer>

          {/* Toggle Home Land Contact */}
          {!form.watch('homeLandContact') && (
            <div className="col-span-full flex justify-end">
              <Button variant="link" type="button" onClick={toggleHomeLandContact}>
                <PlusIcon className="size-icon" />
                {t_inputs('homeLandContact.add', {
                  country: `${t_countries(homeLandCountryCode as CountryCode)}`,
                })}
              </Button>
            </div>
          )}

          {/* Home Land Contact */}
          {form.watch('homeLandContact') && (
            <CardContainer
              className="col-span-full"
              headerClass="p-4"
              contentClass="col-span-full grid sm:grid-cols-2 gap-4 p-4 pt-0"
              title={
                t_inputs('emergencyContact.label') +
                ' - ' +
                t_countries(homeLandCountryCode as CountryCode)
              }
              action={
                <Button variant="link" type="button" onClick={toggleHomeLandContact}>
                  <MinusIcon className="size-icon" />
                  {t_inputs('homeLandContact.remove')}
                </Button>
              }
            >
              <FormField
                control={form.control}
                name="homeLandContact.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
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
                name="homeLandContact.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder={t_inputs('lastName.placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homeLandContact.relationship"
                render={({ field }) => (
                  <FormItem className="sm:col-span-full flex flex-col gap-2">
                    <FormLabel>{t_inputs('familyLink.label')}</FormLabel>
                    <FormControl>
                      <MultiSelect<FamilyLink>
                        type="single"
                        options={Object.values(FamilyLink).map((link) => ({
                          label: t_inputs(`familyLink.options.${link}`),
                          value: link,
                        }))}
                        selected={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="homeLandContact.email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>{t_inputs('email.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? undefined}
                        type="email"
                        placeholder={t_inputs('email.placeholder')}
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
                name="homeLandContact.phoneNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>{t_inputs('phone.label')}</FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        value={field.value ?? defaultNumber}
                        onChangeAction={field.onChange}
                        disabled={isLoading}
                        options={homeLandCountryCode ? [homeLandCountryCode] : undefined}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <fieldset className="sm:col-span-full grid grid-cols-2 gap-x-4 space-y-4">
                <legend className="text-sm font-medium sr-only">
                  {t_inputs('address.labelIn', {
                    country: `${t_countries(homeLandCountryCode as CountryCode)}`,
                  })}
                </legend>
                {/* Address Line 1 */}
                <FormField
                  control={form.control}
                  name="homeLandContact.address.firstLine"
                  render={({ field }) => (
                    <FormItem className={'col-span-full sm:col-span-1'}>
                      <FormLabel>{t_inputs('address.firstLine.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t_inputs('address.firstLine.placeholder')}
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
                  name="homeLandContact.address.secondLine"
                  render={({ field }) => (
                    <FormItem className={'col-span-full sm:col-span-1'}>
                      <FormLabel>{t_inputs('address.secondLine.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={t_inputs('address.secondLine.placeholder')}
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
                    name="homeLandContact.address.city"
                    render={({ field }) => (
                      <FormItem className={'col-span-2'}>
                        <FormLabel>{t_inputs('address.city.label')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t_inputs('address.city.placeholder')}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeLandContact.address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t_inputs('address.zipCode.label')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? undefined}
                            placeholder={t_inputs('address.zipCode.placeholder')}
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
                  name="homeLandContact.address.country"
                  render={({ field }) => (
                    <FormItem className={'col-span-full'}>
                      <FormLabel>{t_inputs('address.country.label')}</FormLabel>
                      <FormControl>
                        <CountrySelect
                          type="single"
                          selected={field.value as CountryCode}
                          onChange={field.onChange}
                          {...(homeLandCountryCode && { options: [homeLandCountryCode] })}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </CardContainer>
          )}
        </CardContainer>
      </form>
    </Form>
  );
}

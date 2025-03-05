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
import { PhoneInput, PhoneValue } from '@/components/ui/phone-input';
import { Separator } from '@/components/ui/separator';
import { ContactInfoFormData } from '@/schemas/registration';
import { CountryCode } from '@/lib/autocomplete-datas';
import { useSearchParams } from 'next/navigation';
import CardContainer from '../layouts/card-container';
import { MultiSelect } from '../ui/multi-select';
import { FamilyLink } from '@prisma/client';
import { CountrySelect } from '../ui/country-select';

interface ContactInfoFormProps {
  form: UseFormReturn<ContactInfoFormData>;
  onSubmitAction: (data: ContactInfoFormData) => Promise<void>;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
}

const residenceCountry = process.env.NEXT_PUBLIC_RESIDENT_COUNTRY_CODE as
  | CountryCode
  | undefined;
const homeLandCountryCode = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as
  | CountryCode
  | undefined;

export function ContactInfoForm({
  form,
  onSubmitAction,
  formRef,
  isLoading = false,
}: Readonly<ContactInfoFormProps>) {
  const params = useSearchParams();
  const residenceCountryCode = (params.get('country') as CountryCode) ?? residenceCountry;
  const t_countries = useTranslations('countries');
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmitAction)}>
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
              <FormItem className="col-span-full w-full sm:col-span-1">
                <FormLabel>{t('form.phone')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    value={field.value as unknown as PhoneValue}
                    placeholder={t_inputs('phone.placeholder')}
                    disabled={isLoading}
                    error={!!form.formState.errors.phone}
                    options={residenceCountryCode ? [residenceCountryCode] : undefined}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-full" />

          {/* Current Address */}
          <fieldset className="sm:col-span-full grid grid-cols-2 gap-4">
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
            contentClass="col-span-full grid sm:grid-cols-2 gap-4 p-4"
            title={t_inputs('emergencyContact.labelIn', {
              country: `${t_countries(residenceCountryCode as CountryCode)}`,
            })}
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
                <FormItem className="sm:col-span-full">
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
              name="residentContact.phone"
              render={({ field }) => (
                <FormItem className="col-span-full w-full sm:col-span-1">
                  <FormLabel>{t_inputs('phone.label')}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      value={field.value as unknown as PhoneValue}
                      placeholder={t_inputs('phone.placeholder')}
                      disabled={isLoading}
                      error={!!form.formState.errors.phone}
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

          {/* Home Land Contact */}
          <CardContainer
            className="col-span-full"
            headerClass="p-4"
            contentClass="col-span-full grid sm:grid-cols-2 gap-4 p-4"
            title={t_inputs('emergencyContact.labelIn', {
              country: `${t_countries(homeLandCountryCode as CountryCode)}`,
            })}
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
                <FormItem className="sm:col-span-full">
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
              name="homeLandContact.phone"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>{t_inputs('phone.label')}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      value={field.value as unknown as PhoneValue}
                      placeholder={t_inputs('phone.placeholder')}
                      disabled={isLoading}
                      error={!!form.formState.errors.phone}
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
        </CardContainer>
      </form>
    </Form>
  );
}

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
import { Card, CardContent } from '@/components/ui/card';
import { AddressInput } from '@/components/ui/address-input';
import { CountryCode } from '@/lib/autocomplete-datas';

interface ContactInfoFormProps {
  form: UseFormReturn<ContactInfoFormData>;
  onSubmit: (data: ContactInfoFormData) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
}

const residenceCountryCode = process.env.NEXT_PUBLIC_RESIDENCE_COUNTRY_CODE;
const homeLandCountryCode = process.env.NEXT_PUBLIC_HOME_LAND_COUNTRY_CODE;

export function ContactInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
}: Readonly<ContactInfoFormProps>) {
  const t = useTranslations('registration');
  const t_countries = useTranslations('countries');
  const t_inputs = useTranslations('inputs');

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
            <div className="col-span-full">
              <AddressInput
                label={t_inputs('address.labelIn', {
                  country: `${t_countries(residenceCountryCode as CountryCode)}`,
                })}
                value={form.getValues('address')}
                onChange={(value) => form.setValue('address', value)}
                disabled={isLoading}
              />
            </div>

            <Separator className="col-span-full" />

            {/* Resident Contact */}
            <div className="col-span-full grid space-y-4">
              <h2 className="text-lg font-medium">
                {t_inputs('emergencyContact.labelIn', {
                  country: `${t_countries(residenceCountryCode as CountryCode)}`,
                })}
              </h2>

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="residentContact.firstName"
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
                  name="residentContact.lastName"
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
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="residentContact.email"
                render={({ field }) => (
                  <FormItem className="col-span-full w-full md:col-span-1">
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
                  <FormItem className="col-span-full w-full md:col-span-1">
                    <FormLabel>{t_inputs('phone.label')}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        value={field.value as unknown as PhoneValue}
                        placeholder={t_inputs('phone.placeholder')}
                        disabled={isLoading}
                        error={!!form.formState.errors.phone}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full">
                <AddressInput
                  label={t_inputs('address.label')}
                  value={form.getValues('residentContact.address')}
                  onChange={(value) => form.setValue('residentContact.address', value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Home Land Contact */}
            <div className="col-span-full grid space-y-4">
              <h2 className="text-lg font-medium">
                {t_inputs('emergencyContact.labelIn', {
                  country: `${t_countries(homeLandCountryCode as CountryCode)}`,
                })}
              </h2>

              <div className="grid gap-4">
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
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="homeLandContact.email"
                render={({ field }) => (
                  <FormItem className="col-span-full w-full md:col-span-1">
                    <FormLabel>{t_inputs('email.label')}</FormLabel>
                    <FormControl>
                      @
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
                  <FormItem className="col-span-full w-full md:col-span-1">
                    <FormLabel>{t_inputs('phone.label')}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        value={field.value as unknown as PhoneValue}
                        placeholder={t_inputs('phone.placeholder')}
                        disabled={isLoading}
                        error={!!form.formState.errors.phone}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full">
                <AddressInput
                  label={t_inputs('address.label')}
                  value={form.getValues('homeLandContact.address')}
                  onChange={(value) => form.setValue('homeLandContact.address', value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

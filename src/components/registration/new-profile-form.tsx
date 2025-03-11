'use client';

import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { PhoneInput } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';
import { type CountryCode } from '@/lib/autocomplete-datas';
import type { z } from 'zod';
import { CreateProfileInput, CreateProfileSchema } from '@/schemas/registration';

type NewProfileFormValues = z.infer<typeof CreateProfileSchema>;

interface NewProfileFormProps {
  form: ReturnType<typeof useForm<CreateProfileInput>>;
  onSubmitAction: (data: NewProfileFormValues) => void;
  isLoading: boolean;
}

export function NewProfileForm({ form, onSubmitAction, isLoading }: NewProfileFormProps) {
  const t = useTranslations('inputs');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('firstName.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('firstName.placeholder')} {...field} />
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
              <FormLabel>{t('lastName.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('lastName.placeholder')} {...field} />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="residenceCountyCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('country.label')}</FormLabel>
              <FormControl>
                <CountrySelect
                  type="single"
                  selected={field.value as CountryCode}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('email.placeholder')} {...field} />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t('phone.label')}</FormLabel>
          <PhoneInput parentForm={form} fieldName="phone" />
        </FormItem>
      </form>
    </Form>
  );
}

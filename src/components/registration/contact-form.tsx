'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { type ContactInfoFormData, ContactInfoSchema } from '@/schemas/registration';
import { type CountryCode } from '@/lib/autocomplete-datas';
import { CountrySelect } from '../ui/country-select';
import { type CompleteProfile } from '@/types/convex-profile';
import { PhoneInput } from '../ui/phone-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ContactInfoFormProps {
  profile: CompleteProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ContactInfoForm({
  profile,
  onSave,
  banner,
  onNext,
  onPrevious,
}: Readonly<ContactInfoFormProps>) {
  if (!profile) return null;
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateContacts = useMutation(api.functions.profile.updateContacts);

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: {
      email: profile.contacts?.email ?? '',
      phone: profile.contacts?.phone ?? '',
      address: profile.contacts?.address ?? {
        street: profile.contacts?.address?.street ?? '',
        city: profile.contacts?.address?.city ?? '',
        country: profile.contacts?.address?.country ?? profile.residenceCountry ?? '',
        postalCode: profile.contacts?.address?.postalCode ?? '',
        complement: profile.contacts?.address?.complement ?? '',
      },
    },
    reValidateMode: 'onBlur',
  });

  const handleSubmit = async (data: ContactInfoFormData) => {
    setIsLoading(true);
    try {
      await updateContacts({
        profileId: profile._id,
        contacts: data,
      });

      toast({
        title: t_inputs('success.title'),
        description: t_inputs('success.description'),
      });

      onSave();
      if (onNext) onNext();
    } catch (error) {
      toast({
        title: t_inputs('error.title'),
        description: t_inputs('error.description'),
        variant: 'destructive',
      });
      console.error('Failed to update contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {banner}
        <div className="grid grid-cols-2 gap-6 pt-4">
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
                    value={field.value ?? ''}
                    type="email"
                    placeholder={t('form.email_placeholder')}
                    autoComplete="email"
                    disabled={Boolean(profile.contacts?.email) || isLoading}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormLabel>{t_inputs('phone.label')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={Boolean(profile.contacts?.phone) || isLoading}
                    countries={
                      profile.residenceCountry
                        ? [profile.residenceCountry as any]
                        : undefined
                    }
                    defaultCountry={
                      profile.residenceCountry
                        ? (profile.residenceCountry as any)
                        : undefined
                    }
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
              name="address.street"
              render={({ field }) => (
                <FormItem className={'col-span-full sm:col-span-1'}>
                  <FormLabel>{t_inputs('address.street.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t_inputs('address.street.placeholder')}
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
              name="address.complement"
              render={({ field }) => (
                <FormItem className={'col-span-full sm:col-span-1'}>
                  <FormLabel>{t_inputs('address.complement.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t_inputs('address.complement.placeholder')}
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
                        value={field.value ?? ''}
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
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('address.postalCode.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t_inputs('address.postalCode.placeholder')}
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
                      {...(profile.residenceCountry && {
                        options: [profile.residenceCountry as CountryCode],
                      })}
                      disabled={Boolean(isLoading || profile.residenceCountry)}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </fieldset>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          {onPrevious && (
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              leftIcon={<ArrowLeft className="size-icon" />}
            >
              Précédent
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            rightIcon={<ArrowRight className="size-icon" />}
          >
            Enregistrer et continuer
          </Button>
        </div>
      </form>
    </Form>
  );
}

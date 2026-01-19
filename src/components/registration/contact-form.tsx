'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { PhoneInput } from '../ui/phone-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { CompleteProfile } from '@/convex/lib/types';
import { getFieldLabel, getInvalidFields } from '@/lib/utils';
import { FamilyLink, EmergencyContactType } from '@/convex/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
      emergencyContacts:
        profile.emergencyContacts && profile.emergencyContacts.length >= 2
          ? profile.emergencyContacts
          : [
              {
                type: EmergencyContactType.HomeLand,
                firstName: '',
                lastName: '',
                relationship: 'other' as any,
                address: {
                  street: '',
                  city: '',
                  country: 'GA',
                  postalCode: '',
                },
              },
              {
                type: EmergencyContactType.Resident,
                firstName: '',
                lastName: '',
                relationship: 'other' as any,
                address: {
                  street: '',
                  city: '',
                  country: profile.residenceCountry ?? '',
                  postalCode: '',
                },
              },
            ],
    },
    reValidateMode: 'onBlur',
  });

  const { fields: emergencyContactFields } = useFieldArray({
    control: form.control,
    name: 'emergencyContacts',
  });

  const handleSubmit = async (data: ContactInfoFormData) => {
    setIsLoading(true);
    try {
      const { emergencyContacts, ...contacts } = data;
      await updateContacts({
        profileId: profile._id,
        contacts,
        emergencyContacts,
      });

      toast.success(t_inputs('success.title'), {
        description: t_inputs('success.description'),
      });

      onSave();
      if (onNext) onNext();
    } catch (error) {
      toast.error(t_inputs('error.title'), {
        description: t_inputs('error.description'),
      });
      console.error('Failed to update contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalid = (errors: any) => {
    const invalidFields = getInvalidFields(errors)
      .map((field) => getFieldLabel(field, t_inputs))
      .join(', ');

    toast.error('Champs invalides ou manquants', {
      description: invalidFields
        ? `Champs à corriger : ${invalidFields}`
        : 'Veuillez corriger les champs invalides avant de continuer',
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="space-y-6"
      >
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

        <Separator className="col-span-full" />

        {/* Emergency Contacts */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Contacts d'urgence</h3>
          <p className="text-sm text-muted-foreground">
            Veuillez renseigner deux contacts d'urgence : une personne au Gabon et une
            personne dans votre pays de résidence.
          </p>

          <div className="grid gap-6 ">
            {emergencyContactFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-sm">
                  {index === 0 ? 'Contact au Gabon' : 'Contact pays de résidence'}
                </h4>

                {/* First Name */}
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${index}.firstName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t_inputs('firstName.placeholder')}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${index}.lastName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t_inputs('lastName.placeholder')}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {/* Relationship */}
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${index}.relationship`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('familyLink.label')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t_inputs('familyLink.placeholder')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(FamilyLink).map((link) => (
                            <SelectItem key={link} value={link}>
                              {t_inputs(`familyLink.options.${link}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${index}.phoneNumber`}
                  render={({ field: phoneField }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('phone.label')}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={phoneField.value ?? ''}
                          onChange={phoneField.onChange}
                          defaultCountry={
                            form.watch(
                              `emergencyContacts.${index}.address.country`,
                            ) as any
                          }
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name={`emergencyContacts.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('email.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t_inputs('email.placeholder')}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Address */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium">Adresse</h5>
                  {/* Street */}
                  <FormField
                    control={form.control}
                    name={`emergencyContacts.${index}.address.street`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t_inputs('address.street.label')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t_inputs('address.street.placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Complement */}
                  <FormField
                    control={form.control}
                    name={`emergencyContacts.${index}.address.complement`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t_inputs('address.complement.label')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder={t_inputs('address.complement.placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City and Postal Code */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name={`emergencyContacts.${index}.address.city`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t_inputs('address.city.label')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t_inputs('address.city.placeholder')}
                            />
                          </FormControl>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Postal Code */}
                    <FormField
                      control={form.control}
                      name={`emergencyContacts.${index}.address.postalCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t_inputs('address.postalCode.label')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder={t_inputs('address.postalCode.placeholder')}
                            />
                          </FormControl>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Country - Readonly/Disabled to enforce requirement */}
                  <FormField
                    control={form.control}
                    name={`emergencyContacts.${index}.address.country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t_inputs('address.country.label')}</FormLabel>
                        <FormControl>
                          <CountrySelect
                            type="single"
                            selected={field.value as CountryCode}
                            onChange={field.onChange}
                            disabled={true}
                            options={field.value ? [field.value as CountryCode] : []}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
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

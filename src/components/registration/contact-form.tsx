'use client';

import React, { useState } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from '@/components/ui/field';
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
import { getFieldLabel } from '@/lib/utils';
import { handleFormInvalid } from '@/lib/form/validation';
import { FamilyLink, EmergencyContactType } from '@/convex/lib/constants';
import { getAutocompleteForField, getEmergencyContactAutocomplete } from '@/lib/form/autocomplete';
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
    mode: 'onBlur',
    reValidateMode: 'onChange',
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
    handleFormInvalid(errors, (field) => getFieldLabel(field, t_inputs));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="space-y-6"
      >
        {banner}
        <div className="grid grid-cols-2 gap-6 pt-4">
          <Field name="email" control={form.control} className="col-span-full sm:col-span-1">
            <FieldLabel>{t('form.email')}</FieldLabel>
            <Input
              {...form.register('email')}
              value={form.watch('email') ?? ''}
              type="email"
              placeholder={t('form.email_placeholder')}
              autoComplete={getAutocompleteForField('email')}
              disabled={Boolean(profile.contacts?.email) || isLoading}
            />
            <FieldError />
          </Field>

          <Field name="phone" control={form.control} className="sm:col-span-1">
            <FieldLabel>{t_inputs('phone.label')}</FieldLabel>
            <PhoneInput
              value={form.watch('phone') ?? ''}
              onChange={(val) => form.setValue('phone', val)}
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
              autoComplete={getAutocompleteForField('phone')}
            />
            <FieldError />
          </Field>

          <Separator className="col-span-full" />

          <FieldSet className="col-span-full grid grid-cols-2 gap-4">
            <FieldLegend variant="label">Adresse actuelle</FieldLegend>
            
            <Field name="address.street" control={form.control} className="col-span-full sm:col-span-1">
              <FieldLabel>{t_inputs('address.street.label')}</FieldLabel>
              <Input
                {...form.register('address.street')}
                value={form.watch('address.street') ?? ''}
                placeholder={t_inputs('address.street.placeholder')}
                disabled={isLoading}
                autoComplete={getAutocompleteForField('street')}
              />
              <FieldError />
            </Field>

            <Field name="address.complement" control={form.control} className="col-span-full sm:col-span-1">
              <FieldLabel>{t_inputs('address.complement.label')}</FieldLabel>
              <Input
                {...form.register('address.complement')}
                value={form.watch('address.complement') ?? ''}
                placeholder={t_inputs('address.complement.placeholder')}
                disabled={isLoading}
                autoComplete={getAutocompleteForField('complement')}
              />
              <FieldError />
            </Field>

            <div className="col-span-full grid grid-cols-3 gap-2">
              <Field name="address.city" control={form.control} className="col-span-2">
                <FieldLabel>{t_inputs('address.city.label')}</FieldLabel>
                <Input
                  {...form.register('address.city')}
                  value={form.watch('address.city') ?? ''}
                  placeholder={t_inputs('address.city.placeholder')}
                  disabled={isLoading}
                  autoComplete={getAutocompleteForField('city')}
                />
                <FieldError />
              </Field>

              <Field name="address.postalCode" control={form.control}>
                <FieldLabel>{t_inputs('address.postalCode.label')}</FieldLabel>
                <Input
                  {...form.register('address.postalCode')}
                  value={form.watch('address.postalCode') ?? ''}
                  placeholder={t_inputs('address.postalCode.placeholder')}
                  disabled={isLoading}
                  autoComplete={getAutocompleteForField('postalCode')}
                />
                <FieldError />
              </Field>
            </div>

            <Field name="address.country" control={form.control} className="col-span-full">
              <FieldLabel>{t_inputs('address.country.label')}</FieldLabel>
              <CountrySelect
                type="single"
                selected={form.watch('address.country') as CountryCode}
                onChange={(val) => form.setValue('address.country', val)}
                {...(profile.residenceCountry && {
                  options: [profile.residenceCountry as CountryCode],
                })}
                disabled={Boolean(isLoading || profile.residenceCountry)}
              />
              <FieldError />
            </Field>
          </FieldSet>
        </div>

        <Separator className="col-span-full" />

        <FieldSet className="space-y-6">
          <FieldLegend>Contacts d&apos;urgence</FieldLegend>
          <FieldDescription>
            Veuillez renseigner deux contacts d&apos;urgence : une personne au Gabon et une
            personne dans votre pays de résidence.
          </FieldDescription>

          <FieldGroup>
            {emergencyContactFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-sm">
                  {index === 0 ? 'Contact au Gabon' : 'Contact pays de résidence'}
                </h4>

                <FieldGroup>
                  <Field name={`emergencyContacts.${index}.firstName`} control={form.control}>
                    <FieldLabel>{t_inputs('firstName.label')}</FieldLabel>
                    <Input
                      {...form.register(`emergencyContacts.${index}.firstName`)}
                      value={form.watch(`emergencyContacts.${index}.firstName`) ?? ''}
                      placeholder={t_inputs('firstName.placeholder')}
                      autoComplete={getEmergencyContactAutocomplete('firstName', index as 0 | 1)}
                    />
                    <FieldError />
                  </Field>

                  <Field name={`emergencyContacts.${index}.lastName`} control={form.control}>
                    <FieldLabel>{t_inputs('lastName.label')}</FieldLabel>
                    <Input
                      {...form.register(`emergencyContacts.${index}.lastName`)}
                      value={form.watch(`emergencyContacts.${index}.lastName`) ?? ''}
                      placeholder={t_inputs('lastName.placeholder')}
                      autoComplete={getEmergencyContactAutocomplete('lastName', index as 0 | 1)}
                    />
                    <FieldError />
                  </Field>

                  <Controller
                    name={`emergencyContacts.${index}.relationship`}
                    control={form.control}
                    render={({ field: formField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`emergency-contact-${index}-relationship`}>
                          {t_inputs('familyLink.label')}
                        </FieldLabel>
                        <Select
                          onValueChange={formField.onChange}
                          defaultValue={formField.value}
                          value={formField.value}
                        >
                          <SelectTrigger
                            id={`emergency-contact-${index}-relationship`}
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder={t_inputs('familyLink.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(FamilyLink).map((link) => (
                              <SelectItem key={link} value={link}>
                                {t_inputs(`familyLink.options.${link}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Field name={`emergencyContacts.${index}.phoneNumber`} control={form.control}>
                    <FieldLabel>{t_inputs('phone.label')}</FieldLabel>
                    <PhoneInput
                      value={form.watch(`emergencyContacts.${index}.phoneNumber`) ?? ''}
                      onChange={(val) => form.setValue(`emergencyContacts.${index}.phoneNumber`, val)}
                      defaultCountry={
                        form.watch(
                          `emergencyContacts.${index}.address.country`,
                        ) as any
                      }
                      autoComplete={getEmergencyContactAutocomplete('phone', index as 0 | 1, 'mobile')}
                    />
                    <FieldError />
                  </Field>

                  <Field name={`emergencyContacts.${index}.email`} control={form.control}>
                    <FieldLabel>{t_inputs('email.label')}</FieldLabel>
                    <Input
                      {...form.register(`emergencyContacts.${index}.email`)}
                      value={form.watch(`emergencyContacts.${index}.email`) ?? ''}
                      type="email"
                      placeholder={t_inputs('email.placeholder')}
                      autoComplete={getEmergencyContactAutocomplete('email', index as 0 | 1)}
                    />
                    <FieldError />
                  </Field>
                </FieldGroup>

                <Separator />

                <FieldSet className="space-y-4">
                  <FieldLegend variant="label">Adresse</FieldLegend>
                  
                  <Field name={`emergencyContacts.${index}.address.street`} control={form.control}>
                    <FieldLabel>{t_inputs('address.street.label')}</FieldLabel>
                    <Input
                      {...form.register(`emergencyContacts.${index}.address.street`)}
                      value={form.watch(`emergencyContacts.${index}.address.street`) ?? ''}
                      placeholder={t_inputs('address.street.placeholder')}
                      autoComplete={getEmergencyContactAutocomplete('street', index as 0 | 1)}
                    />
                    <FieldError />
                  </Field>

                  <Field name={`emergencyContacts.${index}.address.complement`} control={form.control}>
                    <FieldLabel>{t_inputs('address.complement.label')}</FieldLabel>
                    <Input
                      {...form.register(`emergencyContacts.${index}.address.complement`)}
                      value={form.watch(`emergencyContacts.${index}.address.complement`) ?? ''}
                      placeholder={t_inputs('address.complement.placeholder')}
                      autoComplete={getEmergencyContactAutocomplete('complement', index as 0 | 1)}
                    />
                    <FieldError />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field name={`emergencyContacts.${index}.address.city`} control={form.control}>
                      <FieldLabel>{t_inputs('address.city.label')}</FieldLabel>
                      <Input
                        {...form.register(`emergencyContacts.${index}.address.city`)}
                        value={form.watch(`emergencyContacts.${index}.address.city`) ?? ''}
                        placeholder={t_inputs('address.city.placeholder')}
                        autoComplete={getEmergencyContactAutocomplete('city', index as 0 | 1)}
                      />
                      <FieldError />
                    </Field>

                    <Field name={`emergencyContacts.${index}.address.postalCode`} control={form.control}>
                      <FieldLabel>{t_inputs('address.postalCode.label')}</FieldLabel>
                      <Input
                        {...form.register(`emergencyContacts.${index}.address.postalCode`)}
                        value={form.watch(`emergencyContacts.${index}.address.postalCode`) ?? ''}
                        placeholder={t_inputs('address.postalCode.placeholder')}
                        autoComplete={getEmergencyContactAutocomplete('postalCode', index as 0 | 1)}
                      />
                      <FieldError />
                    </Field>
                  </div>

                  <Field name={`emergencyContacts.${index}.address.country`} control={form.control}>
                    <FieldLabel>{t_inputs('address.country.label')}</FieldLabel>
                    <CountrySelect
                      type="single"
                      selected={form.watch(`emergencyContacts.${index}.address.country`) as CountryCode}
                      onChange={(val) => form.setValue(`emergencyContacts.${index}.address.country`, val)}
                      disabled={true}
                      options={form.watch(`emergencyContacts.${index}.address.country`) ? [form.watch(`emergencyContacts.${index}.address.country`) as CountryCode] : []}
                    />
                    <FieldError />
                  </Field>
                </FieldSet>
              </div>
            ))}
          </FieldGroup>
        </FieldSet>

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

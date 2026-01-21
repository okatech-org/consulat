'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Gender, NationalityAcquisition, CountryCode } from '@/convex/lib/constants';
import {
  ChildBasicInfoSchema,
  type ChildBasicInfoFormData,
} from '@/schemas/child-registration';
import { CountrySelect } from '@/components/ui/country-select';
import { capitalize } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import type { CompleteChildProfile } from '@/convex/lib/types';

type ChildBasicInfoFormProps = {
  profile: CompleteChildProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onPrevious: () => void;
};

export function ChildBasicInfoForm({
  profile,
  onSave,
  banner,
  onPrevious,
}: Readonly<ChildBasicInfoFormProps>) {
  const t_inputs = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);

  const updateChildPersonalInfo = useMutation(
    api.functions.childProfile.updateChildPersonalInfo,
  );

  const form = useForm<ChildBasicInfoFormData>({
    resolver: zodResolver(ChildBasicInfoSchema),
    defaultValues: {
      firstName: profile.personal?.firstName || '',
      lastName: profile.personal?.lastName || '',
      birthDate: profile.personal?.birthDate
        ? new Date(profile.personal.birthDate).toISOString().split('T')[0]
        : undefined,
      birthPlace: profile.personal?.birthPlace || '',
      birthCountry: profile.personal?.birthCountry || '',
      gender: profile.personal?.gender || Gender.Male,
      nationality: profile.personal?.nationality || '',
      acquisitionMode: profile.personal?.acquisitionMode || NationalityAcquisition.Birth,
      passportInfos: profile.personal?.passportInfos
        ? {
            ...profile.personal.passportInfos,
            issueDate: profile.personal.passportInfos.issueDate
              ? new Date(profile.personal.passportInfos.issueDate)
                  .toISOString()
                  .split('T')[0]
              : undefined,
            expiryDate: profile.personal.passportInfos.expiryDate
              ? new Date(profile.personal.passportInfos.expiryDate)
                  .toISOString()
                  .split('T')[0]
              : undefined,
          }
        : undefined,
      nipCode: profile.personal?.nipCode || '',
    },
    reValidateMode: 'onBlur',
  });

  const handleSubmit = async (data: ChildBasicInfoFormData) => {
    setIsLoading(true);
    try {
      await updateChildPersonalInfo({
        childProfileId: profile._id,
        personal: {
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate ? new Date(data.birthDate).getTime() : undefined,
          birthPlace: data.birthPlace,
          // @ts-expect-error Schema uses string but Convex expects CountryCode enum
          birthCountry: data.birthCountry as CountryCode | undefined,
          gender: data.gender,
          // @ts-expect-error Schema uses string but Convex expects CountryCode enum
          nationality: data.nationality as CountryCode | undefined,
          acquisitionMode: data.acquisitionMode,
          passportInfos: data.passportInfos
            ? {
                number: data.passportInfos.number,
                issueDate: data.passportInfos.issueDate
                  ? new Date(data.passportInfos.issueDate).getTime()
                  : undefined,
                expiryDate: data.passportInfos.expiryDate
                  ? new Date(data.passportInfos.expiryDate).getTime()
                  : undefined,
                issueAuthority: data.passportInfos.issueAuthority,
              }
            : undefined,
          nipCode: data.nipCode,
        },
      });

      toast.success(t_inputs('success.title'), {
        description: t_inputs('success.description'),
      });

      onSave();
    } catch (error) {
      toast.error(t_inputs('error.title'), {
        description: t_inputs('error.description'),
      });
      console.error('Failed to update child personal info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = async (data: ChildBasicInfoFormData) => {
    await handleSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        {banner}
        <FieldGroup className="pt-4">
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t_inputs('gender.label')}</FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  className="flex flex-row space-x-4"
                  aria-invalid={fieldState.invalid}
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="male" id="child-gender-male" />
                    <Label htmlFor="child-gender-male" className="font-normal">
                      {t_inputs('gender.options.male')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="female" id="child-gender-female" />
                    <Label htmlFor="child-gender-female" className="font-normal">
                      {t_inputs('gender.options.female')}
                    </Label>
                  </div>
                </RadioGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="child-firstName">
                    {t_inputs('firstName.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="child-firstName"
                    onChange={(e) => {
                      field.onChange(capitalize(e.target.value));
                    }}
                    placeholder={t_inputs('firstName.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="child-lastName">
                    {t_inputs('lastName.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="child-lastName"
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase());
                    }}
                    placeholder={t_inputs('lastName.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="birthDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="child-birthDate">
                    {t_inputs('birthDate.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="child-birthDate"
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : ''
                    }
                    type="date"
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="birthPlace"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="child-birthPlace">
                    {t_inputs('birthPlace.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="child-birthPlace"
                    placeholder={t_inputs('birthPlace.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="birthCountry"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="child-birthCountry">
                  {t_inputs('birthCountry.label')}
                </FieldLabel>
                <CountrySelect
                  id="child-birthCountry"
                  type="single"
                  // @ts-expect-error Form field is string but CountrySelect expects CountryCode enum
                  selected={field.value ? (field.value as CountryCode) : undefined}
                  onChange={(value) => {
                    field.onChange(value as string);
                  }}
                  disabled={isLoading}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="nationality"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="child-nationality">
                  {t_inputs('nationality.label')}
                </FieldLabel>
                <CountrySelect
                  id="child-nationality"
                  type="single"
                  // @ts-expect-error Form field is string but CountrySelect expects CountryCode enum
                  selected={field.value ? (field.value as CountryCode) : undefined}
                  onChange={(value) => {
                    field.onChange(value as string);
                  }}
                  disabled={isLoading}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="acquisitionMode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-base">
                  {t_inputs('nationality_acquisition.label')}
                </FieldLabel>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap items-center gap-4"
                  disabled={isLoading}
                  aria-invalid={fieldState.invalid}
                >
                  {Object.values(NationalityAcquisition).map((acquisition) => (
                    <div key={acquisition} className="flex items-center gap-2">
                      <RadioGroupItem value={acquisition} id={`child-acquisition-${acquisition}`} />
                      <Label htmlFor={`child-acquisition-${acquisition}`} className="font-normal">
                        {t_inputs(`nationality_acquisition.options.${acquisition}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <FieldSet className="space-y-4">
            <FieldLegend variant="label">Informations passeport (optionnel)</FieldLegend>
            
            <Controller
              name="passportInfos.number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="child-passport-number">
                    {t_inputs('passport.number.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="child-passport-number"
                    value={field.value || ''}
                    placeholder={t_inputs('passport.number.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="passportInfos.issueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="child-passport-issue-date">
                      {t_inputs('passport.issueDate.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="child-passport-issue-date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      placeholder={t_inputs('passport.issueDate.placeholder')}
                      disabled={isLoading}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="passportInfos.expiryDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="child-passport-expiry-date">
                      {t_inputs('passport.expiryDate.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="child-passport-expiry-date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                      type="date"
                      placeholder={t_inputs('passport.expiryDate.placeholder')}
                      disabled={isLoading}
                      min={new Date().toISOString().split('T')[0]}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="passportInfos.issueAuthority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="child-passport-authority">
                    {t_inputs('passport.issueAuthority.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="child-passport-authority"
                    value={field.value || ''}
                    placeholder={t_inputs('passport.issueAuthority.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>

          <Controller
            name="nipCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="child-nip">
                  {t_inputs('nipNumber.label')}
                </FieldLabel>
                <Input
                  {...field}
                  id="child-nip"
                  value={field.value || ''}
                  type="text"
                  placeholder={t_inputs('nipNumber.placeholder')}
                  disabled={isLoading}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button
            onClick={onPrevious}
            variant="outline"
            disabled={isLoading}
          >
            Précédent
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
          >
            {form.formState.isDirty ? 'Enregistrer et continuer' : 'Continuer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

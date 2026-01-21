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
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { Gender, NationalityAcquisition } from '@/convex/lib/constants';
import { BasicInfoSchema, type BasicInfoFormData } from '@/schemas/registration';
import { Separator } from '@/components/ui/separator';
import { CountrySelect } from '@/components/ui/country-select';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '../documents/user-document';
import { capitalize, filterUneditedKeys, getFieldLabel } from '@/lib/utils';
import { handleFormInvalid } from '@/lib/form/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CompleteProfile } from '@/convex/lib/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { getAutocompleteForField } from '@/lib/form/autocomplete';

type BasicInfoFormProps = {
  profile: CompleteProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onPrevious: () => void;
};

export function BasicInfoForm({
  profile,
  onSave,
  banner,
  onPrevious,
}: Readonly<BasicInfoFormProps>) {
  if (!profile) return null;
  const t_inputs = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);

  const updatePersonalInfo = useMutation(api.functions.profile.updatePersonalInfo);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      ...profile.personal,

      birthDate: profile.personal?.birthDate
        ? new Date(profile.personal.birthDate).toISOString().split('T')[0]
        : undefined,
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
      nationality: profile.personal?.nationality,
      gender: profile.personal?.gender ?? Gender.Male,
      acquisitionMode: profile.personal?.acquisitionMode ?? NationalityAcquisition.Birth,
      identityPicture: profile.identityPicture ? { ...profile.identityPicture } : null,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // Effect to sync identityPicture field with profile prop
  React.useEffect(() => {
    if (profile.identityPicture) {
      form.setValue('identityPicture', profile.identityPicture as any);
    } else {
      form.setValue('identityPicture', null);
    }
  }, [profile.identityPicture, form]);

  const handleSubmit = async (data: BasicInfoFormData) => {
    // Identity picture is handled separately in UserDocument component
    const { identityPicture, ...personalData } = data;

    filterUneditedKeys(data, form.formState.dirtyFields);

    setIsLoading(true);
    try {
      await updatePersonalInfo({
        profileId: profile._id,
        personal: {
          ...personalData,
          birthCountry: personalData.birthCountry as any,
          nationality: personalData.nationality as any,
          birthDate: data.birthDate ? new Date(data.birthDate).getTime() : undefined,
          passportInfos: data.passportInfos
            ? {
                ...data.passportInfos,
                issueDate: data.passportInfos.issueDate
                  ? new Date(data.passportInfos.issueDate).getTime()
                  : undefined,
                expiryDate: data.passportInfos.expiryDate
                  ? new Date(data.passportInfos.expiryDate).getTime()
                  : undefined,
              }
            : undefined,
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
      console.error('Failed to update personal info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = async (data: BasicInfoFormData) => {
    await handleSubmit(data);
    onSave();
  };

  const handleInvalid = (errors: any) => {
    handleFormInvalid(errors, (field) => getFieldLabel(field, t_inputs));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit, handleInvalid)}
        className="space-y-6"
      >
        {banner}
        <FieldGroup className="pt-4">
          <Controller
            name="identityPicture"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="max-w-md" data-invalid={fieldState.invalid}>
                <UserDocument
                  document={field.value as any}
                  expectedType={DocumentType.IdentityPhoto}
                  label={t_inputs('identityPicture.label')}
                  description={t_inputs('identityPicture.help')}
                  required={true}
                  disabled={isLoading}
                  onUpload={(doc: any) => {
                    field.onChange(doc);
                  }}
                  onDelete={() => {
                    field.onChange(null);
                  }}
                  accept="image/*"
                  enableEditor={true}
                  enableBackgroundRemoval={true}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

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
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male" className="font-normal">
                      {t_inputs('gender.options.male')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="female" id="gender-female" />
                    <Label htmlFor="gender-female" className="font-normal">
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
                  <FieldLabel htmlFor="basic-info-firstName">
                    {t_inputs('firstName.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-firstName"
                    onChange={(e) => {
                      field.onChange(capitalize(e.target.value));
                    }}
                    placeholder={t_inputs('firstName.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('firstName')}
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
                  <FieldLabel htmlFor="basic-info-lastName">
                    {t_inputs('lastName.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-lastName"
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase());
                    }}
                    placeholder={t_inputs('lastName.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('lastName')}
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
                  <FieldLabel htmlFor="basic-info-birthDate">
                    {t_inputs('birthDate.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-birthDate"
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : ''
                    }
                    type="date"
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('birthDate')}
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
                  <FieldLabel htmlFor="basic-info-birthPlace">
                    {t_inputs('birthPlace.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-birthPlace"
                    placeholder={t_inputs('birthPlace.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('birthPlace')}
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
                <FieldLabel htmlFor="basic-info-birthCountry">
                  {t_inputs('birthCountry.label')}
                </FieldLabel>
                <CountrySelect
                  id="basic-info-birthCountry"
                  type="single"
                  selected={field.value as CountryCode}
                  onChange={(val) => field.onChange(val)}
                  disabled={isLoading}
                  autoComplete={getAutocompleteForField('birthCountry')}
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
                <FieldLabel htmlFor="basic-info-nationality">
                  {t_inputs('nationality.label')}
                </FieldLabel>
                <CountrySelect
                  id="basic-info-nationality"
                  type="single"
                  selected={field.value as CountryCode}
                  onChange={(val) => field.onChange(val)}
                  disabled={isLoading}
                  autoComplete={getAutocompleteForField('nationality')}
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
                      <RadioGroupItem value={acquisition} id={`acquisition-${acquisition}`} />
                      <Label htmlFor={`acquisition-${acquisition}`} className="font-normal">
                        {t_inputs(`nationality_acquisition.options.${acquisition}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Separator className="w-full" />

          <FieldSet>
            <FieldLegend variant="label">Informations passeport</FieldLegend>
            
            <Controller
              name="passportInfos.number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-info-passport-number">
                    {t_inputs('passport.number.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-passport-number"
                    value={field.value || ''}
                    placeholder={t_inputs('passport.number.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('passportNumber')}
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
                    <FieldLabel htmlFor="basic-info-passport-issue-date">
                      {t_inputs('passport.issueDate.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="basic-info-passport-issue-date"
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
                      autoComplete={getAutocompleteForField('issueDate')}
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
                    <FieldLabel htmlFor="basic-info-passport-expiry-date">
                      {t_inputs('passport.expiryDate.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="basic-info-passport-expiry-date"
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
                      autoComplete={getAutocompleteForField('expiryDate')}
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
                  <FieldLabel htmlFor="basic-info-passport-authority">
                    {t_inputs('passport.issueAuthority.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-passport-authority"
                    value={field.value || ''}
                    placeholder={t_inputs('passport.issueAuthority.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('issuingAuthority')}
                  />
                  <FieldDescription>
                    {t_inputs('passport.issueAuthority.help')}
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="nipCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-info-nip">
                    {t_inputs('nipNumber.label')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="basic-info-nip"
                    value={field.value || ''}
                    type="text"
                    placeholder={t_inputs('nipNumber.placeholder')}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                    autoComplete={getAutocompleteForField('nipCode')}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>
        </FieldGroup>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button onClick={onPrevious} variant="outline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Précédent
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {form.formState.isDirty ? 'Enregistrer et continuer' : 'Continuer'}
            {!isLoading && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

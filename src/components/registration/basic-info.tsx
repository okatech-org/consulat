'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useTranslations } from 'next-intl';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { Gender, NationalityAcquisition } from '@/convex/lib/constants';
import { BasicInfoSchema, type BasicInfoFormData } from '@/schemas/registration';
import { Separator } from '@/components/ui/separator';
import { CountrySelect } from '@/components/ui/country-select';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '../documents/user-document';
import { capitalize, filterUneditedKeys } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CompleteProfile } from '@/convex/lib/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
  const { toast } = useToast();
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
      identityPicture: profile.identityPicture
        ? { ...profile.identityPicture }
        : undefined,
    },
    reValidateMode: 'onBlur',
  });

  const handleSubmit = async (data: BasicInfoFormData) => {
    // Identity picture is handled separately in UserDocument component
    delete data.identityPicture;

    filterUneditedKeys(data, form.formState.dirtyFields);

    setIsLoading(true);
    try {
      await updatePersonalInfo({
        profileId: profile._id,
        personal: {
          ...data,
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

      toast({
        title: t_inputs('success.title'),
        description: t_inputs('success.description'),
      });

      onSave();
    } catch (error) {
      toast({
        title: t_inputs('error.title'),
        description: t_inputs('error.description'),
        variant: 'destructive',
      });
      console.error('Failed to update personal info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = async (data: BasicInfoFormData) => {
    console.log('onFormSubmit', data);
    await handleSubmit(data);
    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        {banner}
        <div className={'grid gap-6 pt-4'}>
          <FormField
            control={form.control}
            name="identityPicture"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormControl>
                  <UserDocument
                    document={field.value}
                    expectedType={DocumentType.IdentityPhoto}
                    label={t_inputs('identityPicture.label')}
                    description={t_inputs('identityPicture.help')}
                    required={true}
                    disabled={isLoading}
                    onUpload={(doc) => {
                      field.onChange(doc);
                    }}
                    onDelete={() => {
                      field.onChange(null);
                    }}
                    accept="image/*"
                    enableEditor={true}
                    enableBackgroundRemoval={true}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          {/* Genre */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t_inputs('gender.label')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t_inputs('gender.options.male')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t_inputs('gender.options.female')}
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
                  <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(capitalize(e.target.value));
                      }}
                      placeholder={t_inputs('firstName.placeholder')}
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
                  <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                      placeholder={t_inputs('lastName.placeholder')}
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
                  <FormLabel>{t_inputs('birthDate.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
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
                  <FormLabel>{t_inputs('birthPlace.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t_inputs('birthPlace.placeholder')}
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
                <FormLabel>{t_inputs('birthCountry.label')}</FormLabel>
                <FormControl>
                  <CountrySelect
                    type="single"
                    selected={field.value as CountryCode}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>

                <TradFormMessage />
              </FormItem>
            )}
          />

          {/* Nationalité */}
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t_inputs('nationality.label')}</FormLabel>
                <FormControl>
                  <CountrySelect
                    type="single"
                    selected={field.value as CountryCode}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
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
                  {t_inputs('nationality_acquisition.label')}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap items-center gap-4"
                    disabled={isLoading}
                  >
                    {Object.values(NationalityAcquisition).map((acquisition) => (
                      <FormItem key={acquisition} className="flex items-center gap-2">
                        <FormControl>
                          <RadioGroupItem value={acquisition} />
                        </FormControl>
                        <FormLabel className="!mt-0 font-normal">
                          {t_inputs(`nationality_acquisition.options.${acquisition}`)}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          <>
            <Separator className="w-full" />

            <FormField
              control={form.control}
              name="passportInfos.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('passport.number.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder={t_inputs('passport.number.placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* Dates d'émission et d'expiration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passportInfos.issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('passport.issueDate.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        placeholder={t_inputs('passport.issueDate.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportInfos.expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('passport.expiryDate.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        type="date"
                        placeholder={t_inputs('passport.expiryDate.placeholder')}
                        disabled={isLoading}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Autorité émettrice */}
            <FormField
              control={form.control}
              name="passportInfos.issueAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('passport.issueAuthority.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder={t_inputs('passport.issueAuthority.placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {t_inputs('passport.issueAuthority.help')}
                  </FormDescription>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {/* NIP (optionnel) */}
            <FormField
              control={form.control}
              name="nipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('nipNumber.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      type="text"
                      placeholder={t_inputs('nipNumber.placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button
            onClick={onPrevious}
            variant="outline"
            leftIcon={<ArrowLeft className="size-icon" />}
          >
            Précédent
          </Button>

          <Button type="submit" rightIcon={<ArrowRight className="size-icon" />}>
            {form.formState.isDirty ? 'Enregistrer et continuer' : 'Continuer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

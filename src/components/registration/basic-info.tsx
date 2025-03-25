'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
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
import { CountryCode } from '@/lib/autocomplete-datas';
import { NationalityAcquisition } from '@prisma/client';
import { BasicInfoFormData } from '@/schemas/registration';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { CountrySelect } from '@/components/ui/country-select';
import { AppUserDocument } from '@/types';
import { DocumentType } from '@prisma/client';
import { UserDocument } from '../user-document';

type BasicInfoFormProps = {
  form: UseFormReturn<BasicInfoFormData>;
  onSubmit: () => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
  displayIdentityPicture?: boolean;
  banner?: React.ReactNode;
  profileId?: string;
};

export function BasicInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
  displayIdentityPicture = true,
  banner,
  profileId,
}: Readonly<BasicInfoFormProps>) {
  const t_inputs = useTranslations('inputs');

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {banner}
        <Card>
          <CardContent className={'grid gap-6 pt-4'}>
            {displayIdentityPicture && (
              <FormField
                control={form.control}
                name="identityPicture"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormControl>
                      <UserDocument
                        document={field.value as AppUserDocument}
                        expectedType={DocumentType.IDENTITY_PHOTO}
                        label={t_inputs('identityPicture.label')}
                        description={t_inputs('identityPicture.help')}
                        required={true}
                        disabled={isLoading}
                        profileId={profileId}
                        onUpload={(doc) => {
                          field.onChange(doc);
                        }}
                        onDelete={() => {
                          field.onChange(undefined);
                          window.location.reload();
                        }}
                        accept="image/*"
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Genre */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t_inputs('gender.label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="MALE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t_inputs('gender.options.MALE')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="FEMALE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t_inputs('gender.options.FEMALE')}
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
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('passport.number.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
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
                  name="passportIssueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('passport.issueDate.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
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
                  name="passportExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('passport.expiryDate.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
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
                name="passportIssueAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('passport.issueAuthority.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
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
                name="cardPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('nipNumber.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
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
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

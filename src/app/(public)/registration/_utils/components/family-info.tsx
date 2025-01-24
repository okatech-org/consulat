import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { FamilyLink, MaritalStatus } from '@prisma/client';
import { PhoneInput, PhoneValue } from '@/components/ui/phone-input';
import { FamilyInfoFormData } from '@/schemas/registration';
import { Separator } from '@/components/ui/separator';

interface FamilyInfoFormProps {
  form: UseFormReturn<FamilyInfoFormData>;
  onSubmit: (data: FamilyInfoFormData) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  isLoading?: boolean;
}

export function FamilyInfoForm({
  form,
  onSubmit,
  formRef,
  isLoading = false,
}: Readonly<FamilyInfoFormProps>) {
  const t = useTranslations('registration');
  const t_profile = useTranslations('profile');
  const tAssets = useTranslations('assets');

  const maritalStatus = form.watch('maritalStatus');
  const showSpouseFields =
    maritalStatus === MaritalStatus.MARRIED || maritalStatus === MaritalStatus.COHABITING;

  const handlePhoneChange = (phone: PhoneValue) => {
    form.setValue('emergencyContact.phone', phone);
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
        {/* État civil */}

        <Card>
          <CardContent className={'space-y-6 pt-4'}>
            <div>
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.marital_status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoading}>
                          <SelectValue placeholder={t('form.select_marital_status')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MaritalStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {tAssets(`marital_status.${status.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {/* Champs spécifiques si marié(e) */}
              {showSpouseFields && (
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="spouseFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.spouse_name')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder={t('form.spouse_name_placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="fatherFullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.father_name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder={t('form.father_name_placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherFullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.mother_name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder={t('form.mother_name_placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">{t('form.emergency_contact')}</h3>
              <FormDescription>{t('form.emergency_contact_description')}</FormDescription>

              <FormField
                control={form.control}
                name="emergencyContact.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.emergency_contact_name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder={t('form.emergency_contact_name_placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.emergency_contact_relationship')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.select_relationship')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(FamilyLink).map((link) => (
                          <SelectItem key={link} value={link}>
                            {t_profile(`fields.family_link.${link.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="emergencyContact.phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.emergency_contact_phone')}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        value={field.value as unknown as PhoneValue}
                        onChange={handlePhoneChange}
                        placeholder={t('form.emergency_contact_phone_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

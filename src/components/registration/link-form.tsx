'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { ParentalRole } from '@prisma/client';
import CardContainer from '../layouts/card-container';
import { MultiSelect } from '../ui/multi-select';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { LinkFormData } from '@/schemas/child-registration';
import { Separator } from '../ui/separator';
import { CardTitle } from '../ui/card';
import { PhoneNumberInput } from '../ui/phone-number';

interface LinkFormProps {
  form: UseFormReturn<LinkFormData>;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function LinkForm({ form, onSubmit, isLoading = false }: LinkFormProps) {
  const t = useTranslations('registration');
  const tBase = useTranslations();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContainer title={t('steps.child_link')} contentClass="space-y-4">
          <FormField
            control={form.control}
            name="parentRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('link.parent_role')}</FormLabel>
                <FormDescription>{t('link.parent_role_description')}</FormDescription>
                <FormControl>
                  <MultiSelect<ParentalRole>
                    type="single"
                    selected={field.value}
                    options={Object.values(ParentalRole).map((role) => ({
                      label: t(`form.roles.${role}`),
                      value: role,
                    }))}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasOtherParent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('link.has_other_parent')}</FormLabel>
                <FormDescription>
                  {t('link.has_other_parent_description')}
                </FormDescription>
                <FormControl>
                  <Switch
                    disabled={isLoading}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          {form.watch('hasOtherParent') && (
            <>
              <CardTitle className="text-lg font-bold">
                {t('link.other_parent_info')}
              </CardTitle>
              <Separator className="my-4" />
              <FormField
                control={form.control}
                name="otherParentFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tBase('inputs.firstName.label')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherParentLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tBase('inputs.lastName.label')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherParentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tBase('inputs.email.label')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={isLoading} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherParentPhone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>{tBase('inputs.phone.label')}</FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        value={field.value ?? '+33-'}
                        onChangeAction={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherParentRole"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{tBase('inputs.parentalRole.label')}</FormLabel>
                    <FormControl>
                      <MultiSelect<ParentalRole>
                        type="single"
                        selected={field.value}
                        options={Object.values(ParentalRole).map((role) => ({
                          label: tBase(`inputs.parentalRole.options.${role}`),
                          value: role,
                          disabled: form.watch('parentRole') === role,
                        }))}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardContainer>
      </form>
    </Form>
  );
}

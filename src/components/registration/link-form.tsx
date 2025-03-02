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
import { Button } from '../ui/button';
import { MultiSelect } from '../ui/multi-select';
import { Input } from '../ui/input';
import { PhoneInput } from '../ui/phone-input';
import { Switch } from '../ui/switch';
import { LinkFormData } from '@/schemas/child-registration';

interface LinkFormProps {
  form: UseFormReturn<LinkFormData>;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function LinkForm({ form, onSubmit, isLoading = false }: LinkFormProps) {
  const t = useTranslations('registration');

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
                    selected={[field.value]}
                    options={Object.values(ParentalRole).map((role) => ({
                      label: t(`form.roles.${role}`),
                      value: role,
                    }))}
                    onChange={(value) => field.onChange(value[0])}
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          {form.watch('hasOtherParent') && (
            <>
              <FormField
                control={form.control}
                name="otherParentFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('link.other_parent_first_name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t('link.other_parent_last_name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t('link.other_parent_email')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherParentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('link.other_parent_phone')}</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherParentRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('link.other_parent_role')}</FormLabel>
                    <FormControl>
                      <MultiSelect<ParentalRole>
                        type="single"
                        selected={[field.value]}
                        options={Object.values(ParentalRole).map((role) => ({
                          label: t(`form.roles.${role}`),
                          value: role,
                        }))}
                        onChange={(value) => field.onChange(value)}
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

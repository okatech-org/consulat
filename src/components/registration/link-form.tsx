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
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { ParentalRole } from '@prisma/client';

export interface LinkFormData {
  parentRole: ParentalRole;
  hasOtherParent: boolean;
  otherParentPresent: boolean;
}

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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('link.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="parentRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('link.parent_role')}</FormLabel>
                    <FormDescription>{t('link.parent_role_description')}</FormDescription>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('link.select_role')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ParentalRole.FATHER}>
                          {t('link.father')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.MOTHER}>
                          {t('link.mother')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.LEGAL_GUARDIAN}>
                          {t('link.legal_guardian')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('link.select_has_other_parent')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">{t('link.yes')}</SelectItem>
                        <SelectItem value="false">{t('link.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('hasOtherParent') && (
                <FormField
                  control={form.control}
                  name="otherParentPresent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('link.other_parent_present')}</FormLabel>
                      <FormDescription>
                        {t('link.other_parent_present_description')}
                      </FormDescription>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'true')}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('link.select_other_parent_present')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">{t('link.yes')}</SelectItem>
                          <SelectItem value="false">{t('link.no')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <LoadingButton type="submit" isLoading={isLoading}>
            {t('navigation.next')}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}

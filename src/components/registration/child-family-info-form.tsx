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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ParentalRole } from '@prisma/client';

export interface ChildFamilyInfoFormData {
  parentRole: ParentalRole;
  hasParentalAuthority: boolean;
  otherParentFirstName?: string;
  otherParentLastName?: string;
  otherParentEmail?: string;
  otherParentPhone?: string;
  familySituation?: string;
  otherInformation?: string;
}

interface ChildFamilyInfoFormProps {
  form: UseFormReturn<ChildFamilyInfoFormData>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ChildFamilyInfoForm({
  form,
  onSubmit,
  onBack,
  isLoading = false,
}: ChildFamilyInfoFormProps) {
  const t = useTranslations('user');
  const t_actions = useTranslations('common.actions');
  const hasOtherParent = form.watch('parentRole') !== undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('children.form.family_info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="hasParentalAuthority"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('children.form.family_info.has_parental_authority')}
                      </FormLabel>
                      <FormDescription>
                        {t(
                          'children.form.family_info.has_parental_authority_description',
                        )}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {hasOtherParent && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="otherParentFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('children.form.family_info.other_parent_first_name')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="otherParentLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('children.form.family_info.other_parent_last_name')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="otherParentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('children.form.family_info.other_parent_email')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="email" value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="otherParentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('children.form.family_info.other_parent_phone')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="familySituation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('children.form.family_info.family_situation')}
                    </FormLabel>
                    <FormDescription>
                      {t('children.form.family_info.family_situation_description')}
                    </FormDescription>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('children.form.family_info.other_information')}
                    </FormLabel>
                    <FormDescription>
                      {t('children.form.family_info.other_information_description')}
                    </FormDescription>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" size="mobile" onClick={onBack}>
            {t_actions('back')}
          </Button>
          <Button type="submit" size="mobile" weight="medium" disabled={isLoading}>
            {t_actions('next')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { updateUserData } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/ui/country-select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  TradFormMessage,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneNumberInput } from '@/components/ui/phone-number';
import { toast } from '@/hooks/use-toast';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import {
  UserSettingsSchema,
  AgentSettingsSchema,
  AdminSettingsSchema,
} from '@/schemas/user';
import type { SessionUser } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Country, UserRole } from '@prisma/client';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type UserSettingsFormProps = {
  user: SessionUser;
  availableCountries: Country[];
};

const schemByRole: Record<UserRole, z.ZodSchema> = {
  [UserRole.USER]: UserSettingsSchema,
  [UserRole.AGENT]: AgentSettingsSchema,
  [UserRole.ADMIN]: AdminSettingsSchema,
  [UserRole.SUPER_ADMIN]: UserSettingsSchema,
  [UserRole.MANAGER]: UserSettingsSchema,
};

export function UserSettingsForm({ user, availableCountries }: UserSettingsFormProps) {
  const tInput = useTranslations('inputs');
  const t = useTranslations('common');
  const UserSchema = schemByRole[user?.roles[0] ?? UserRole.USER];
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: user,
  });

  const onSubmit = async (data: z.infer<typeof UserSchema>) => {
    setIsLoading(true);

    filterUneditedKeys(data, form.formState.dirtyFields);

    const result = await tryCatch(updateUserData(user.id, data));
    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error.message,
      });
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={'w-full flex flex-col gap-6'}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="lg:col-span-1">
              <FormLabel>{tInput('fullName.label')}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={tInput('fullName.placeholder')}
                  {...field}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem className="lg:col-span-full">
              <FormLabel>{tInput('residenceCountry.label')}</FormLabel>
              <FormControl>
                <CountrySelect
                  type="single"
                  selected={field.value as CountryCode}
                  onChange={(value) => field.onChange(value)}
                  disabled={true}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>{tInput('email.label')}</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder={tInput('email.placeholder')}
                  {...field}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="sm:col-span-1">
              <FormLabel>{tInput('phone.label')}</FormLabel>
              <FormControl>
                <PhoneNumberInput
                  value={field.value ?? '+33-'}
                  onChangeAction={field.onChange}
                  disabled={isLoading}
                  options={availableCountries?.map((item) => item.code as CountryCode)}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {t('actions.save')}
        </Button>
      </form>
    </Form>
  );
}

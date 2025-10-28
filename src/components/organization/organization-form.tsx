'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { OrganizationType, OrganizationStatus } from '@/convex/lib/constants';
import {
  organizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  updateOrganizationSchema,
} from '@/schemas/organization';
import { useOrganizationActions } from '@/hooks/use-organization-actions';
import { InfoField } from '@/components/ui/info-field';
import { type CountryCode } from '@/lib/autocomplete-datas';
import { MultiSelect } from '../ui/multi-select';
import { FlagIcon } from '../ui/flag-icon';
import type { Doc } from '@/convex/_generated/dataModel';

interface OrganizationFormProps {
  organization?: Doc<'organizations'> & {
    countries?: Array<{ id: string; code: string; name: string }>;
  };
  countries: Array<Doc<'countries'>>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OrganizationForm({
  organization,
  countries,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const t = useTranslations('organization');
  const t_common = useTranslations('common');
  const { handleCreate, handleUpdate, isLoading } = useOrganizationActions();

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(organization ? updateOrganizationSchema : organizationSchema),
    defaultValues: organization
      ? {
          name: organization.name,
          type: organization.type,
          status: organization.status,
          countryIds: organization.countryCodes || [],
        }
      : {
          name: '',
          type: OrganizationType.Consulate,
          status: OrganizationStatus.Active,
          countryIds: [],
          adminEmail: '',
        },
  });

  async function handleCreateSubmit(data: CreateOrganizationInput) {
    try {
      const result = await handleCreate({
        ...data,
        code: `ORG_${Date.now().toString(36).toUpperCase()}`,
      });
      if (!result) {
        return;
      }

      // Appeler le callback de succès si fourni
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  }

  async function handleUpdateSubmit(data: UpdateOrganizationInput) {
    try {
      // On s'assure que l'organisation existe
      if (!organization) {
        return;
      }

      const result = await handleUpdate(organization._id, data);
      if (!result) {
        return;
      }

      // Appeler le callback de succès si fourni
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update organization:', error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          organization ? handleUpdateSubmit : handleCreateSubmit,
        )}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('form.name.placeholder')}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.type.label')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.type.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(OrganizationType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status.label')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.status.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(OrganizationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.countries.label')}</FormLabel>
              <MultiSelect<CountryCode>
                type="multiple"
                options={countries.map((country) => ({
                  value: country.code as CountryCode,
                  label: country.name,
                  component: (
                    <div className="flex items-center gap-2">
                      <FlagIcon countryCode={country.code as CountryCode} />
                      {country.name}
                    </div>
                  ),
                }))}
                selected={field.value as CountryCode[]}
                onChange={field.onChange}
                disabled={isLoading}
              />
              <TradFormMessage />
            </FormItem>
          )}
        />

        {!organization && (
          <FormField
            control={form.control}
            name="adminEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.admin_email.label')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('form.admin_email.placeholder')}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />
        )}

        {organization && (
          <InfoField label={t('form.admin_email.label')} value="admin@example.com" />
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" disabled={isLoading} onClick={onCancel}>
            {t_common('actions.cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {organization ? t_common('actions.update') : t_common('actions.add')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

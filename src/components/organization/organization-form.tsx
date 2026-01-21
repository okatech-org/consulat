'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { OrganizationType, OrganizationStatus, CountryCode } from '@/convex/lib/constants';
import {
  organizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  updateOrganizationSchema,
} from '@/schemas/organization';
import { useOrganizationActions } from '@/hooks/use-organization-actions';
import { InfoField } from '@/components/ui/info-field';
import { MultiSelect } from '../ui/multi-select';
import { FlagIcon } from '../ui/flag-icon';
import type { Doc } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';

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
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organization-name">
                  {t('form.name.label')}
                </FieldLabel>
                <Input
                  id="organization-name"
                  placeholder={t('form.name.placeholder')}
                  {...field}
                  disabled={isLoading}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organization-type">
                  {t('form.type.label')}
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="organization-type" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t('form.type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrganizationType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organization-status">
                  {t('form.status.label')}
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="organization-status" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t('form.status.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrganizationStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`status.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="countryIds"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organization-countries">
                  {t('form.countries.label')}
                </FieldLabel>
                <MultiSelect<CountryCode>
                  type="multiple"
                  options={countries.map((country) => ({
                    value: country.code,
                    label: country.name,
                    component: (
                      <div className="flex items-center gap-2">
                        <FlagIcon countryCode={country.code} />
                        {country.name}
                      </div>
                    ),
                  }))}
                  selected={field.value as CountryCode[]}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {!organization && (
            <Controller
              name="adminEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="organization-admin-email">
                    {t('form.admin_email.label')}
                  </FieldLabel>
                  <Input
                    id="organization-admin-email"
                    type="email"
                    placeholder={t('form.admin_email.placeholder')}
                    {...field}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}
        </FieldGroup>

        {organization && (
          <InfoField label={t('form.admin_email.label')} value="admin@example.com" />
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" disabled={isLoading} onClick={onCancel}>
            {t_common('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {organization ? t_common('actions.update') : t_common('actions.add')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

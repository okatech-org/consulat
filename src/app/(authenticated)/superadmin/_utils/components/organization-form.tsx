'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { OrganizationType, OrganizationStatus } from '@prisma/client';
import {
  organizationSchema,
  type CreateOrganizationInput,
  UpdateOrganizationInput,
  updateOrganizationSchema,
} from '@/schemas/organization';
import { Organization } from '@/types/organization';
import { useOrganizationActions } from '@/app/(authenticated)/superadmin/_utils/hooks/use-organization-actions';
import { InfoField } from '@/components/ui/info-field';

interface CountryOption {
  id: string;
  name: string;
}

interface OrganizationFormProps {
  organization?: Organization;
  countries: CountryOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OrganizationForm({
  organization,
  countries,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const t = useTranslations('superadmin.organizations');
  const t_common = useTranslations('common');
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const { handleCreate, handleUpdate, isLoading } = useOrganizationActions();

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(organization ? updateOrganizationSchema : organizationSchema),
    defaultValues: organization
      ? {
          name: organization.name,
          type: organization.type,
          status: organization.status,
          countryIds: organization.countries.map((c) => c.id),
        }
      : {
          name: '',
          type: OrganizationType.CONSULATE,
          status: OrganizationStatus.ACTIVE,
          countryIds: [],
          adminEmail: '',
        },
  });

  const selectedCountries = React.useMemo(
    () => countries.filter((country) => form.watch('countryIds').includes(country.id)),
    [countries, form],
  );

  const filteredCountries = React.useMemo(
    () =>
      countries.filter((country) =>
        country.name.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [countries, searchValue],
  );

  async function handleCreateSubmit(data: CreateOrganizationInput) {
    try {
      const result = await handleCreate(data);
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

      const result = await handleUpdate(organization.id, data);
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
              <FormMessage />
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
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.countries.label')}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type={'button'}
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between',
                        !field.value.length && 'text-muted-foreground',
                      )}
                      disabled={isLoading}
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedCountries.length === 0 &&
                          t('form.countries.placeholder')}
                        {selectedCountries.map((country) => (
                          <Badge variant="secondary" key={country.id} className="mr-1">
                            {country.name}
                          </Badge>
                        ))}
                      </div>
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t('form.countries.search')}
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>{t('form.countries.empty')}</CommandEmpty>
                    <CommandList>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredCountries.map((country) => (
                          <CommandItem
                            key={country.id}
                            value={country.name}
                            onSelect={() => {
                              const current = field.value;
                              const updated = current.includes(country.id)
                                ? current.filter((id) => id !== country.id)
                                : [...current, country.id];
                              field.onChange(updated);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value.includes(country.id)
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {country.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {organization && (
          <InfoField
            label={t('form.admin_email.label')}
            value={organization.User?.email}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" disabled={isLoading} onClick={onCancel}>
            {t_common('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {organization ? t_common('actions.update') : t_common('actions.add')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

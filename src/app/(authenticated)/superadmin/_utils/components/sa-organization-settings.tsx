'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Organization } from '@/types/organization';
import {
  SAOrganizationSettingsSchema,
  SAOrganizationSettingsFormData,
  getDefaultSAValues,
} from '@/schemas/organization';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { updateOrganizationSettings } from '@/app/(authenticated)/manager/_utils/actions/organization'; // Réutiliser l'action existante
import { DocumentUploadField } from '@/components/ui/document-upload'; // Import du composant
import { Country, OrganizationStatus, OrganizationType } from '@prisma/client';
import { MultiSelect } from '@/components/ui/multi-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ConsularServiceItem } from '@/types/consular-service';
import { ServicesTable } from '@/app/(authenticated)/superadmin/_utils/components/services-table';

interface SAOrganizationSettingsProps {
  organization: Organization;
  countries: Country[];
}

export function SAOrganizationSettings({
  organization,
  countries,
}: SAOrganizationSettingsProps) {
  const t = useTranslations('superadmin.organizations');
  const t_common = useTranslations('common');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SAOrganizationSettingsFormData>({
    resolver: zodResolver(SAOrganizationSettingsSchema),
    defaultValues: getDefaultSAValues(organization),
  });

  const availableCountries = countries.filter(
    (country) =>
      !organization.countries.some((orgCountry) => orgCountry.id === country.id),
  );

  const onSubmit = async (data: SAOrganizationSettingsFormData) => {
    setIsLoading(true);
    try {
      let file;
      if (data.logoFile) {
        const formData = new FormData();
        formData.append('files', data.logoFile[0]);
        file = formData;
      }

      const result = await updateOrganizationSettings(
        organization.id,
        {
          ...data,
          // Nécessaire pour que l'action du manager fonctionne pour le super admin
          metadata: organization.metadata,
        },
        file,
      );
      if (result.error) {
        toast({
          title: t('messages.error.update'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: t('messages.success.update'),
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('messages.error.update'),
        description: t('messages.error.unknown'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = (countryId: string, shouldLink: boolean) => {
    const updatedCountryIds = shouldLink
      ? [...form.getValues('countryIds'), countryId]
      : form.getValues('countryIds').filter((id) => id !== countryId);
    form.setValue('countryIds', updatedCountryIds);
  };

  const servicesColumns: ColumnDef<ConsularServiceItem>[] = [
    { accessorKey: 'name', header: 'Nom' },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => t_common(`service_categories.${row.original.category}`),
    },
    { accessorKey: 'description', header: 'Description' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Nom */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.name.placeholder')}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo */}
        <FormField
          control={form.control}
          name="logo"
          render={() => (
            <FormItem>
              <FormLabel>{t('form.logo.label')}</FormLabel>
              <FormControl>
                <DocumentUploadField<SAOrganizationSettingsFormData>
                  id={'logoFile'}
                  field={form.register('logoFile')}
                  form={form}
                  disabled={isLoading}
                  existingFile={organization.logo ?? undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.type.label')}</FormLabel>
              <FormControl>
                <MultiSelect<OrganizationType>
                  options={Object.values(OrganizationType).map((type) => ({
                    label: t(`types.${type.toLocaleLowerCase()}`),
                    value: type,
                  }))}
                  selected={field.value ? [field.value] : []}
                  onChange={(values) => field.onChange(values[0])}
                  type={'single'}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status.label')}</FormLabel>
              <FormControl>
                <MultiSelect<OrganizationStatus>
                  options={Object.values(OrganizationStatus).map((status) => ({
                    label: t(`status.${status.toLocaleLowerCase()}`),
                    value: status,
                  }))}
                  selected={field.value ? [field.value] : []}
                  onChange={(values) => field.onChange(values[0])}
                  type={'single'}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pays */}
        <FormField
          control={form.control}
          name="countryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.countries.label')}</FormLabel>
              <FormControl>
                <MultiSelect<string>
                  options={countries.map((country) => ({
                    value: country.id,
                    label: country.name,
                  }))}
                  selected={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('form.linked_countries.title')}</h3>
          {organization.countries.map((country) => (
            <Badge key={country.id} variant="secondary">
              {country.name}
              <Button
                size="icon"
                variant="ghost"
                className="size-4 ml-2"
                onClick={() => handleCountryChange(country.id, false)}
              >
                <Loader2 className="size-3 mr-2" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium mobile-hide">
            {t('form.available_countries.title')}
          </h3>
          {availableCountries.map((country) => (
            <Badge key={country.id} variant="outline">
              {country.name}
              <Button
                size="icon"
                variant="ghost"
                className="size-4 ml-2"
                onClick={() => handleCountryChange(country.id, true)}
              >
                <Loader2 className="size-3 mr-2" />
              </Button>
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            {/* ... other tabs */}
          </TabsList>
          <TabsContent value="services">
            {/* Liste des services liés */}
            <div>
              <h3 className="text-lg font-medium">{t('form.linked_services.title')}</h3>
              <ServicesTable
                services={organization.services ?? []}
                columns={servicesColumns}
                isLoading={false}
              />
            </div>
          </TabsContent>
          {/* ... other tabs content */}
        </Tabs>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t_common('actions.save')}
        </Button>
      </form>
    </Form>
  );
}

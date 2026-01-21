'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/convex/_generated/api';
import type { Organization } from '@/convex/lib/types';
import {
  CountryStatus,
  OrganizationStatus,
  OrganizationType,
  UserRole,
} from '@/convex/lib/constants';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { weekDays } from '@/lib/utils';

import {
  organizationSettingsSchema,
  getDefaultValues,
  type OrganizationSettingsFormData,
  type CountrySettings,
} from '@/schemas/organization';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { MultiSelect } from '@/components/ui/multi-select';
import { FileInput } from '@/components/ui/file-input';
import CardContainer from '@/components/layouts/card-container';
import { RoleGuard } from '@/lib/permissions/utils';
import { DaySchedule } from './day-schedule';
import { useFile } from '@/hooks/use-file';
import { useTabs } from '@/hooks/use-tabs';

interface OrganizationSettingsProps {
  organization: Organization;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const t = useTranslations('organization');
  const t_common = useTranslations();
  const t_countries = useTranslations('countries');
  const t_messages = useTranslations('messages');
  const t_inputs = useTranslations('inputs');

  if (!organization) {
    return null;
  }

  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch active countries for the multiselect
  const allCountries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });

  // Get organization's selected countries
  const organizationCountries = React.useMemo(
    () => allCountries?.filter((c) => organization.countryCodes.includes(c.code)) || [],
    [allCountries, organization.countryCodes],
  );

  const { handleTabChange, currentTab } = useTabs<string>(
    'country',
    organizationCountries[0]?.code ?? '',
  );

  const { handleFileUpload, handleFileDelete, isLoading: fileLoading } = useFile();
  const updateMutation = useMutation(api.functions.organization.updateOrganization);

  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: getDefaultValues(organization),
  });

  // Watch countryCodes to sync settings array
  const watchedCountryCodes = form.watch('countryCodes');

  React.useEffect(() => {
    const currentSettings = form.getValues('settings');
    const currentCountryCodes = currentSettings.map((s) => s.countryCode);

    // Add new countries
    const newCountries = watchedCountryCodes.filter(
      (code) => !currentCountryCodes.includes(code),
    );

    if (newCountries.length > 0) {
      const defaultSchedule = {
        isOpen: false,
        slots: [{ start: '09:00', end: '17:00' }],
      };

      const newSettings: CountrySettings[] = newCountries.map((code) => ({
        countryCode: code,
        contact: undefined,
        schedule: {
          monday: defaultSchedule,
          tuesday: defaultSchedule,
          wednesday: defaultSchedule,
          thursday: defaultSchedule,
          friday: defaultSchedule,
          saturday: defaultSchedule,
          sunday: defaultSchedule,
        },
        holidays: [],
        closures: [],
        consularCard: undefined,
      }));

      form.setValue('settings', [...currentSettings, ...newSettings]);
    }

    // Remove deleted countries
    const removedCountries = currentCountryCodes.filter(
      (code) => !watchedCountryCodes.includes(code),
    );

    if (removedCountries.length > 0) {
      const filteredSettings = currentSettings.filter(
        (s) => !removedCountries.includes(s.countryCode),
      );
      form.setValue('settings', filteredSettings);
    }
  }, [watchedCountryCodes, form]);

  const onSubmit = async (data: OrganizationSettingsFormData) => {
    setIsLoading(true);

    try {
      // Transform form data to match Convex structure
      const transformedSettings = data.settings.map((countrySetting) => ({
        countryCode: countrySetting.countryCode,
        contact: countrySetting.contact,
        schedule: countrySetting.schedule,
        // Convert holidays from date/name objects to timestamps
        holidays: countrySetting.holidays.map((h) => new Date(h.date).getTime()),
        // Convert closures from date/reason objects to timestamps
        closures: countrySetting.closures.map((c) => new Date(c.start).getTime()),
        consularCard: countrySetting.consularCard,
      }));

      await updateMutation({
        organizationId: organization._id,
        name: data.name,
        logo: data.logo,
        type: data.type,
        status: data.status,
        countryCodes: data.countryCodes,
        settings: transformedSettings,
      });

      toast.success(t_messages('success.update'), {
        description: t('messages.updateSuccess'),
      });
    } catch (error) {
      toast.error(t_messages('errors.update'), {
        description: error instanceof Error ? error.message : 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSettingsIndexForCountry = (countryCode: string): number => {
    return form.getValues('settings').findIndex((s) => s.countryCode === countryCode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* General Information Section */}
        <CardContainer title={t('title')}>
          <div className="space-y-4">
            {/* Logo */}
            <Field name="logo">
              <FileInput
                onChangeAction={async (file) => {
                  const fileUrl = await handleFileUpload(file);
                  if (fileUrl) {
                    form.setValue('logo', fileUrl.url);
                  }
                }}
                onDeleteAction={() => {
                  const logoValue = form.watch('logo');
                  if (logoValue) {
                    handleFileDelete(logoValue);
                  }
                  form.setValue('logo', '');
                }}
                accept="image/*"
                fileUrl={form.watch('logo')}
                loading={fileLoading}
              />
              <FieldError />
            </Field>

            {/* Name */}
            <Field name="name">
              <FieldLabel>{t('settings.general.name')}</FieldLabel>
              <Input
                {...form.register('name')}
                value={form.watch('name') || ''}
                placeholder={t('settings.general.placeholders.name')}
              />
              <FieldError />
            </Field>

            <RoleGuard roles={[UserRole.SuperAdmin]} fallback={<></>}>
              {/* Type */}
              <Field name="type">
                <FieldLabel>{t('form.type.label')}</FieldLabel>
                <MultiSelect<OrganizationType>
                  options={Object.values(OrganizationType).map((type) => ({
                    label: t(`types.${type}`),
                    value: type,
                  }))}
                  selected={form.watch('type')}
                  onChange={(value) => form.setValue('type', value)}
                  type="single"
                  disabled={isLoading}
                />
                <FieldError />
              </Field>

              {/* Status */}
              <Field name="status">
                <FieldLabel>{t('form.status.label')}</FieldLabel>
                <MultiSelect<OrganizationStatus>
                  options={Object.values(OrganizationStatus).map((status) => ({
                    label: t(`status.${status}`),
                    value: status,
                  }))}
                  selected={form.watch('status')}
                  onChange={(value) => form.setValue('status', value)}
                  type="single"
                  disabled={isLoading}
                />
                <FieldError />
              </Field>

              {/* Countries */}
              <Field name="countryCodes">
                <FieldLabel>{t('form.countries.label')}</FieldLabel>
                <MultiSelect<string>
                  type="multiple"
                  options={
                    allCountries?.map((country) => ({
                      label: t_countries(country.code as CountryCode),
                      value: country.code,
                    })) || []
                  }
                  selected={form.watch('countryCodes')}
                  onChange={(value) => form.setValue('countryCodes', value)}
                  disabled={isLoading}
                />
                <FieldError />
              </Field>
            </RoleGuard>
          </div>
        </CardContainer>

        {/* Country-Specific Settings Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            {organizationCountries.map((country) => (
              <TabsTrigger key={country._id} value={country.code}>
                {t_countries(country.code as CountryCode)}
              </TabsTrigger>
            ))}
          </TabsList>

          {organizationCountries.map((country) => {
            const settingsIndex = getSettingsIndexForCountry(country.code);

            if (settingsIndex === -1) return null;

            return (
              <TabsContent key={country._id} value={country.code} className="space-y-4">
                <CardContainer
                  title={t('settings.configForCountry', {
                    country: t_countries(country.code as CountryCode),
                  })}
                >
                  <div className="space-y-6">
                    {/* Contact Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {t('settings.contact.title')}
                      </h3>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {/* Email */}
                        <Field name={`settings.${settingsIndex}.contact.email`}>
                          <FieldLabel>{t_inputs('email.label')}</FieldLabel>
                          <Input
                            type="email"
                            {...form.register(`settings.${settingsIndex}.contact.email`)}
                            value={form.watch(`settings.${settingsIndex}.contact.email`) || ''}
                            placeholder={t_inputs('email.placeholder')}
                          />
                          <FieldError />
                        </Field>

                        {/* Phone */}
                        <Field name={`settings.${settingsIndex}.contact.phone`}>
                          <FieldLabel>{t_inputs('phone.label')}</FieldLabel>
                          <Input
                            type="tel"
                            {...form.register(`settings.${settingsIndex}.contact.phone`)}
                            value={form.watch(`settings.${settingsIndex}.contact.phone`) || ''}
                            placeholder={t_inputs('phone.placeholder')}
                          />
                          <FieldError />
                        </Field>

                        {/* Website */}
                        <Field name={`settings.${settingsIndex}.contact.website`} className="lg:col-span-2">
                          <FieldLabel>{t('settings.general.website')}</FieldLabel>
                          <Input
                            {...form.register(`settings.${settingsIndex}.contact.website`)}
                            value={form.watch(`settings.${settingsIndex}.contact.website`) || ''}
                            type="url"
                            placeholder="https://www.example.com"
                          />
                          <FieldError />
                        </Field>

                        {/* Address */}
                        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                          <Field name={`settings.${settingsIndex}.contact.address.street`}>
                            <FieldLabel>{t_inputs('address.street.label')}</FieldLabel>
                            <Input
                              {...form.register(`settings.${settingsIndex}.contact.address.street`)}
                              value={form.watch(`settings.${settingsIndex}.contact.address.street`) || ''}
                              placeholder={t_inputs('address.street.placeholder')}
                            />
                            <FieldError />
                          </Field>

                          <Field name={`settings.${settingsIndex}.contact.address.complement`}>
                            <FieldLabel>{t_inputs('address.complement.label')}</FieldLabel>
                            <Input
                              {...form.register(`settings.${settingsIndex}.contact.address.complement`)}
                              value={form.watch(`settings.${settingsIndex}.contact.address.complement`) || ''}
                              placeholder={t_inputs('address.complement.placeholder')}
                            />
                            <FieldError />
                          </Field>

                          <Field name={`settings.${settingsIndex}.contact.address.city`}>
                            <FieldLabel>{t_inputs('address.city.label')}</FieldLabel>
                            <Input
                              {...form.register(`settings.${settingsIndex}.contact.address.city`)}
                              value={form.watch(`settings.${settingsIndex}.contact.address.city`) || ''}
                              placeholder={t_inputs('address.city.placeholder')}
                            />
                            <FieldError />
                          </Field>

                          <Field name={`settings.${settingsIndex}.contact.address.postalCode`}>
                            <FieldLabel>{t_inputs('address.postalCode.label')}</FieldLabel>
                            <Input
                              {...form.register(`settings.${settingsIndex}.contact.address.postalCode`)}
                              value={form.watch(`settings.${settingsIndex}.contact.address.postalCode`) || ''}
                              placeholder={t_inputs('address.postalCode.placeholder')}
                            />
                            <FieldError />
                          </Field>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Schedule Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {t('settings.schedule.title')}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {weekDays.map((day) => (
                          <DaySchedule
                            key={day}
                            day={day}
                            countryCode={country.code}
                            form={form}
                            t={t_common}
                            fieldName={`settings.${settingsIndex}.schedule.${day}`}
                          />
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Holidays Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          {t('settings.holidays.title')}
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const currentHolidays =
                              form.getValues(`settings.${settingsIndex}.holidays`) || [];
                            const today = new Date().toISOString().split('T')[0];
                            form.setValue(`settings.${settingsIndex}.holidays`, [
                              ...currentHolidays,
                              { date: today || '', name: '' },
                            ]);
                          }}
                        >
                          <Plus className="mr-2 size-4" />
                          {t('settings.holidays.add')}
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {form
                          .watch(`settings.${settingsIndex}.holidays`)
                          ?.map((_, index) => (
                            <CardContainer key={index} contentClass="!p-4 relative">
                              <div className="grid gap-4">
                                <Field name={`settings.${settingsIndex}.holidays.${index}.date`}>
                                  <FieldLabel>{t('settings.holidays.date')}</FieldLabel>
                                  <DatePicker
                                    date={
                                      form.watch(`settings.${settingsIndex}.holidays.${index}.date`)
                                        ? new Date(form.watch(`settings.${settingsIndex}.holidays.${index}.date`))
                                        : new Date()
                                    }
                                    onSelect={(date) =>
                                      form.setValue(
                                        `settings.${settingsIndex}.holidays.${index}.date`,
                                        date?.toISOString().split('T')[0] || '',
                                      )
                                    }
                                  />
                                  <FieldError />
                                </Field>

                                <Field name={`settings.${settingsIndex}.holidays.${index}.name`}>
                                  <FieldLabel>{t('settings.holidays.name')}</FieldLabel>
                                  <Input
                                    {...form.register(`settings.${settingsIndex}.holidays.${index}.name`)}
                                    value={form.watch(`settings.${settingsIndex}.holidays.${index}.name`) || ''}
                                  />
                                  <FieldError />
                                </Field>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2"
                                  onClick={() => {
                                    const holidays = form.getValues(
                                      `settings.${settingsIndex}.holidays`,
                                    );
                                    form.setValue(
                                      `settings.${settingsIndex}.holidays`,
                                      holidays.filter((_, i) => i !== index),
                                    );
                                  }}
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </div>
                            </CardContainer>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Closures Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          {t('settings.closures.title')}
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const currentClosures =
                              form.getValues(`settings.${settingsIndex}.closures`) || [];
                            const today = new Date().toISOString().split('T')[0];
                            form.setValue(`settings.${settingsIndex}.closures`, [
                              ...currentClosures,
                              { start: today || '', end: today || '', reason: '' },
                            ]);
                          }}
                        >
                          <Plus className="mr-2 size-4" />
                          {t('settings.closures.add')}
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {form
                          .watch(`settings.${settingsIndex}.closures`)
                          ?.map((_, index) => (
                            <CardContainer key={index} contentClass="!p-4 relative">
                              <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Field name={`settings.${settingsIndex}.closures.${index}.start`}>
                                    <FieldLabel>
                                      {t('settings.closures.start_date')}
                                    </FieldLabel>
                                    <DatePicker
                                      date={
                                        form.watch(`settings.${settingsIndex}.closures.${index}.start`)
                                          ? new Date(form.watch(`settings.${settingsIndex}.closures.${index}.start`))
                                          : new Date()
                                      }
                                      onSelect={(date) =>
                                        form.setValue(
                                          `settings.${settingsIndex}.closures.${index}.start`,
                                          date?.toISOString().split('T')[0] || '',
                                        )
                                      }
                                    />
                                    <FieldError />
                                  </Field>

                                  <Field name={`settings.${settingsIndex}.closures.${index}.end`}>
                                    <FieldLabel>
                                      {t('settings.closures.end_date')}
                                    </FieldLabel>
                                    <DatePicker
                                      date={
                                        form.watch(`settings.${settingsIndex}.closures.${index}.end`)
                                          ? new Date(form.watch(`settings.${settingsIndex}.closures.${index}.end`))
                                          : new Date()
                                      }
                                      onSelect={(date) =>
                                        form.setValue(
                                          `settings.${settingsIndex}.closures.${index}.end`,
                                          date?.toISOString().split('T')[0] || '',
                                        )
                                      }
                                    />
                                    <FieldError />
                                  </Field>
                                </div>

                                <Field name={`settings.${settingsIndex}.closures.${index}.reason`}>
                                  <FieldLabel>
                                    {t('settings.closures.reason')}
                                  </FieldLabel>
                                  <Input
                                    {...form.register(`settings.${settingsIndex}.closures.${index}.reason`)}
                                    value={form.watch(`settings.${settingsIndex}.closures.${index}.reason`) || ''}
                                  />
                                  <FieldError />
                                </Field>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2"
                                  onClick={() => {
                                    const closures = form.getValues(
                                      `settings.${settingsIndex}.closures`,
                                    );
                                    form.setValue(
                                      `settings.${settingsIndex}.closures`,
                                      closures.filter((_, i) => i !== index),
                                    );
                                  }}
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </div>
                            </CardContainer>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Consular Card Templates Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {t('settings.consularCard.title')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.consularCard.description')}
                      </p>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field name={`settings.${settingsIndex}.consularCard.rectoModelUrl`}>
                          <FileInput
                            onChangeAction={async (file) => {
                              const fileUrl = await handleFileUpload(file);
                              if (fileUrl) {
                                form.setValue(`settings.${settingsIndex}.consularCard.rectoModelUrl`, fileUrl.url);
                              }
                            }}
                            onDeleteAction={() => {
                              const rectoValue = form.watch(`settings.${settingsIndex}.consularCard.rectoModelUrl`);
                              if (rectoValue) {
                                handleFileDelete(rectoValue);
                              }
                              form.setValue(`settings.${settingsIndex}.consularCard.rectoModelUrl`, '');
                            }}
                            fileUrl={form.watch(`settings.${settingsIndex}.consularCard.rectoModelUrl`)}
                            accept="image/*"
                            loading={fileLoading}
                          />
                          <FieldError />
                        </Field>

                        <Field name={`settings.${settingsIndex}.consularCard.versoModelUrl`}>
                          <FileInput
                            onChangeAction={async (file) => {
                              const fileUrl = await handleFileUpload(file);
                              if (fileUrl) {
                                form.setValue(`settings.${settingsIndex}.consularCard.versoModelUrl`, fileUrl.url);
                              }
                            }}
                            onDeleteAction={() => {
                              const versoValue = form.watch(`settings.${settingsIndex}.consularCard.versoModelUrl`);
                              if (versoValue) {
                                handleFileDelete(versoValue);
                              }
                              form.setValue(`settings.${settingsIndex}.consularCard.versoModelUrl`, '');
                            }}
                            fileUrl={form.watch(`settings.${settingsIndex}.consularCard.versoModelUrl`)}
                            accept="image/*"
                            loading={fileLoading}
                          />
                          <FieldError />
                        </Field>
                      </div>
                    </div>
                  </div>
                </CardContainer>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Submit Button */}
        <div className="actions py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? t_common('common.actions.saving')
              : t_common('common.actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

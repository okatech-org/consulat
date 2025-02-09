'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage,
} from '@/components/ui/form';
import {
  generateOrganizationSettingsSchema,
  getDefaultValues,
  OrganizationSettingsFormData,
} from '@/schemas/organization';
import { Organization } from '@/types/organization';
import { Input } from '@/components/ui/input';
import { Country } from '@/types/country';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DaySchedule } from '@/app/(authenticated)/admin/_utils/components/day-schedule';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { updateOrganizationSettings } from '@/components/organization/organization';
import { DocumentUploadField } from '@/components/ui/document-upload';
import { filterUneditedKeys, weekDays } from '@/lib/utils';
import CardContainer from '@/components/layouts/card-container';
import { MultiSelect } from '@/components/ui/multi-select';
import { OrganizationStatus, OrganizationType } from '@prisma/client';
import { RoleGuard } from '@/components/ui/role-guard';
import { useTabs } from '@/hooks/use-tabs';

interface OrganizationSettingsProps {
  organization: Organization;
  countries: Country[];
}

export function OrganizationSettings({
  organization,
  countries = [],
}: OrganizationSettingsProps) {
  const schema = generateOrganizationSettingsSchema(
    organization.countries as unknown as Country[],
  );
  const t = useTranslations('organization');
  const t_common = useTranslations();
  const t_countries = useTranslations('countries');
  const t_messages = useTranslations('messages');
  const { handleTabChange, searchParams } = useTabs();

  // Récupérer la valeur de l'onglet depuis l'URL ou utiliser la valeur par défaut
  const countryTab = searchParams.get('country') ?? organization.countries[0]?.code;

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(organization),
  });

  const onSubmit = async (data: OrganizationSettingsFormData) => {
    setIsLoading(true);
    try {
      let file;
      if (data.logoFile) {
        const formData = new FormData();

        formData.append('files', data.logoFile[0]);
        file = formData;
      }

      filterUneditedKeys(data, form.formState.dirtyFields);

      const result = await updateOrganizationSettings(organization.id, data, file);

      if (result.error) {
        toast({
          title: t_messages('errors.update'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t_messages('success.update'),
        description: t('messages.updateSuccess'),
      });
    } catch (error) {
      toast({
        title: t_messages('errors.update'),
        description: t_messages('errors.unknown') + error,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Section Informations Générales */}
        <CardContainer title={t('title')}>
          <div className={'space-y-4'}>
            <FormField
              control={form.control}
              name="logoFile"
              render={({ field }) => (
                <DocumentUploadField<OrganizationSettingsFormData>
                  id={field.name}
                  field={field}
                  accept="image/*"
                  form={form}
                  label={t('settings.general.logo')}
                  required={true}
                  disabled={isLoading}
                />
              )}
            />

            {/* Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.general.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('settings.general.placeholders.name')}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <RoleGuard roles={['SUPER_ADMIN']} fallback={<></>}>
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
                          label: t(`types.${type}`),
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
                          label: t(`status.${status}`),
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
            </RoleGuard>
          </div>
        </CardContainer>

        <Tabs
          value={countryTab ?? undefined}
          onValueChange={(value) => handleTabChange(value, 'country')}
        >
          <TabsList>
            {organization.countries.map((country) => (
              <TabsTrigger key={country.id} value={country.code}>
                {country.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {organization.countries.map((country) => (
            <TabsContent key={country.id} value={country.code} className={'space-y-4'}>
              <CardContainer
                title={t('settings.configForCountry', {
                  country: t_countries(country.code.toLowerCase()),
                })}
              >
                <div className={'space-y-6'}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('settings.contact.title')}</h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Email */}
                      <FormField
                        control={form.control}
                        name={`metadata.${country.code}.settings.contact.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('settings.general.email')}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                {...field}
                                placeholder="contact@example.com"
                              />
                            </FormControl>
                            <TradFormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Téléphone */}
                      <FormField
                        control={form.control}
                        name={`metadata.${country.code}.settings.contact.phone`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('settings.general.phone')}</FormLabel>
                            <FormControl>
                              <Input type={'tel'} {...field} />
                            </FormControl>
                            <TradFormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Site web */}
                      <FormField
                        control={form.control}
                        name={`metadata.${country.code}.settings.contact.website`}
                        render={({ field }) => (
                          <FormItem className={'lg:col-span-2'}>
                            <FormLabel>{t('settings.general.website')}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type={'url'}
                                placeholder="https://www.example.com"
                              />
                            </FormControl>
                            <TradFormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Adresse */}
                      <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.address.firstLine`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('settings.general.address_line1')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.address.secondLine`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('settings.general.address_line2')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.address.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('settings.general.city')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.address.zipCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('settings.general.zip_code')}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t('settings.schedule.title')}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                      {weekDays.map((day) => (
                        <DaySchedule
                          key={day}
                          day={day}
                          countryCode={country.code}
                          form={form}
                          t={t_common}
                        />
                      ))}
                    </div>
                  </div>
                  <Separator />

                  {/* Section Jours fériés */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {t('settings.holidays.title')}
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const holidays =
                            form.getValues(
                              `metadata.${country.code}.settings.holidays`,
                            ) || [];
                          form.setValue(`metadata.${country.code}.settings.holidays`, [
                            ...holidays,
                            { date: '', name: '' },
                          ]);
                        }}
                      >
                        {t('settings.holidays.add')}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {form
                        .watch(`metadata.${country.code}.settings.holidays`)
                        ?.map((_: never, index: React.Key | null | undefined) => (
                          <CardContainer key={index} contentClass={'!p-4 relative'}>
                            <div className="grid gap-4">
                              <div className="flex items-start justify-between">
                                <div className="grid flex-1 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`metadata.${country.code}.settings.holidays.${index}.date`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {t('settings.holidays.date')}
                                        </FormLabel>
                                        <FormControl>
                                          <DatePicker
                                            date={field.value || new Date()}
                                            onSelect={(date) => field.onChange(date)}
                                          />
                                        </FormControl>
                                        <TradFormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`metadata.${country.code}.settings.holidays.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {t('settings.holidays.name')}
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <TradFormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={'absolute right-2 top-2'}
                                  onClick={() => {
                                    const holidays = form.getValues(
                                      `metadata.${country.code}.settings.holidays`,
                                    );
                                    form.setValue(
                                      `metadata.${country.code}.settings.holidays`,
                                      // eslint-disable-next-line
                                      holidays.filter((_: any, i: any) => i !== index),
                                    );
                                  }}
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContainer>
                        ))}
                    </div>
                  </div>
                  <Separator />

                  {/* Section Fermetures exceptionnelles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {t('settings.closures.title')}
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const closures =
                            form.getValues(
                              `metadata.${country.code}.settings.closures`,
                            ) || [];
                          form.setValue(`metadata.${country.code}.settings.closures`, [
                            ...closures,
                            { start: '', end: '', reason: '' },
                          ]);
                        }}
                      >
                        {t('settings.closures.add')}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {form
                        .watch(`metadata.${country.code}.settings.closures`)
                        ?.map((_: never, index: React.Key | null | undefined) => (
                          <CardContainer key={index} contentClass={'!p-4 relative'}>
                            <div className="grid gap-4">
                              <div className="flex items-start justify-between">
                                <div className="grid flex-1 gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`metadata.${country.code}.settings.closures.${index}.start`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {t('settings.closures.start_date')}
                                          </FormLabel>
                                          <FormControl>
                                            <DatePicker
                                              date={field.value || new Date()}
                                              onSelect={(date) => field.onChange(date)}
                                            />
                                          </FormControl>
                                          <TradFormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`metadata.${country.code}.settings.closures.${index}.end`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {t('settings.closures.end_date')}
                                          </FormLabel>
                                          <FormControl>
                                            <DatePicker
                                              date={field.value || new Date()}
                                              onSelect={(date) => field.onChange(date)}
                                            />
                                          </FormControl>
                                          <TradFormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name={`metadata.${country.code}.settings.closures.${index}.reason`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {t('settings.closures.reason')}
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <TradFormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={'absolute right-2 top-2'}
                                  onClick={() => {
                                    const closures = form.getValues(
                                      `metadata.${country.code}.settings.closures`,
                                    );
                                    form.setValue(
                                      `metadata.${country.code}.settings.closures`,

                                      closures.filter(
                                        (_: never, i: number) => i !== index,
                                      ),
                                    );
                                  }}
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContainer>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContainer>
            </TabsContent>
          ))}
        </Tabs>
        <div className="actions py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLoading
              ? t_common('common.actions.saving')
              : t_common('common.actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

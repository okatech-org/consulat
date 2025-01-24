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
  TradFormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { DaySchedule } from '@/app/(authenticated)/manager/_utils/components/day-schedule';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { updateOrganizationSettings } from '@/app/(authenticated)/manager/_utils/actions/organization';
import { DocumentUploadField } from '@/components/ui/document-upload';
import { weekDays } from '@/lib/utils';

interface OrganizationSettingsProps {
  organization: Organization;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const schema = generateOrganizationSettingsSchema(
    organization.countries as unknown as Country[],
  );
  const t = useTranslations('manager.settings');
  const t_common = useTranslations('common');
  const t_countries = useTranslations('countries');
  const [selectedCountry, setSelectedCountry] = React.useState(
    organization.countries[0]?.id,
  );
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  console.log(JSON.stringify(organization, null, 2));

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

      const result = await updateOrganizationSettings(organization.id, data, file);

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
        description: t('messages.success.update_description'),
      });
    } catch (error) {
      toast({
        title: t('messages.error.update'),
        description: t('messages.error.unknown') + error,
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
        <Card>
          <CardHeader>
            <CardTitle>{t('organization.title')}</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <FormField
              control={form.control}
              name="logoFile"
              render={({ field }) => (
                <DocumentUploadField<OrganizationSettingsFormData>
                  id={field.name}
                  field={field}
                  accept="image/*"
                  form={form}
                  label={t('organization.general.logo')}
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
                  <FormLabel>{t('organization.general.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('organization.general.placeholders.name')}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Tabs value={selectedCountry} onValueChange={setSelectedCountry}>
          <TabsList>
            {organization.countries.map((country) => (
              <TabsTrigger key={country.id} value={country.id}>
                {country.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {organization.countries.map((country) => (
            <TabsContent key={country.id} value={country.id} className={'space-y-4'}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('organization.configForCountry', {
                      country: t_countries(country.code.toLowerCase() as any),
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className={'space-y-6'}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t('organization.contact.title')}
                    </h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Email */}
                      <FormField
                        control={form.control}
                        name={`metadata.${country.code}.settings.contact.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('organization.general.email')}</FormLabel>
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
                            <FormLabel>{t('organization.general.phone')}</FormLabel>
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
                            <FormLabel>{t('organization.general.website')}</FormLabel>
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
                      <div className="space-y-4 lg:col-span-2">
                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.address.firstLine`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t('organization.general.address_line1')}
                              </FormLabel>
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
                              <FormLabel>
                                {t('organization.general.address_line2')}
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`metadata.${country.code}.settings.contact.address.city`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('organization.general.city')}</FormLabel>
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
                                <FormLabel>
                                  {t('organization.general.zip_code')}
                                </FormLabel>
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
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {t('organization.schedule.title')}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                      {weekDays.map((day) => (
                        <DaySchedule
                          key={day}
                          day={day}
                          countryCode={country.code}
                          form={form}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                  <Separator />

                  {/* Section Jours fériés */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {t('organization.holidays.title')}
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
                        {t('organization.holidays.add')}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {form
                        .watch(`metadata.${country.code}.settings.holidays`)
                        ?.map((_: any, index: React.Key | null | undefined) => (
                          <Card key={index}>
                            <CardContent className="relative p-4">
                              <div className="grid gap-4">
                                <div className="flex items-start justify-between">
                                  <div className="grid flex-1 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`metadata.${country.code}.settings.holidays.${index}.date`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {t('organization.holidays.date')}
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
                                            {t('organization.holidays.name')}
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
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                  <Separator />

                  {/* Section Fermetures exceptionnelles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {t('organization.closures.title')}
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
                        {t('organization.closures.add')}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {form
                        .watch(`metadata.${country.code}.settings.closures`)
                        ?.map((_: any, index: React.Key | null | undefined) => (
                          <Card key={index}>
                            <CardContent className="relative p-4">
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
                                              {t('organization.closures.start_date')}
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
                                              {t('organization.closures.end_date')}
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
                                            {t('organization.closures.reason')}
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
                                        // eslint-disable-next-line
                                        closures.filter((_: any, i: any) => i !== index),
                                      );
                                    }}
                                  >
                                    <Trash className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        <div className="actions py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLoading ? t_common('actions.saving') : t_common('actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

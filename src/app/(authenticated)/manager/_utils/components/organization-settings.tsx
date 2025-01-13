'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, TradFormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  generateOrganizationSettingsSchema,
  OrganizationSettingsFormData,
} from '@/schemas/organization'
import { Organization } from '@/types/organization'
import { Input } from '@/components/ui/input'
import { Country } from '@/types/country'

interface OrganizationSettingsProps {
  organization: Organization
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const schema = generateOrganizationSettingsSchema(organization.countries as unknown as Country[])
  const t = useTranslations('manager.settings')
  const t_common = useTranslations('common')
  const t_countries = useTranslations('countries')
  const [selectedCountry, setSelectedCountry] = React.useState(organization.countries[0]?.id)

  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(schema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-4">
        {/* Section Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>{t('organization.title')}</CardTitle>
          </CardHeader>
          <CardContent className={"space-y-4"}>
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
              <FormItem>
                <FormLabel>{t('organization.general.logo')}</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" {...field} />
                </FormControl>
                <TradFormMessage />
              </FormItem>
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
                    <Input {...field} placeholder={t('organization.general.placeholders.name')} />
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
              <TabsContent key={country.id} value={country.id} className={"space-y-4"}>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('organization.configForCountry', {
                      country: t_countries(country.code.toLowerCase()),
                    })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3>{t('organization.contact')}</h3>
                      <div className="grid gap-4">
                        {/* Email */}
                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('organization.general.email')}</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} placeholder="contact@example.com" />
                              </FormControl>
                              <FormMessage />
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
                                <Input type={"tel"} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Site web */}
                        <FormField
                          control={form.control}
                          name={`metadata.${country.code}.settings.contact.website`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('organization.general.website')}</FormLabel>
                              <FormControl>
                                <Input {...field} type={"url"} placeholder="https://www.example.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Adresse */}
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`metadata.${country.code}.settings.contact.address.firstLine`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('organization.general.address_line1')}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`metadata.${country.code}.settings.contact.address.secondLine`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('organization.general.address_line2')}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
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
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`metadata.${country.code}.settings.contact.address.zipCode`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('organization.general.zip_code')}</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3>
                        {t('organization.schedule')}
                      </h3>
                      <div className="grid gap-4"></div>
                    </div>
                    <div className="space-y-4">
                      <h3>
                        {t('organization.closures')}
                      </h3>
                      <div className="grid gap-4"></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        <Button type="submit">{t_common('actions.save')}</Button>
      </form>
    </Form>
  )
}
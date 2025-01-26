import {
  getOrganizationById,
  getOrganizations,
} from '@/app/(authenticated)/superadmin/_utils/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from '@/components/service/organization-settings';
import { GeneralSettings } from '@/app/(authenticated)/manager/_utils/components/general-settings';
import { CreateServiceButton } from '@/app/(authenticated)/superadmin/_utils/components/create-service-button';
import { ServicesTable } from '@/app/(authenticated)/superadmin/_utils/components/services-table';
import CardContainer from '@/components/layouts/card-container';
import { getCountries } from '@/actions/countries';

export default async function OrganizationSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const [
    { data: organization, error: organizationError },
    { data: organizations, error: organizationsError },
    { data: countries, error: countriesError },
  ] = await Promise.all([
    getOrganizationById(params.id),
    getOrganizations(),
    getCountries(),
  ]);

  const t = await getTranslations();

  if (!organization || organizationsError || organizationError || countriesError) {
    notFound();
  }

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('organization.title')}</h1>
        <p className="text-muted-foreground">{t('organization.settings.description')}</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">
            {t('organization.settings.tabs.organization')}
          </TabsTrigger>
          <TabsTrigger value="services">
            {t('organization.settings.tabs.services')}
          </TabsTrigger>
          <TabsTrigger value="general">
            {t('organization.settings.tabs.general')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          {organization && (
            <OrganizationSettings
              countries={countries ?? []}
              organization={organization}
            />
          )}
        </TabsContent>

        <TabsContent value="services">
          {/* Liste des services liés */}
          <CardContainer
            title={t('organization.form.linked_services.title')}
            action={
              <CreateServiceButton
                initialData={{
                  organizationId: organization.id,
                }}
              />
            }
          >
            <ServicesTable
              organizations={organizations ?? []}
              services={organization.services ?? []}
            />
          </CardContainer>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

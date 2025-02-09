'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from '@/components/organization/organization-settings';
import { GeneralSettings } from '@/app/(authenticated)/admin/_utils/components/general-settings';
import { CreateServiceButton } from '@/components/organization/create-service-button';
import { ServicesTable } from '@/components/organization/services-table';
import CardContainer from '@/components/layouts/card-container';
import { CreateAgentButton } from '@/components/organization/CreateAgentButton';
import { UsersTable } from '@/components/organization/users-table';
import * as React from 'react';
import { Organization } from '@/types/organization';
import { CountryMetadata } from '@/types/country';
import { useTabs } from '@/hooks/use-tabs';

interface SettingsTabsProps {
  organization: Organization;
}

export function SettingsTabs({ organization }: SettingsTabsProps) {
  const t = useTranslations('organization');
  const { handleTabChange, searchParams } = useTabs();

  // Récupérer la valeur de l'onglet depuis l'URL ou utiliser la valeur par défaut
  const tab = searchParams.get('tab') || 'organization';

  return (
    <Tabs defaultValue={tab} className="space-y-4" onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="organization">{t('settings.tabs.organization')}</TabsTrigger>
        <TabsTrigger value="services">{t('settings.tabs.services')}</TabsTrigger>
        <TabsTrigger value="agents">{t('settings.tabs.agents')}</TabsTrigger>
        <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        <OrganizationSettings
          countries={organization.countries.map((country) => ({
            ...country,
            metadata: JSON.parse(country.metadata as string) as CountryMetadata,
          }))}
          organization={organization}
        />
      </TabsContent>

      <TabsContent value="services">
        <CardContainer
          title={t('form.linked_services.title')}
          action={
            <CreateServiceButton
              initialData={{
                organizationId: organization.id,
              }}
            />
          }
        >
          <ServicesTable
            organizations={[organization]}
            services={organization.services ?? []}
          />
        </CardContainer>
      </TabsContent>

      <TabsContent value="general" className="space-y-4">
        <GeneralSettings />
      </TabsContent>

      <TabsContent value="agents" className="space-y-4">
        <CardContainer
          title={t('settings.agents.title')}
          action={
            <CreateAgentButton
              initialData={{
                organizationId: organization.id,
              }}
              countries={organization.countries ?? []}
            />
          }
        >
          <UsersTable
            agents={organization.agents ?? []}
            countries={organization.countries ?? []}
          />
        </CardContainer>
      </TabsContent>
    </Tabs>
  );
}

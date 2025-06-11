'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from '@/components/organization/organization-settings';
import { CreateServiceButton } from '@/components/organization/create-service-button';
import { ServicesTable } from '@/components/organization/services-table';
import CardContainer from '@/components/layouts/card-container';
import { CreateAgentButton } from '@/components/organization/create-agent-button';
import * as React from 'react';
import { Organization } from '@/types/organization';
import { Country, User } from '@prisma/client';
import { useTabs } from '@/hooks/use-tabs';
import { AgentsTable } from '@/app/(authenticated)/dashboard/agents/_components/agents-table';

interface SettingsTabsProps {
  organization: Organization & { managers: User[] };
  availableCountries: Country[];
}

export function SettingsTabs({
  organization,
  availableCountries = [],
}: SettingsTabsProps) {
  const t = useTranslations('organization');
  const { handleTabChange, currentTab } = useTabs<string>('tab', 'organization');

  return (
    <Tabs defaultValue={currentTab} className="space-y-4" onValueChange={handleTabChange}>
      <TabsList className="flex-wrap !h-auto">
        <TabsTrigger value="organization">{t('settings.tabs.organization')}</TabsTrigger>
        <TabsTrigger value="services">{t('settings.tabs.services')}</TabsTrigger>
        <TabsTrigger value="agents">{t('settings.tabs.agents')}</TabsTrigger>
        <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        <OrganizationSettings
          organization={organization}
          availableCountries={availableCountries}
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
              countries={organization.countries ?? []}
            />
          }
        >
          <ServicesTable organizations={[organization]} />
        </CardContainer>
      </TabsContent>

      <TabsContent value="general" className="space-y-4">
        <h2>{t('settings.general.title')}</h2>
      </TabsContent>

      <TabsContent value="agents" className="space-y-4">
        <CardContainer
          title="Agents et Managers"
          action={
            <CreateAgentButton
              initialData={{
                assignedOrganizationId: organization.id,
              }}
              countries={organization.countries ?? []}
            />
          }
        >
          <AgentsTable
            countries={availableCountries}
            services={organization.services ?? []}
            organizations={[organization]}
            managers={organization.managers ?? []}
          />
        </CardContainer>
      </TabsContent>
    </Tabs>
  );
}

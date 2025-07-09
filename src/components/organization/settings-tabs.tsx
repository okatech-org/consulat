'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Organization } from '@/types/organization';
import { Country } from '@/types/country';
import { OrganizationSettings } from './organization-settings';
import { CreateAgentButton } from './create-agent-button';
import { AgentsTable } from './agents-table-with-filters';
import CardContainer from '@/components/layouts/card-container';
import { AircallSettings } from './aircall-settings';
import { AircallConfig } from '@/schemas/aircall';
import { useOrganizationSettings } from '@/hooks/use-organizations';

interface SettingsTabsProps {
  organization: Organization;
  availableCountries: Country[];
}

export function SettingsTabs({
  organization,
  availableCountries = [],
}: SettingsTabsProps) {
  const t = useTranslations('organization.settings');
  const { updateSettings } = useOrganizationSettings(organization.id);
  const [activeTab, setActiveTab] = useState('organization');

  const handleAircallSave = async (config: AircallConfig) => {
    // Récupérer la configuration actuelle
    const currentMetadata = organization.metadata || {};
    
    // Mettre à jour la configuration Aircall pour tous les pays de l'organisation
    const updatedMetadata = { ...currentMetadata };
    
    organization.countries.forEach((country) => {
      if (!updatedMetadata[country.code]) {
        updatedMetadata[country.code] = { settings: {} };
      }
      updatedMetadata[country.code].settings = {
        ...updatedMetadata[country.code].settings,
        aircall: config,
      };
    });

    await updateSettings({
      id: organization.id,
      data: {
        metadata: updatedMetadata,
      },
    });
  };

  // Récupérer la configuration Aircall (on prend celle du premier pays)
  const firstCountry = organization.countries[0];
  const aircallConfig = firstCountry?.code 
    ? organization.metadata?.[firstCountry.code]?.settings?.aircall 
    : undefined;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="organization">{t('tabs.organization')}</TabsTrigger>
        <TabsTrigger value="agents">{t('tabs.agents')}</TabsTrigger>
        <TabsTrigger value="aircall">Aircall</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        <OrganizationSettings
          organization={organization}
          availableCountries={availableCountries}
        />
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

      <TabsContent value="aircall" className="space-y-4">
        <AircallSettings
          config={aircallConfig}
          onSave={handleAircallSave}
        />
      </TabsContent>
    </Tabs>
  );
}

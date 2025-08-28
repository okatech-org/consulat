'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './organization-settings';
import { CreateAgentButton } from './create-agent-button';
import CardContainer from '@/components/layouts/card-container';
import { AircallSettings } from './aircall-settings';
import type { AircallConfig } from '@/schemas/aircall';
import { useOrganizationSettings } from '@/hooks/use-organizations';
import type { OrganizationDetails } from '@/server/api/routers/organizations/types';
import { AgentsTable } from '@/app/(authenticated)/dashboard/agents/_components/agents-table';
import { UserRole } from '@prisma/client';
import { ServicesTable } from './services-table';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';

interface SettingsTabsProps {
  organization: OrganizationDetails;
}

export function SettingsTabs({ organization }: SettingsTabsProps) {
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
        <TabsTrigger value="services">{t('tabs.services')}</TabsTrigger>
        <TabsTrigger value="aircall">Aircall</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        <OrganizationSettings organization={organization} />
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <Button asChild>
          <Link href={ROUTES.dashboard.services_new}>
            <Plus className="size-icon" />
            <span className={'hidden sm:inline'}>Ajouter un service</span>
          </Link>
        </Button>
        <ServicesTable organizations={[organization]} />
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
            services={organization.services ?? []}
            organizations={[organization]}
            managers={
              organization.agents.filter((agent) => agent.role === UserRole.MANAGER) ?? []
            }
          />
        </CardContainer>
      </TabsContent>

      <TabsContent value="aircall" className="space-y-4">
        <AircallSettings config={aircallConfig} onSave={handleAircallSave} />
      </TabsContent>
    </Tabs>
  );
}

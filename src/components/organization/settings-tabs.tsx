'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './organization-settings';
import { CreateAgentButton } from './create-agent-button';
import CardContainer from '@/components/layouts/card-container';
import type { Organization } from '@/convex/lib/types';
import { AgentsTable } from '@/app/(authenticated)/dashboard/agents/_components/agents-table';
import { CountryStatus } from '@/convex/lib/constants';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ServicesTable } from './services-table';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';

interface SettingsTabsProps {
  organization: Organization;
}

export function SettingsTabs({ organization }: SettingsTabsProps) {
  const t = useTranslations('organization.settings');
  const [activeTab, setActiveTab] = useState('organization');

  const countries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });

  const organizationCountries = countries?.filter((c) =>
    organization?.countryCodes.includes(c.code),
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="organization">{t('tabs.organization')}</TabsTrigger>
        <TabsTrigger value="agents">{t('tabs.agents')}</TabsTrigger>
        <TabsTrigger value="services">{t('tabs.services')}</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-4">
        {organization && <OrganizationSettings organization={organization} />}
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <Button asChild>
          <Link href={ROUTES.dashboard.services_new}>
            <Plus className="size-icon" />
            <span className={'hidden sm:inline'}>Ajouter un service</span>
          </Link>
        </Button>
        {organization && <ServicesTable organizations={[organization]} />}
      </TabsContent>

      <TabsContent value="agents" className="space-y-4">
        <CardContainer
          title="Agents et Managers"
          action={
            organization && (
              <CreateAgentButton
                initialData={{
                  assignedOrganizationId: organization._id,
                }}
                countries={organizationCountries || []}
              />
            )
          }
        >
          {organization && (
            <AgentsTable
              organizations={[organization]}
              defaultOrganizationId={organization._id}
            />
          )}
        </CardContainer>
      </TabsContent>
    </Tabs>
  );
}

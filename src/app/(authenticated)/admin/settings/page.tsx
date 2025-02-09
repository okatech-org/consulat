import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from '@/components/service/organization-settings';
import { GeneralSettings } from '@/app/(authenticated)/admin/_utils/components/general-settings';
import { CreateServiceButton } from '@/components/organization/create-service-button';
import { ServicesTable } from '@/components/organization/services-table';
import CardContainer from '@/components/layouts/card-container';
import { CreateAgentButton } from '@/components/organization/CreateAgentButton';
import { UsersTable } from '@/components/organization/users-table';
import { getCurrentUser } from '@/actions/user';

export default async function OrganizationSettingsPage() {
  const user = await getCurrentUser();

  if (!user?.organizationId) {
    notFound();
  }

  const t = await getTranslations();
  const organization = await getOrganizationById(user.organizationId);

  if (!organization.data) {
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
          <TabsTrigger value="agents">
            {t('organization.settings.tabs.agents')}
          </TabsTrigger>
          <TabsTrigger value="general">
            {t('organization.settings.tabs.general')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          {organization && (
            <OrganizationSettings countries={[]} organization={organization.data} />
          )}
        </TabsContent>

        <TabsContent value="services">
          {/* Liste des services liés */}
          <CardContainer
            title={t('organization.form.linked_services.title')}
            action={
              <CreateServiceButton
                initialData={{
                  organizationId: organization.data.id,
                }}
              />
            }
          >
            <ServicesTable
              organizations={[organization.data]}
              services={organization.data?.services ?? []}
            />
          </CardContainer>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          {' '}
          {/* Contenu du nouvel onglet Agents */}
          <CardContainer
            title={t('organization.settings.agents.title')}
            action={
              <CreateAgentButton
                initialData={{
                  organizationId: organization.data.id,
                }}
                countries={organization.data.countries ?? []}
              />
            }
          >
            <UsersTable agents={organization.data.agents ?? []} />
          </CardContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}

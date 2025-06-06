import { PageContainer } from '@/components/layouts/page-container';
import { CreateAgentButton } from '@/components/organization/create-agent-button';
import { getActiveCountries } from '@/actions/countries';
import { getOrganizationManagers, getOrganizations } from '@/actions/organizations';
import { getServices } from '../(superadmin)/_utils/actions/services';
import { getOrganizationIdFromUser } from '@/lib/utils';
import { getCurrentUser } from '@/actions/user';
import { AgentsTable } from './_components/agents-table';

export default async function AgentsListingPage() {
  const currentUser = await getCurrentUser();
  const organizationId = getOrganizationIdFromUser(currentUser);

  const [countriesData, services, organizations, managers] = await Promise.all([
    getActiveCountries(organizationId),
    getServices(organizationId),
    getOrganizations(organizationId),
    getOrganizationManagers(organizationId),
  ]);

  return (
    <PageContainer
      title="Agents"
      action={
        <CreateAgentButton
          initialData={{
            assignedOrganizationId: organizationId,
          }}
          countries={countriesData}
        />
      }
    >
      <AgentsTable
        countries={countriesData}
        services={services}
        organizations={organizations}
        managers={managers.data ?? []}
      />
    </PageContainer>
  );
}

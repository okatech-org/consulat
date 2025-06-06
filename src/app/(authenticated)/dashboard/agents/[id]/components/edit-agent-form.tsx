'use client';

import { useState, useEffect } from 'react';
import { tryCatch } from '@/lib/utils';
import {
  AgentDetails,
  getAgentDetails,
  getServicesForOrganization,
} from '@/actions/agents';
import { getActiveCountries } from '@/actions/countries';
import { getOrganizationManagers, getAvailableAgentsForManager } from '@/actions/organizations';
import { useCurrentUser } from '@/hooks/use-current-user';
import { AgentForm } from '@/components/organization/agent-form';
import { Loader2 } from 'lucide-react';

interface EditAgentFormProps {
  agent: AgentDetails;
  onSuccess: (updatedAgent: AgentDetails) => void;
  onCancel: () => void;
}

export function EditAgentForm({ agent, onSuccess, onCancel }: EditAgentFormProps) {
  const currentUser = useCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<{ id: string; code: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
      const organizationId = isSuperAdmin
        ? undefined
        : agent.assignedOrganizationId || undefined;

      const [countriesResult, servicesResult, managersResult, agentsResult] = await Promise.all([
        tryCatch(getActiveCountries()),
        tryCatch(getServicesForOrganization(organizationId)),
        tryCatch(getOrganizationManagers(agent.assignedOrganizationId || '')),
        tryCatch(getAvailableAgentsForManager(agent.assignedOrganizationId || '')),
      ]);

      if (countriesResult.data) {
        setCountries(
          countriesResult.data.map((c) => ({ id: c.id, code: c.code, name: c.name })),
        );
      }

      if (servicesResult.data) {
        setServices(servicesResult.data.map((s) => ({ id: s.id, name: s.name })));
      }

      if (managersResult.data) {
        setManagers(managersResult.data.filter(m => m.id !== agent.id));
      }

      if (agentsResult.data) {
        setAgents(agentsResult.data.filter(a => a.id !== agent.id));
      }

      setIsLoading(false);
    }

    loadData();
  }, [currentUser, agent.assignedOrganizationId, agent.id]);

  const handleSuccess = async () => {
    // Refetch agent data to get updated information
    const updatedAgentResult = await tryCatch(getAgentDetails(agent.id));
    if (updatedAgentResult.data) {
      onSuccess(updatedAgentResult.data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Parse agent name into first and last name
  const nameParts = agent.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Get managed agent IDs if this is a manager
  const managedAgentIds = agent.managedAgents?.map(a => a.id) || [];

  return (
    <AgentForm
      initialData={{
        firstName,
        lastName,
        email: agent.email || undefined,
        phoneNumber: agent.phoneNumber || undefined,
        role: agent.roles?.includes('MANAGER') ? 'MANAGER' : 'AGENT',
        managedByUserId: agent.managedByUserId || undefined,
        countryIds: agent.linkedCountries?.map((c) => c.id) || [],
        serviceIds: agent.assignedServices?.map((s) => s.id) || [],
        assignedOrganizationId: agent.assignedOrganizationId || '',
        managedAgentIds,
      }}
      countries={countries}
      services={services}
      managers={managers}
      agents={agents}
      onSuccess={handleSuccess}
      isEditMode={true}
      agentId={agent.id}
    />
  );
}

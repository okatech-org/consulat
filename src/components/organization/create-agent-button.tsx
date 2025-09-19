'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AgentForm } from './agent-form'; // Import AgentForm
import { type AgentFormData } from '@/schemas/user';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { type Organization } from '@/types/organization';

import { getServicesForOrganization } from '@/actions/agents';
import {
  getOrganizationManagers,
  getAvailableAgentsForManager,
} from '@/actions/organizations';
import { tryCatch } from '@/lib/utils';

interface CreateAgentButtonProps {
  initialData?: Partial<AgentFormData>;
  countries: Organization['countries'];
}

export function CreateAgentButton({ initialData, countries }: CreateAgentButtonProps) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      if (initialData?.assignedOrganizationId) {
        const [servicesResult, managersResult, agentsResult] = await Promise.all([
          tryCatch(getServicesForOrganization(initialData.assignedOrganizationId)),
          tryCatch(getOrganizationManagers(initialData.assignedOrganizationId)),
          tryCatch(getAvailableAgentsForManager(initialData.assignedOrganizationId)),
        ]);

        if (servicesResult.data) {
          setServices(servicesResult.data);
        }
        if (managersResult.data) {
          const validManagers = managersResult.data?.filter(
            (m): m is { id: string; name: string } => m.name !== null,
          );
          setManagers(validManagers);
        }
        if (agentsResult.data) {
          const validAgents = agentsResult.data?.filter(
            (a): a is { id: string; name: string } => a.name !== null,
          );
          setAgents(validAgents);
        }
      }
    }
    loadData();
  }, [initialData?.assignedOrganizationId]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button leftIcon={<Plus className="size-4" />}>
          <span className={'mobile-hide-inline'}>Ajouter</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[50%] max-w-3xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">Créer un utilisateur</SheetTitle>
          <SheetDescription>
            Ajouter un nouvel agent ou manager à votre organisation
          </SheetDescription>
        </SheetHeader>
        <AgentForm
          initialData={initialData}
          countries={countries}
          services={services}
          managers={managers}
          agents={agents}
          onSuccess={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

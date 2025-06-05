'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AgentForm } from './AgentForm'; // Import AgentForm
import { AgentFormData } from '@/schemas/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Organization } from '@/types/organization';

import { getServicesForOrganization } from '@/actions/agents';
import { getOrganizationManagers } from '@/actions/organizations';
import { tryCatch } from '@/lib/utils';

interface CreateAgentButtonProps {
  initialData?: Partial<AgentFormData>;
  countries: Organization['countries'];
}

export function CreateAgentButton({ initialData, countries }: CreateAgentButtonProps) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string; name: string | null }[]>([]);

  useEffect(() => {
    async function loadData() {
      if (initialData?.assignedOrganizationId) {
        const [servicesResult, managersResult] = await Promise.all([
          tryCatch(getServicesForOrganization(initialData.assignedOrganizationId)),
          tryCatch(getOrganizationManagers(initialData.assignedOrganizationId)),
        ]);
        
        if (servicesResult.data) {
          setServices(servicesResult.data);
        }
        if (managersResult.data) {
          const validManagers = managersResult.data
            .filter((m): m is { id: string; name: string } => m.name !== null);
          setManagers(validManagers);
        }
      }
    }
    loadData();
  }, [initialData?.assignedOrganizationId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          <span className={'mobile-hide-inline'}>Ajouter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
          <DialogDescription>Ajouter un nouvel agent ou manager à votre organisation</DialogDescription>
        </DialogHeader>
        <AgentForm
          initialData={initialData}
          countries={countries}
          services={services}
          managers={managers}
          onSuccess={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

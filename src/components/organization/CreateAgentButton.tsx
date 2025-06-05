'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { tryCatch } from '@/lib/utils';

interface CreateAgentButtonProps {
  initialData?: Partial<AgentFormData>;
  countries: Organization['countries'];
}

export function CreateAgentButton({ initialData, countries }: CreateAgentButtonProps) {
  const t = useTranslations('organization.settings.agents');
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadServices() {
      if (initialData?.assignedOrganizationId) {
        const result = await tryCatch(
          getServicesForOrganization(initialData.assignedOrganizationId),
        );
        if (result.data) {
          setServices(result.data);
        }
      }
    }
    loadServices();
  }, [initialData?.assignedOrganizationId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          <span className={'mobile-hide-inline'}>{t('create')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('create_agent_modal.title')}</DialogTitle>
          <DialogDescription>{t('create_agent_modal.description')}</DialogDescription>
        </DialogHeader>
        <AgentForm
          initialData={initialData}
          countries={countries}
          services={services}
          onSuccess={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

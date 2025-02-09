'use client';

import React, { useState } from 'react';
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

interface CreateAgentButtonProps {
  initialData?: Partial<AgentFormData>;
  countries: Organization['countries'];
}

export function CreateAgentButton({ initialData, countries }: CreateAgentButtonProps) {
  const t = useTranslations('organization.settings.agents');
  const [open, setOpen] = useState(false);

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
        <AgentForm initialData={initialData} countries={countries} />
      </DialogContent>
    </Dialog>
  );
}

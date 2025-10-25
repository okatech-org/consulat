'use client';

import { useState } from 'react';
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
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';

interface CreateAgentButtonProps {
  initialData?: Partial<AgentFormData>;
  countries: Doc<'countries'>[];
}

export function CreateAgentButton({ initialData, countries }: CreateAgentButtonProps) {
  const [open, setOpen] = useState(false);

  const organizationId = initialData?.assignedOrganizationId as
    | Id<'organizations'>
    | undefined;

  const servicesData = useQuery(
    api.functions.service.getAllServices,
    organizationId ? { organizationId } : 'skip',
  );

  const managersData = useQuery(
    api.functions.membership.getManagersForFilter,
    organizationId ? { organizationId } : 'skip',
  );

  const services = servicesData?.map((s) => ({ id: s._id, name: s.name })) || [];
  const managers = managersData?.map((m) => ({ id: m._id!, name: m.name || '' })) || [];
  const agents: { id: string; name: string }[] = [];

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

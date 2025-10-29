'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { type NewServiceSchemaInput } from '@/schemas/consular-service';
import { type Country } from '@/types';
import { ServiceCreationFlow } from '@/components/organization/service-creation-flow';
import { useServices } from '@/hooks/use-services';
import type { Id } from '@/convex/_generated/dataModel';
import { useActiveCountries } from '@/hooks/use-countries';
import { useOrganizations } from '@/hooks/use-organizations';

export function CreateServiceButton({
  initialData,
}: {
  initialData?: Partial<NewServiceSchemaInput>;
}) {
  const t = useTranslations('services');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { createService } = useServices();
  const { countries } = useActiveCountries();
  const { organizations } = useOrganizations();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button leftIcon={<Plus className="size-icon" />}>
          <span className={'hidden sm:inline'}>{t('actions.create')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('form.create_title')}</DialogTitle>
        </DialogHeader>
        <ServiceCreationFlow
          countries={countries}
          organizations={organizations}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}

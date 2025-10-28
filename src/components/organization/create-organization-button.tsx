'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrganizationForm } from './organization-form';
import { api } from '@/convex/_generated/api';
import { CountryStatus } from '@/convex/lib/constants';
import { useQuery } from 'convex/react';
export function CreateOrganizationButton() {
  const countries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });
  const t = useTranslations('sa.organizations');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button leftIcon={<Plus className="size-4" />}>
          <span className={'mobile-hide-inline'}>{t('actions.create')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('form.create_title')}</DialogTitle>
        </DialogHeader>
        <OrganizationForm
          countries={countries ?? []}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

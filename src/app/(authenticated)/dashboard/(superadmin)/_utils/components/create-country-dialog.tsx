'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CountryForm } from './country-form';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { createCountry } from '@/actions/countries';
import { CountrySchemaInput } from '@/schemas/country';

export function CreateCountryDialog() {
  const t = useTranslations('sa.countries');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: CountrySchemaInput) => {
    const result = await createCountry(data);

    if (result.error) {
      toast({
        title: t('messages.error.create'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('messages.createSuccess'),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t('actions.create')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('actions.create')}</DialogTitle>
        </DialogHeader>
        <CountryForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}

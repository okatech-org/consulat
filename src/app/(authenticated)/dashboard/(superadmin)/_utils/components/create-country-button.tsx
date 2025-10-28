'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CountryForm } from './country-form';
import { toast } from 'sonner';
import type { CountrySchemaInput } from '@/schemas/country';
import { useCountries } from '@/hooks/use-countries';

export function CreateCountryButton() {
  const t = useTranslations('sa.countries');
  const t_messages = useTranslations('messages');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createCountry } = useCountries();

  const handleSubmit = async (data: CountrySchemaInput) => {
    setIsLoading(true);
    try {
      await createCountry({
        name: data.name,
        code: data.code,
        flag: data.flag ?? undefined,
        status: data.status,
      });
      setIsOpen(false);
    } catch (error) {
      toast.error(t_messages('errors.create'), {
        description: `${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          <span className={'ml-1 hidden sm:inline'}>{t('actions.create')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('actions.create')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>
        <CountryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}

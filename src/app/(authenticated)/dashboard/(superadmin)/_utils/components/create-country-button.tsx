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
import { createCountry } from '@/actions/countries';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CreateCountryInput } from '@/types/country';

export function CreateCountryButton() {
  const t = useTranslations('sa.countries');
  const t_messages = useTranslations('messages');
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateCountryInput) => {
    setIsLoading(true);
    try {
      const result = await createCountry(data);
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: t_messages('success.create'),
        variant: 'success',
      });

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: t_messages('errors.create'),
        variant: 'destructive',
        description: `${error}`,
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

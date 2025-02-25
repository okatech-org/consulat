'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CountryForm } from './country-form';
import { useToast } from '@/hooks/use-toast';
import { Country } from '@/types/country';
import { updateCountry } from '@/actions/countries';
import { CountrySchemaInput } from '@/schemas/country';
import { tryCatch } from '@/lib/utils';

interface EditCountryDialogProps {
  country: Country;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCountryDialog({
  country,
  open,
  onOpenChange,
}: EditCountryDialogProps) {
  const t = useTranslations('sa.countries');
  const { toast } = useToast();

  const handleSubmit = async (data: CountrySchemaInput) => {
    if (!data.id) return;

    const result = await tryCatch(updateCountry(data));

    if (result.error) {
      toast({
        title: t('messages.error.update'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('messages.updateSuccess'),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-w-2xl !max-h-[90%] overflow-auto'}>
        <DialogHeader>
          <DialogTitle>
            {t('actions.edit')} - {country.name}
          </DialogTitle>
        </DialogHeader>
        <CountryForm initialData={country} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CountryForm } from './country-form';
import { toast } from 'sonner';
import type { CountrySchemaInput } from '@/schemas/country';
import { useCountries } from '@/hooks/use-countries';
import type { CountryListingItem } from '@/convex/lib/types';

interface EditCountryDialogProps {
  country: CountryListingItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCountryDialog({
  country,
  open,
  onOpenChange,
}: EditCountryDialogProps) {
  const t = useTranslations('sa.countries');
  const { updateCountry } = useCountries();

  const handleSubmit = async (data: CountrySchemaInput) => {
    try {
      await updateCountry({
        countryId: country._id,
        name: data.name,
        code: data.code,
        flag: data.flag ?? undefined,
        status: data.status,
      });

      toast.success(t('messages.updateSuccess'));
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(t('messages.error.update'));
    }
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

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
import { createService } from '../../app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { NewServiceForm } from '@/components/organization/new-service-form';
import { NewServiceSchemaInput } from '@/schemas/consular-service';
import { Country } from '@prisma/client';

export function CreateServiceButton({
  initialData,
  countries,
}: {
  initialData?: Partial<NewServiceSchemaInput>;
  countries: Country[];
}) {
  const t = useTranslations('services');
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: NewServiceSchemaInput) => {
    setIsLoading(true);
    try {
      const result = await createService(data);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: t('messages.createSuccess'),
        variant: 'success',
      });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: t('messages.error.create'),
        description: `${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-icon" />
          <span className={'ml-1 hidden sm:inline'}>{t('actions.create')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('form.create_title')}</DialogTitle>
        </DialogHeader>
        <NewServiceForm
          countries={countries}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}

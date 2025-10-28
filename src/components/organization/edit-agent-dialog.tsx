'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelectCountries } from '@/components/ui/multi-select-countries';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';
import { type BaseAgent } from '@/types/organization';
import { type Country } from '@prisma/client';
import { getServicesForOrganization, updateAgent } from '@/actions/agents';
import { getActiveCountries } from '@/actions/countries';
import { tryCatch } from '@/lib/utils';
import { PhoneNumberInput } from '../ui/phone-number';
import { type CountryCode } from '@/lib/autocomplete-datas';

const editAgentSchema = z.object({
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  countryIds: z.array(z.string()).min(1, 'Au moins un pays doit être sélectionné'),
  serviceIds: z.array(z.string()).min(1, 'Au moins un service doit être assigné'),
});

type EditAgentFormData = z.infer<typeof editAgentSchema>;

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: BaseAgent;
  onSuccess: () => void;
}

export function EditAgentDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: EditAgentDialogProps) {
  const t_inputs = useTranslations('inputs');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages');
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<EditAgentFormData>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      email: agent.email || '',
      phoneNumber: agent.phoneNumber || '',
      countryIds: agent.linkedCountries?.map((c) => c.id) || [],
      serviceIds: agent.assignedServices?.map((s) => s.id) || [],
    },
  });

  useEffect(() => {
    async function loadData() {
      const [countriesResult, servicesResult] = await Promise.all([
        tryCatch(getActiveCountries()),
        tryCatch(getServicesForOrganization(agent.assignedOrganizationId || undefined)),
      ]);

      if (countriesResult.data) {
        setCountries(countriesResult.data);
      }

      if (servicesResult.data) {
        setServices(servicesResult.data);
      }
    }

    if (open) {
      loadData();
      // Reset form with agent data when dialog opens
      form.reset({
        email: agent.email || '',
        phoneNumber: agent.phoneNumber || '',
        countryIds: agent.linkedCountries?.map((c) => c.id) || [],
        serviceIds: agent.assignedServices?.map((s) => s.id) || [],
      });
    }
  }, [open, agent, form]);

  async function onSubmit(data: EditAgentFormData) {
    setIsLoading(true);

    const updateData = {
      email: data.email || undefined,
      phoneNumber: data.phoneNumber || undefined,
      countryIds: data.countryIds,
      serviceIds: data.serviceIds,
    };

    const result = await tryCatch(updateAgent(agent.id, updateData));

    if (result.data) {
      toast.success(t_messages('success.update'));
      onSuccess();
      onOpenChange(false);
    }

    if (result.error) {
      toast.error(t_messages('errors.update'), {
        description: `${result.error.message}`,
      });
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;agent</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;agent {agent.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('email.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t_inputs('email.placeholder')}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('phone.label')}</FormLabel>
                  <FormControl>
                    <PhoneNumberInput
                      value={field.value || '+33-'}
                      onChangeAction={field.onChange}
                      disabled={isLoading}
                      options={countries.map((country) => country.code as CountryCode)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="countryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('country.label')}</FormLabel>
                  <FormControl>
                    <MultiSelectCountries
                      placeholder={t_inputs('country.select_placeholder')}
                      countries={countries}
                      selected={field.value}
                      onChangeAction={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services</FormLabel>
                  <FormControl>
                    <MultiSelect<string>
                      placeholder="Sélectionner les services"
                      options={services.map((service) => ({
                        label: service.name,
                        value: service.id,
                      }))}
                      selected={field.value}
                      onChange={field.onChange}
                      type={'multiple'}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t_common('actions.cancel')}
              </Button>
              <Button type="submit" loading={isLoading}>
                {t_common('actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

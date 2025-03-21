'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { updateServiceRequest } from '@/actions/service-requests';
import { FullServiceRequest } from '@/types/service-request';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { RequestStatus, ServicePriority, User } from '@prisma/client';
import { MultiSelect } from '@/components/ui/multi-select';
import { filterUneditedKeys } from '@/lib/utils';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  assignedToId: z.string().min(1, 'Required'),
  priority: z.nativeEnum(ServicePriority, {
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_priority_value',
  }),
  status: z.nativeEnum(RequestStatus, {
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_status_value',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface RequestQuickEditFormDialogProps {
  request: FullServiceRequest;
  agents: User[];
}

export function RequestQuickEditFormDialog({
  request,
  agents = [],
}: RequestQuickEditFormDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedToId: request.assignedToId || '',
      priority: request.priority,
      status: request.status,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      filterUneditedKeys(values, form.formState.dirtyFields);
      const result = await updateServiceRequest({
        id: request.id,
        ...values,
      });

      toast({
        title: t('messages.success.update'),
        description: t('messages.requests.assign.success'),
      });
      setOpen(false);
      router.refresh();

      if (result.error) {
        toast({
          variant: 'destructive',
          title: t('messages.errors.update'),
          description: t('messages.requests.assign.error'),
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('messages.errors.update'),
        description: t('messages.requests.assign.error'),
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start !p-2">
          <Edit2 className="mr-1 size-4" />
          {t('common.actions.edit')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('requests.quick_edit.title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.agent.assigned_to')}</FormLabel>
                  <MultiSelect
                    options={agents.map((agent) => ({
                      label: `${agent.name}`,
                      value: agent.id,
                    }))}
                    onChange={field.onChange}
                    selected={field.value}
                    type="single"
                  />
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.priority.label')}</FormLabel>
                  <MultiSelect<ServicePriority>
                    options={[
                      { value: 'STANDARD', label: t('common.priority.STANDARD') },
                      { value: 'URGENT', label: t('common.priority.URGENT') },
                    ]}
                    onChange={field.onChange}
                    selected={field.value}
                    type="single"
                  />
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.status.label')}</FormLabel>
                  <MultiSelect<RequestStatus>
                    options={[
                      { value: 'SUBMITTED', label: t('common.status.SUBMITTED') },
                      { value: 'PENDING', label: t('common.status.PENDING') },
                      {
                        value: 'PENDING_COMPLETION',
                        label: t('common.status.PENDING_COMPLETION'),
                      },
                      {
                        value: 'APPOINTMENT_SCHEDULED',
                        label: t('common.status.APPOINTMENT_SCHEDULED'),
                      },
                      {
                        value: 'READY_FOR_PICKUP',
                        label: t('common.status.READY_FOR_PICKUP'),
                      },
                      { value: 'VALIDATED', label: t('common.status.VALIDATED') },
                      { value: 'REJECTED', label: t('common.status.REJECTED') },
                      { value: 'COMPLETED', label: t('common.status.COMPLETED') },
                    ]}
                    onChange={field.onChange}
                    selected={field.value}
                    type="single"
                  />
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common.actions.saving') : t('common.actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

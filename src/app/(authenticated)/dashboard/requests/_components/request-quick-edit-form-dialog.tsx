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
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RequestStatus, RequestPriority } from '@/convex/lib/constants';
import { MultiSelect } from '@/components/ui/multi-select';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  assignedAgentId: z.string().min(1, 'Required'),
  priority: z.string().min(1, 'Required'),
  status: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof formSchema>;

interface RequestQuickEditFormDialogProps {
  request: NonNullable<Doc<'requests'>>;
}

export function RequestQuickEditFormDialog({ request }: RequestQuickEditFormDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const updateRequest = useMutation(api.functions.request.updateRequest);

  // Get agents from organization
  const agents = useQuery(api.functions.membership.getOrganizationAgents, {
    organizationId: request.organizationId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedAgentId: request.assignedAgentId || '',
      priority: request.priority,
      status: request.status,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updateRequest({
        requestId: request._id,
        assignedAgentId: values.assignedAgentId as Id<'memberships'>,
        priority: values.priority as RequestPriority,
        status: values.status as RequestStatus,
      });

      toast.success(t('messages.success.update'));
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(t('messages.errors.update'));
      console.error(error);
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
              name="assignedAgentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.agent.assigned_to')}</FormLabel>
                  <MultiSelect
                    options={agents?.map((agent) => ({
                      label: `${agent.firstName} ${agent.lastName}`,
                      value: agent._id,
                    }))}
                    onChange={field.onChange}
                    selected={field.value}
                    type="single"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.priority.label')}</FormLabel>
                  <MultiSelect
                    options={[
                      {
                        value: RequestPriority.Normal,
                        label: t(`inputs.priority.options.${RequestPriority.Normal}`),
                      },
                      {
                        value: RequestPriority.Urgent,
                        label: t(`inputs.priority.options.${RequestPriority.Urgent}`),
                      },
                      {
                        value: RequestPriority.Critical,
                        label: t(`inputs.priority.options.${RequestPriority.Critical}`),
                      },
                    ]}
                    onChange={field.onChange}
                    selected={field.value}
                    type="single"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inputs.status.label')}</FormLabel>
                  <MultiSelect
                    options={Object.values(RequestStatus).map((status) => ({
                      value: status,
                      label: t(`inputs.requestStatus.options.${status}`),
                    }))}
                    onChange={field.onChange}
                    selected={field.value}
                    type="single"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t('common.actions.saving')
                  : t('common.actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

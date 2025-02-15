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
import { assignServiceRequest } from '@/actions/service-requests';
import { FullServiceRequest } from '@/types/service-request';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { User } from '@prisma/client';
import { MultiSelect } from '@/components/ui/multi-select';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  assignedToId: z.string().min(1, 'Required'),
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
      ...(request.assignedTo && { assignedToId: request.assignedTo.id }),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await assignServiceRequest(request.id, values.assignedToId);

      if (result.success) {
        toast({
          title: t('messages.success.update'),
          description: t('messages.requests.assign.success'),
        });
        setOpen(false);
        router.refresh();
      } else {
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
          <DialogTitle>{t('requests.assign.title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('requests.assign.agent')}</FormLabel>
                  <MultiSelect
                    options={agents.map((agent) => ({
                      label: `${agent.firstName} ${agent.lastName}`,
                      value: agent.id,
                    }))}
                    onChange={(value) => field.onChange(value[0])}
                    selected={[field.value]}
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

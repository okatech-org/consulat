'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsularService, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/appointments/date-time-picker';
import { MultiSelect } from '../ui/multi-select';

const appointmentFormSchema = z.object({
  serviceId: z.string(),
  date: z.date().optional(),
  time: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  services: ConsularService[];
  user: User;
}

export function NewAppointmentDialog({
  isOpen,
  onClose,
  services,
  user,
}: NewAppointmentDialogProps) {
  const t = useTranslations('user.dashboard.appointments');
  const [step, setStep] = useState<'service' | 'date' | 'confirm'>('service');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const selectedService = services.find(
    (service) => service.id === form.watch('serviceId'),
  );

  const onSubmit = async (data: AppointmentFormValues) => {
    if (step === 'service' && selectedService) {
      setStep('date');
      return;
    }

    if (step === 'date') {
      setStep('confirm');
      return;
    }

    // TODO: Submit appointment
    console.log('Submit appointment', data);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('new_appointment_dialog.title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={step} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="service" disabled={step !== 'service'}>
                  {t('new_appointment_dialog.steps.service')}
                </TabsTrigger>
                <TabsTrigger value="date" disabled={step !== 'date'}>
                  {t('new_appointment_dialog.steps.date')}
                </TabsTrigger>
                <TabsTrigger value="confirm" disabled={step !== 'confirm'}>
                  {t('new_appointment_dialog.steps.confirm')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="service">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('new_appointment_dialog.service_select')}
                        </FormLabel>
                        <MultiSelect<string>
                          options={services.map((service) => ({
                            label: service.name,
                            value: service.id,
                          }))}
                          selected={field.value ? [field.value] : []}
                          onChange={(values) => {
                            if (values.length > 0) {
                              field.onChange(values[0]);
                            }
                          }}
                          type={'single'}
                        />
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedService && (
                    <Card className="mt-4">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">
                              {t('new_appointment_dialog.service_details')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedService.appointmentInstructions ??
                                selectedService.description}
                            </p>
                          </div>

                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">
                                {t('new_appointment_dialog.duration')}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {t('new_appointment_dialog.duration_value', {
                                  duration: selectedService.appointmentDuration,
                                })}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {t('new_appointment_dialog.price')}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {t('new_appointment_dialog.price_value', {
                                  price: selectedService.price,
                                })}
                              </p>
                            </div>
                          </div>

                          {selectedService.appointmentInstructions && (
                            <div>
                              <h3 className="font-medium">
                                {t('new_appointment_dialog.instructions')}
                              </h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {selectedService.appointmentInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="date">
                <DateTimePicker
                  organizationId={selectedService?.organizationId ?? ''}
                  countryCode={user.countryId ?? ''}
                  selectedService={selectedService}
                  value={
                    form.watch('date') && form.watch('time')
                      ? { date: form.watch('date')!, time: form.watch('time')! }
                      : undefined
                  }
                  onChange={({ date, time }) => {
                    form.setValue('date', date);
                    form.setValue('time', time);
                  }}
                />
              </TabsContent>

              <TabsContent value="confirm">
                {/* TODO: Ajouter la confirmation */}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              {step !== 'service' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('service')}
                >
                  {t('new_appointment_dialog.back')}
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  !selectedService || (step === 'service' && !form.watch('serviceId'))
                }
              >
                {step === 'confirm'
                  ? t('new_appointment_dialog.submit')
                  : t('new_appointment_dialog.next')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

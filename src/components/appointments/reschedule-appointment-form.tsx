'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { AppointmentSchema, type AppointmentInput } from '@/schemas/appointment';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { getAvailableTimeSlots, rescheduleAppointment } from '@/actions/appointments';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AppointmentWithRelations } from '@/schemas/appointment';
import { TimeSlotWithAgent } from '@/actions/appointments';
import React from 'react';

interface RescheduleAppointmentFormProps {
  appointment: AppointmentWithRelations;
}

export function RescheduleAppointmentForm({
  appointment,
}: RescheduleAppointmentFormProps) {
  const t = useTranslations('appointments');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotWithAgent[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAgent | null>(
    null,
  );

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      date: new Date(),
      organizationId: appointment.organizationId,
      countryCode: appointment.countryCode,
      attendeeId: appointment.attendeeId,
      type: appointment.type,
      serviceId: appointment.request?.service?.id ?? '',
      duration: appointment.duration,
      instructions: appointment.instructions ?? '',
    },
  });

  const selectedDate = form.watch('date');

  React.useEffect(() => {
    if (!selectedDate || !appointment.request?.service) return;

    // Définir le début et la fin de la journée sélectionnée
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    getAvailableTimeSlots(
      appointment.request.service.category,
      appointment.organizationId,
      appointment.countryCode,
      startOfDay,
      endOfDay,
      appointment.duration,
    )
      .then((slots) => {
        setAvailableTimeSlots(slots);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedDate, appointment]);

  const onSubmit = async () => {
    if (!selectedTimeSlot) return;

    // Vérifier qu'un agent est disponible
    const agentId = selectedTimeSlot.availableAgents[0];
    if (!agentId) {
      console.error('No agent available for this time slot');
      return;
    }

    setIsLoading(true);
    try {
      const result = await rescheduleAppointment(
        appointment.id,
        selectedTimeSlot.start,
        selectedTimeSlot.start,
        selectedTimeSlot.end,
        agentId,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push(ROUTES.user.appointments);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('datetime.pick_date')}</FormLabel>
                  <FormControl>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            {selectedDate && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{t('datetime.pick_time')}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{appointment.duration} min</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot?.start === slot.start;

                    return (
                      <Button
                        type="button"
                        key={slot.start.toISOString()}
                        variant={isSelected ? 'default' : 'outline'}
                        disabled={!slot.availableAgents[0]}
                        className="h-auto py-4"
                        onClick={() => {
                          const { start, end, availableAgents } = slot;
                          const agentId = availableAgents[0];

                          if (!agentId) return;

                          form.setValue('startTime', start);
                          form.setValue('endTime', end);
                          form.setValue('agentId', agentId);
                          setSelectedTimeSlot(slot);
                        }}
                      >
                        {format(slot.start, 'HH:mm', { locale: fr })}
                      </Button>
                    );
                  })}
                  {availableTimeSlots.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                      {t('new.no_slots_available')}
                    </div>
                  )}
                  {isLoading && (
                    <div className="col-span-full text-center text-muted-foreground">
                      {t('new.loading')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              size="mobile"
              leftIcon={<ArrowLeft />}
            >
              {t('actions.back')}
            </Button>

            <Button 
              type="submit" 
              disabled={isLoading || !selectedTimeSlot}
              size="mobile"
              weight="medium"
              loading={isLoading}
            >
              {isLoading ? t('actions.submitting') : t('actions.confirm')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

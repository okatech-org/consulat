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
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { AppointmentWithRelations } from '@/schemas/appointment';
import { useAppointments, useAvailableTimeSlots } from '@/hooks/use-appointments';

// Type pour les créneaux avec agents disponibles
interface TimeSlotWithAgent {
  start: Date;
  end: Date;
  duration: number;
  availableAgents: string[];
}

interface RescheduleAppointmentFormProps {
  appointment: AppointmentWithRelations;
}

export function RescheduleAppointmentForm({
  appointment,
}: RescheduleAppointmentFormProps) {
  const t = useTranslations('appointments');
  const router = useRouter();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAgent | null>(
    null,
  );

  // Hooks tRPC
  const { rescheduleAppointment } = useAppointments();

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

  // Récupérer les créneaux disponibles avec tRPC
  const { timeSlots: availableTimeSlots, isLoading: timeSlotsLoading } =
    useAvailableTimeSlots({
      serviceId: appointment.request?.service?.id || '',
      organizationId: appointment.organizationId,
      countryCode: appointment.countryCode,
      startDate: selectedDate || new Date(),
      endDate: selectedDate || new Date(),
      duration: appointment.duration,
      agentId: appointment.agentId || undefined,
    });

  const onSubmit = () => {
    if (!selectedTimeSlot) return;

    // Vérifier qu'un agent est disponible
    const agentId = selectedTimeSlot.availableAgents[0];
    if (!agentId) {
      console.error('No agent available for this time slot');
      return;
    }

    rescheduleAppointment.mutate({
      id: appointment.id,
      newDate: selectedTimeSlot.start,
      newStartTime: selectedTimeSlot.start,
      newEndTime: selectedTimeSlot.end,
      newAgentId: agentId,
    });
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
                  {availableTimeSlots?.map((slot) => {
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
                  {(!availableTimeSlots || availableTimeSlots.length === 0) &&
                    !timeSlotsLoading && (
                      <div className="col-span-full text-center text-muted-foreground">
                        {t('new.no_slots_available')}
                      </div>
                    )}
                  {timeSlotsLoading && (
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
              disabled={rescheduleAppointment.isLoading}
              size="mobile"
              leftIcon={<ArrowLeft />}
            >
              {t('actions.back')}
            </Button>

            <Button
              type="submit"
              disabled={rescheduleAppointment.isLoading || !selectedTimeSlot}
              size="mobile"
              weight="medium"
              loading={rescheduleAppointment.isLoading}
            >
              {rescheduleAppointment.isLoading
                ? t('actions.submitting')
                : t('actions.confirm')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

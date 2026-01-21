'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import { z } from 'zod';
import { toast } from 'sonner';
import { ROUTES } from '@/schemas/routes';

// Reschedule form schema
const RescheduleSchema = z.object({
  date: z.date(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  agentId: z.string().optional(),
});

type RescheduleInput = z.infer<typeof RescheduleSchema>;

// Type pour les créneaux avec agents disponibles
interface TimeSlotWithAgent {
  start: Date;
  end: Date;
  duration: number;
  availableAgents: string[];
}

interface RescheduleAppointmentFormProps {
  appointment: Doc<'appointments'>;
}

export function RescheduleAppointmentForm({
  appointment,
}: RescheduleAppointmentFormProps) {
  const t = useTranslations('appointments');
  const router = useRouter();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAgent | null>(
    null,
  );

  // Get appointment duration (difference between start and end)
  const duration = Math.floor((appointment.endAt - appointment.startAt) / (1000 * 60));

  const form = useForm<RescheduleInput>({
    resolver: zodResolver(RescheduleSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const selectedDate = form.watch('date');

  // Get available time slots
  const availableSlots = useQuery(
    api.functions.appointment.getAppointmentAvailability,
    selectedDate
      ? {
          organizationId: appointment.organizationId,
          date: selectedDate.getTime(),
          duration: duration,
        }
      : 'skip',
  );

  // Reschedule appointment mutation
  const rescheduleAppointment = useMutation(
    api.functions.appointment.rescheduleAppointment,
  );

  const onSubmit = async () => {
    if (!selectedTimeSlot) return;

    try {
      await rescheduleAppointment({
        appointmentId: appointment._id,
        newStartAt: selectedTimeSlot.start.getTime(),
        newEndAt: selectedTimeSlot.end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      toast.success(t('messages.success.reschedule'), {
        description: t('messages.success.reschedule_description'),
      });

      router.push(ROUTES.user.appointments);
    } catch (error) {
      toast.error(t('messages.errors.reschedule'), {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const timeSlots: TimeSlotWithAgent[] =
    availableSlots?.map((slot) => ({
      start: new Date(slot.startAt),
      end: new Date(slot.endAt),
      duration: (slot.endAt - slot.startAt) / (1000 * 60),
      availableAgents: ['agent'],
    })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            {/* Current appointment info */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">{t('reschedule.current_appointment')}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(appointment.startAt), 'PPPP', { locale: fr })}
                  </span>
                </div>
                <div className="ml-6">
                  {format(new Date(appointment.startAt), 'HH:mm', { locale: fr })}
                  {' - '}
                  {format(new Date(appointment.endAt), 'HH:mm', { locale: fr })}
                </div>
                <div className="ml-6">
                  <span className="text-xs">Durée: {duration} minutes</span>
                </div>
              </div>
            </div>

            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reschedule-date">
                    {t('datetime.pick_date')}
                  </FieldLabel>
                  <DatePicker date={field.value} onSelect={field.onChange} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {selectedDate && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{t('datetime.pick_time')}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{duration} min</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected =
                      selectedTimeSlot?.start.getTime() === slot.start.getTime();

                    return (
                      <Button
                        type="button"
                        key={slot.start.toISOString()}
                        variant={isSelected ? 'default' : 'outline'}
                        disabled={!slot.availableAgents[0]}
                        className="h-auto py-4"
                        onClick={() => {
                          const { start, end } = slot;

                          form.setValue('startTime', start);
                          form.setValue('endTime', end);
                          setSelectedTimeSlot(slot);
                        }}
                      >
                        {format(slot.start, 'HH:mm', { locale: fr })}
                      </Button>
                    );
                  })}
                  {timeSlots.length === 0 && availableSlots !== undefined && (
                    <div className="col-span-full text-center text-muted-foreground">
                      {t('new.no_slots_available')}
                    </div>
                  )}
                  {availableSlots === undefined && (
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
              size="sm"
            >
              {t('actions.back')}
            </Button>

            <Button
              type="submit"
              disabled={!selectedTimeSlot}
              size="sm"
            >
              {t('actions.confirm')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  isSameWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvailableTimeSlots } from '@/actions/appointments';
import { AppointmentInput, AppointmentSchema } from '@/schemas/appointment';

interface NewAppointmentDialogProps {
  services: ConsularService[];
  user: User;
  organizations: Organization[];
}

export function NewAppointmentDialog({
  services,
  user,
  organizations,
}: NewAppointmentDialogProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlotInput[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      countryCode: user.countryCode ?? '',
      serviceId: services[0]?.id, // Sélection automatique du premier service
      organizationId: organizations[0]?.id, // Sélection automatique de la première organisation
    },
  });

  const selectedService = services.find(
    (service) => service.id === form.watch('serviceId'),
  );
  const selectedOrganization = organizations.find(
    (org) => org.id === form.watch('organizationId'),
  );

  // Charger les créneaux pour la semaine en cours
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedService || !selectedOrganization) return;

      setLoadingSlots(true);

      const weekStart = startOfWeek(currentWeek, { locale: fr });
      const weekEnd = endOfWeek(currentWeek, { locale: fr });

      try {
        const slots = await getAvailableTimeSlots(
          selectedService.category,
          selectedOrganization.id,
          user.countryCode!,
          weekStart,
          weekEnd,
          selectedService.appointmentDuration,
        );

        setTimeSlots(slots);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [currentWeek, selectedService, selectedOrganization]);

  const handleWeekChange = (weeks: number) => {
    setCurrentWeek((prev) => addWeeks(prev, weeks));
  };

  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(currentWeek, { locale: fr }),
    end: endOfWeek(currentWeek, { locale: fr }),
  });

  const groupSlotsByDay = (slots: TimeSlotInput[]) => {
    return slots.reduce(
      (acc, slot) => {
        const dayKey = format(slot.start, 'yyyy-MM-dd');
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(slot);
        return acc;
      },
      {} as Record<string, TimeSlotInput[]>,
    );
  };

  const groupedSlots = groupSlotsByDay(timeSlots);

  return (
    <Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sélection du service et organisation */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service consulaire</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu de rendez-vous</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un lieu" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* Navigation par semaine */}
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => handleWeekChange(-1)}>
              Semaine précédente
            </Button>

            <div className="font-medium">
              {format(startOfWeek(currentWeek, { locale: fr }), 'd MMM', { locale: fr })}{' '}
              - {format(endOfWeek(currentWeek, { locale: fr }), 'd MMM', { locale: fr })}
            </div>

            <Button type="button" variant="outline" onClick={() => handleWeekChange(1)}>
              Semaine suivante
            </Button>
          </div>

          {/* Grille des créneaux */}
          {loadingSlots ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const slots = groupedSlots[dayKey] || [];

                return (
                  <div
                    key={dayKey}
                    className={cn(
                      'rounded-lg border p-2',
                      !isSameWeek(day, currentWeek, { locale: fr }) && 'opacity-50',
                    )}
                  >
                    <div className="mb-2 text-center text-sm font-medium">
                      {format(day, 'EEE d', { locale: fr })}
                    </div>

                    <div className="space-y-1">
                      {slots.map((slot) => (
                        <Button
                          key={slot.start.toISOString()}
                          type="button"
                          variant={
                            form.watch('date')?.toDateString() === day.toDateString()
                              ? 'default'
                              : 'outline'
                          }
                          className="w-full text-xs"
                          onClick={() => {
                            form.setValue('date', slot.start);
                            form.setValue('time', format(slot.start, 'HH:mm'));
                          }}
                        >
                          {format(slot.start, 'HH:mm')}
                        </Button>
                      ))}

                      {slots.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground">
                          Aucun créneau
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirmation */}
          {form.watch('date') && (
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium">Récapitulatif du rendez-vous</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{format(form.watch('date'), 'PPPP', { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heure</p>
                  <p>{form.watch('time')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p>{selectedService?.appointmentDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tarif</p>
                  <p>{selectedService?.price} €</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={!form.formState.isValid}>
            Confirmer le rendez-vous
          </Button>
        </form>
      </Form>
    </Dialog>
  );
}

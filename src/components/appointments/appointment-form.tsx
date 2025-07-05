'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  useAppointments,
  useAvailableTimeSlots,
  useAvailableServices,
} from '@/hooks/use-appointments';
import { AppointmentSchema } from '@/schemas/appointment';
import { AppointmentType } from '@prisma/client';

// Schema pour le formulaire
const appointmentFormSchema = AppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  cancelledAt: true,
  cancelReason: true,
  rescheduledFrom: true,
  status: true,
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  serviceId?: string;
  organizationId?: string;
  countryCode?: string;
  requestId?: string;
  onSuccess?: () => void;
}

export function AppointmentForm({
  serviceId,
  organizationId,
  countryCode = 'FR',
  requestId,
  onSuccess,
}: AppointmentFormProps) {
  const t = useTranslations('appointments');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();

  const { createAppointment } = useAppointments();
  const { services } = useAvailableServices(countryCode);

  // Récupérer les créneaux disponibles si on a toutes les infos
  const { timeSlots, isLoading: timeSlotsLoading } = useAvailableTimeSlots({
    serviceId: serviceId || '',
    organizationId: organizationId || '',
    countryCode,
    startDate: selectedDate || new Date(),
    endDate: selectedDate || new Date(),
    duration: 30, // 30 minutes par défaut
  });

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      type: AppointmentType.OTHER,
      duration: 30,
      serviceId,
      organizationId,
      countryCode,
      requestId,
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    if (!selectedDate || !selectedTimeSlot) {
      return;
    }

    const timeSlot = timeSlots?.find(
      (slot) => format(slot.start, 'yyyy-MM-dd HH:mm') === selectedTimeSlot,
    );

    if (!timeSlot) {
      return;
    }

    createAppointment.mutate({
      ...data,
      date: selectedDate,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            {!serviceId && (
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.service')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.select_service')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>{t('form.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'PPP', { locale: fr })
                    ) : (
                      <span>{t('form.select_date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label>{t('form.time_slot')}</Label>
                {timeSlotsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>{t('form.loading_slots')}</span>
                  </div>
                ) : (
                  <Select onValueChange={setSelectedTimeSlot} value={selectedTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.select_time')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots?.map((slot) => (
                        <SelectItem
                          key={format(slot.start, 'yyyy-MM-dd HH:mm')}
                          value={format(slot.start, 'yyyy-MM-dd HH:mm')}
                        >
                          {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                          {slot.availableAgents.length > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({slot.availableAgents.length} agent
                              {slot.availableAgents.length > 1 ? 's' : ''})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Appointment Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.select_type')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AppointmentType.DOCUMENT_SUBMISSION}>
                        {t('types.document_submission')}
                      </SelectItem>
                      <SelectItem value={AppointmentType.DOCUMENT_COLLECTION}>
                        {t('types.document_collection')}
                      </SelectItem>
                      <SelectItem value={AppointmentType.INTERVIEW}>
                        {t('types.interview')}
                      </SelectItem>
                      <SelectItem value={AppointmentType.MARRIAGE_CEREMONY}>
                        {t('types.marriage_ceremony')}
                      </SelectItem>
                      <SelectItem value={AppointmentType.EMERGENCY}>
                        {t('types.emergency')}
                      </SelectItem>
                      <SelectItem value={AppointmentType.OTHER}>
                        {t('types.other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.instructions')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('form.instructions_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={createAppointment.isLoading || !selectedDate || !selectedTimeSlot}
            >
              {createAppointment.isLoading ? t('form.creating') : t('form.create')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

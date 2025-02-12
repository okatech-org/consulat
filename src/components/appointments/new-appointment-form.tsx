'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentType, ConsularService } from '@prisma/client';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { AppointmentSchema, type AppointmentInput } from '@/schemas/appointment';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { addMinutes, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '../ui/date-picker';
import { getAvailableTimeSlots, TimeSlotWithAgent } from '@/actions/appointments';
import React from 'react';

interface NewAppointmentFormProps {
  services: ConsularService[];
  countryCode: string;
  organizationId: string;
}

type Step = 'service' | 'slot' | 'confirmation';

export function NewAppointmentForm({
  services,
  countryCode,
  organizationId,
}: NewAppointmentFormProps) {
  const t = useTranslations('appointments');
  const [step, setStep] = useState<Step>('service');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotWithAgent[]>([]);

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      countryCode,
      organizationId,
    },
  });

  const selectedService = services.find(
    (service) => service.id === form.watch('serviceId'),
  );
  const selectedDate = form.watch('date');

  const onSubmit = async (data: AppointmentInput) => {
    if (step !== 'confirmation') {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement appointment creation
      console.log('Creating appointment:', data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const currentValue = form.getValues();

    switch (step) {
      case 'service':
        if (currentValue.serviceId) {
          setStep('slot');
        }
        break;
      case 'slot':
        if (currentValue.date) {
          setStep('confirmation');
        }
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'slot':
        setStep('service');
        break;
      case 'confirmation':
        setStep('slot');
        break;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['service', 'slot', 'confirmation'];
    const currentIndex = steps.indexOf(step);

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div
              key={s}
              className="flex flex-1 items-center"
              aria-current={s === step ? 'step' : undefined}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  s === step
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index < currentIndex
                      ? 'border-primary bg-primary/20'
                      : 'border-muted-foreground',
                )}
              >
                {index < currentIndex ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn('h-0.5 flex-1', {
                    'bg-primary': index < currentIndex,
                    'bg-muted-foreground': index >= currentIndex,
                  })}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-sm">
          {steps.map((s) => (
            <span
              key={s}
              className={cn('flex-1 text-center', {
                'text-primary font-medium': s === step,
                'text-muted-foreground': s !== step,
              })}
            >
              {t(`steps.${s}`)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: service.name,
  }));

  const appointmentTypeOptions = Object.values(AppointmentType).map((type) => ({
    value: type,
    label: t(`type.options.${type}`),
  }));

  const renderServiceInfo = () => {
    if (!selectedService) return null;

    return (
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="font-medium">{selectedService.name}</h3>
        {selectedService.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedService.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Clock className="size-4" />
          <span className="text-sm">
            Durée : {selectedService.appointmentDuration} minutes
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {t(`service_categories.${selectedService.category}`)}
          </Badge>
        </div>
      </div>
    );
  };

  const renderTimeSlotPicker = () => {
    if (!selectedService || !selectedDate) return null;
    return (
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="font-medium">Créneaux disponibles</h3>
        <pre>{JSON.stringify(availableTimeSlots, null, 2)}</pre>
      </div>
    );
  };

  React.useEffect(() => {
    if (!selectedService || !selectedDate) return;

    const endDate = addMinutes(
      selectedDate,
      (selectedService.appointmentDuration ?? 15) * 60,
    );

    console.log({
      duration: selectedService.appointmentDuration ?? 15,
      selectedDate: format(selectedDate, 'PPPP', { locale: fr }),
      endDate: format(endDate, 'PPPP', { locale: fr }),
    });

    getAvailableTimeSlots(
      selectedService.category,
      organizationId,
      countryCode,
      selectedDate,
      endDate,
      selectedService.appointmentDuration ?? 15,
    ).then((slots) => {
      console.log({
        slots,
        selectedDate: format(selectedDate, 'PPPP', { locale: fr }),
        endDate: format(endDate, 'PPPP', { locale: fr }),
      });
      setAvailableTimeSlots(slots);
    });
  }, [selectedService, selectedDate, organizationId, countryCode]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderStepIndicator()}

        <Card>
          <CardHeader>
            <CardTitle>{t(`steps.${step}`)}</CardTitle>
            {step === 'service' && (
              <CardDescription>{t('service.description')}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 'service' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('service.label')}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={serviceOptions}
                          selected={field.value ? [field.value] : []}
                          onChange={(values) => field.onChange(values[0])}
                          placeholder={t('service.placeholder')}
                          type="single"
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
                {renderServiceInfo()}
              </div>
            )}

            {step === 'service' && selectedService && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type.label')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={appointmentTypeOptions}
                        selected={field.value ? [field.value] : []}
                        onChange={(values) => field.onChange(values[0])}
                        placeholder={t('type.placeholder')}
                        type="single"
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 'slot' && selectedService && (
              <>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('datetime.pick_date')}</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={(date) => field.onChange(date)}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel></FormLabel>
                      <FormControl></FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {selectedDate && renderTimeSlotPicker()}
              </>
            )}

            {step === 'confirmation' && selectedService && form.watch('date') && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <dl className="divide-y">
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.service')}</dt>
                      <dd>{selectedService.name}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.type')}</dt>
                      <dd>{t(`type.options.${form.watch('type')}`)}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.date')}</dt>
                      <dd>{format(form.watch('date'), 'PPPP', { locale: fr })}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.time')}</dt>
                      <dd>{format(form.watch('date'), 'HH:mm')}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step !== 'service' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('actions.back')}
              </Button>
            )}
            <Button
              type={step === 'confirmation' ? 'submit' : 'button'}
              className={cn(step === 'service' && 'ml-auto')}
              disabled={
                isSubmitting ||
                (step === 'service' && !form.watch('serviceId')) ||
                (step === 'type' && !form.watch('type')) ||
                (step === 'datetime' && !form.watch('date'))
              }
              onClick={step === 'confirmation' ? undefined : handleNext}
            >
              {step === 'confirmation' ? (
                isSubmitting ? (
                  t('actions.submitting')
                ) : (
                  t('actions.confirm')
                )
              ) : (
                <>
                  {t('actions.next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

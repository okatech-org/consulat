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
import { TimeSlotPicker } from './time-slot-picker';
import { AppointmentSchema, type AppointmentInput } from '@/schemas/appointment';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MultiSelect } from '@/components/ui/multi-select';

interface NewAppointmentFormProps {
  services: ConsularService[];
  countryCode: string;
  organizationId: string;
}

type Step = 'service' | 'type' | 'datetime' | 'confirmation';

export function NewAppointmentForm({
  services,
  countryCode,
  organizationId,
}: NewAppointmentFormProps) {
  const t = useTranslations('appointments');
  const [step, setStep] = useState<Step>('service');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    switch (step) {
      case 'service':
        setStep('type');
        break;
      case 'type':
        setStep('datetime');
        break;
      case 'datetime':
        setStep('confirmation');
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'type':
        setStep('service');
        break;
      case 'datetime':
        setStep('type');
        break;
      case 'confirmation':
        setStep('datetime');
        break;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['service', 'type', 'datetime', 'confirmation'];
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderStepIndicator()}

        <Card>
          <CardHeader>
            <CardTitle>{t(`steps.${step}`)}</CardTitle>
          </CardHeader>

          <CardContent>
            {step === 'service' && (
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
            )}

            {step === 'type' && selectedService && (
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

            {step === 'datetime' && selectedService && (
              <div className="space-y-4">
                <TimeSlotPicker
                  consulateId={organizationId}
                  duration={selectedService.appointmentDuration}
                  onSelect={({ date, time }) => {
                    const datetime = new Date(date);
                    const [hours, minutes] = time.split(':').map(Number);
                    datetime.setHours(hours, minutes, 0, 0);
                    form.setValue('date', datetime);
                  }}
                  selectedDate={form.watch('date')}
                  selectedTime={
                    form.watch('date') ? format(form.watch('date'), 'HH:mm') : undefined
                  }
                />
                <TradFormMessage name="date" />
              </div>
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
              type="submit"
              className={cn(step === 'service' && 'ml-auto')}
              disabled={
                isSubmitting ||
                (step === 'service' && !form.watch('serviceId')) ||
                (step === 'type' && !form.watch('type')) ||
                (step === 'datetime' && !form.watch('date'))
              }
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

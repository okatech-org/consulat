'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentType, AppointmentStatus } from '@prisma/client';
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
import { cn, useDateLocale } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '../ui/date-picker';
import {
  getAvailableTimeSlots,
  TimeSlotWithAgent,
  createAppointment,
} from '@/actions/appointments';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import type { FullServiceRequest } from '@/types/service-request';

interface NewAppointmentFormProps {
  serviceRequests: FullServiceRequest[];
  countryCode: string;
  organizationId: string;
  attendeeId: string;
  preselectedData?: {
    requestId?: string;
    type?: string;
  };
}

type Step = 'request' | 'slot' | 'confirmation';

const steps = ['request', 'slot', 'confirmation'] as const;

const stepTranslations = {
  request: 'steps.request',
  slot: 'steps.slot',
  confirmation: 'steps.confirmation',
} as const;

export function NewAppointmentForm({
  serviceRequests,
  countryCode,
  organizationId,
  attendeeId,
  preselectedData,
}: NewAppointmentFormProps) {
  const t = useTranslations('appointments');
  const t_inputs = useTranslations('inputs');
  const router = useRouter();
  const [step, setStep] = useState<Step>(preselectedData ? 'slot' : 'request');
  const [isLoading, setIsLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotWithAgent[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAgent | null>(
    null,
  );
  const { formatDate } = useDateLocale();

  const [selectedRequest, setSelectedRequest] = useState<FullServiceRequest | null>(
    preselectedData?.requestId
      ? (serviceRequests.find((r) => r.id === preselectedData.requestId) ?? null)
      : null,
  );

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      countryCode,
      organizationId,
      date: new Date(),
      attendeeId,
      requestId: preselectedData?.requestId ?? '',
      serviceId: preselectedData?.requestId
        ? (serviceRequests.find((r) => r.id === preselectedData.requestId)?.service.id ??
          '')
        : '',
      type: (preselectedData?.type as AppointmentType) ?? 'DOCUMENT_COLLECTION',
      duration: 15,
    },
  });

  const selectedDate = form.watch('date');

  const onSubmit = async (data: AppointmentInput) => {
    if (!selectedTimeSlot) return;

    // Vérifier qu'un agent est disponible
    const agentId = selectedTimeSlot.availableAgents[0];
    if (!agentId) {
      console.error('No agent available for this time slot');
      return;
    }

    setIsLoading(true);
    try {
      // Préparer les données du rendez-vous
      const appointment = {
        ...data,
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        duration: selectedTimeSlot.duration,
        agentId,
        status: AppointmentStatus.CONFIRMED,
      };

      // Appeler l'action serveur
      const result = await createAppointment(appointment);

      if (!result.success) {
        // Gérer l'erreur de rendez-vous en double
        if (
          result.error?.includes('Unique constraint failed on the fields: (`serviceId`)')
        ) {
          form.setError('requestId', {
            type: 'manual',
            message: t('validation.duplicate_request'),
          });
          setStep('request'); // Retourner à l'étape de sélection du service
          return;
        }
        throw new Error(result.error);
      }

      router.push(ROUTES.user.appointments);
    } catch (error) {
      console.error(error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    const currentValue = form.getValues();

    switch (step) {
      case 'request':
        if (currentValue.requestId) {
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
        setStep('request');
        break;
      case 'confirmation':
        setStep('slot');
        break;
    }
  };

  const renderStepIndicator = () => {
    const currentIndex = steps.indexOf(step);

    return (
      <div>
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
              {t(stepTranslations[s])}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Only show eligible requests: not completed/cancelled and no appointment
  const eligibleRequests: FullServiceRequest[] = serviceRequests.filter(
    (req) => !['COMPLETED', 'CANCELLED'].includes(req.status) && !req.appointment,
  );

  const serviceOptions = eligibleRequests.map((request) => ({
    value: request.id,
    label: request.service.name,
  }));

  const appointmentTypeOptions = Object.values([
    'DOCUMENT_SUBMISSION',
    'DOCUMENT_COLLECTION',
    'INTERVIEW',
    'EMERGENCY',
    'OTHER',
  ] as const).map((type) => ({
    value: type,
    label: t(`type.options.${type}`),
  }));

  const renderServiceInfo = () => {
    if (!selectedRequest) return null;

    return (
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="font-medium">{selectedRequest.service.name}</h3>
        {selectedRequest.service.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedRequest.service.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Clock className="size-4" />
          <span className="text-sm">
            Durée : {selectedRequest.service.appointmentDuration} minutes
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {t_inputs(`serviceCategory.options.${selectedRequest.service.category}`)}
          </Badge>
        </div>
        {selectedRequest.assignedTo && (
          <div className="mt-4 flex items-center gap-2">
            <span className="font-medium">Agent assigné :</span>
            <span>{selectedRequest.assignedTo.name}</span>
            {selectedRequest.assignedTo.email && (
              <span className="text-muted-foreground">
                ({selectedRequest.assignedTo.email})
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTimeSlotPicker = () => {
    if (!selectedRequest || !selectedDate) return null;

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Sélectionnez un créneau</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{selectedRequest.service.appointmentDuration} min</span>
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
                {formatDate(slot.start, 'HH:mm')}
              </Button>
            );
          })}
          {availableTimeSlots.length === 0 && !isLoading && (
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
    );
  };

  React.useEffect(() => {
    if (!selectedRequest || !selectedDate) return;

    // Définir le début et la fin de la journée sélectionnée
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (selectedRequest.assignedTo) {
      // Fetch slots for the assigned agent only
      getAvailableTimeSlots(
        selectedRequest.service.category,
        organizationId,
        countryCode,
        startOfDay,
        endOfDay,
        selectedRequest.service.appointmentDuration ?? 15,
      )
        .then((slots) => {
          // Filter slots to only those where the assigned agent is available
          const filteredSlots = slots.filter((slot) =>
            slot.availableAgents.includes(selectedRequest.assignedTo!.id),
          );
          setAvailableTimeSlots(filteredSlots);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Fallback: fetch slots for all agents
      getAvailableTimeSlots(
        selectedRequest.service.category,
        organizationId,
        countryCode,
        startOfDay,
        endOfDay,
        selectedRequest.service.appointmentDuration ?? 15,
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
    }
  }, [selectedRequest, selectedDate, organizationId, countryCode]);

  if (!attendeeId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t('new.attendee_id_required')}</p>
      </div>
    );
  }

  if (step === 'request' && eligibleRequests.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t('request.no_eligible')}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderStepIndicator()}

        <Card>
          <CardHeader>
            <CardTitle>{t(`steps.${step}`)}</CardTitle>
            {step === 'request' && (
              <CardDescription>{t('request.description')}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 'request' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="requestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('request.label')}</FormLabel>
                      <FormControl>
                        <MultiSelect<string>
                          options={serviceOptions}
                          selected={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            const foundRequest = eligibleRequests.find(
                              (r) => r.id === value,
                            );
                            setSelectedRequest(foundRequest ?? null);
                            if (foundRequest) {
                              form.setValue('serviceId', foundRequest.service.id);
                            }
                            form.setValue(
                              'duration',
                              foundRequest?.service.appointmentDuration ?? 15,
                            );
                            form.setValue(
                              'instructions',
                              foundRequest?.service.appointmentInstructions ?? '',
                            );
                          }}
                          placeholder={t('request.placeholder')}
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

            {step === 'request' && selectedRequest && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type.label')}</FormLabel>
                    <FormControl>
                      <MultiSelect<AppointmentType>
                        options={appointmentTypeOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder={t('type.placeholder')}
                        type="single"
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 'slot' && selectedRequest && (
              <>
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

                {selectedDate && renderTimeSlotPicker()}
              </>
            )}

            {step === 'confirmation' && selectedRequest && form.watch('date') && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <dl className="divide-y">
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.service')}</dt>
                      <dd>{selectedRequest.service.name}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.type')}</dt>
                      <dd>{t(`type.options.${form.watch('type')}`)}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.date')}</dt>
                      <dd>{formatDate(form.watch('date'), 'PPPP')}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-medium">{t('confirmation.time')}</dt>
                      <dd>
                        {formatDate(form.watch('startTime'), 'HH:mm')}
                        {' - '}
                        {formatDate(form.watch('endTime'), 'HH:mm')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step !== 'request' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('actions.back')}
              </Button>
            )}

            {step !== 'confirmation' && (
              <Button
                type="button"
                onClick={handleNext}
                className={cn(step === 'request' && 'ml-auto')}
                disabled={
                  isLoading ||
                  (step === 'request' && !form.watch('requestId')) ||
                  (step === 'request' && !form.watch('type')) ||
                  (step === 'slot' && !form.watch('date')) ||
                  (step === 'slot' && !form.watch('startTime')) ||
                  (step === 'slot' && !form.watch('endTime'))
                }
              >
                {t('actions.next')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {step === 'confirmation' && (
              <Button type="submit" className={'ml-auto'} disabled={isLoading}>
                {isLoading ? t('actions.submitting') : t('actions.confirm')}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

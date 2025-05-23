'use client';

import { useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentType, AppointmentStatus } from '@prisma/client';
import { useTranslations } from 'next-intl';
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
import { CheckCircle, Clock } from 'lucide-react';
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
import CardContainer from '../layouts/card-container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStoredTabs } from '@/hooks/use-tabs';

interface NewAppointmentFormProps {
  serviceRequests: FullServiceRequest[];
  countryCode: string;
  organizationId: string;
  attendeeId: string;
  preselectedData?: {
    type?: AppointmentType;
    request?: FullServiceRequest;
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
  const { formatDate } = useDateLocale();
  const [isLoading, setIsLoading] = useState(false);

  const { currentTab, setCurrentTab } = useStoredTabs<Step>(
    'new-appointment-tab',
    preselectedData ? 'slot' : 'request',
  );

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotWithAgent[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAgent>();
  const [selectedRequest, setSelectedRequest] = useState<FullServiceRequest>();
  const [availableTypes, setAvailableTypes] = useState<AppointmentType[]>([]);

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      countryCode,
      organizationId,
      date: new Date(),
      attendeeId,
    },
  });

  useLayoutEffect(() => {
    if (preselectedData?.request) {
      form.setValue('requestId', preselectedData.request.id);
      form.setValue('serviceId', preselectedData.request.service.id);
      setSelectedRequest(preselectedData.request);

      if (preselectedData.type) {
        form.setValue('type', preselectedData.type);
        setAvailableTypes([preselectedData.type]);
      } else {
        const types: AppointmentType[] = [];

        if (preselectedData.request.service.requiresAppointment) {
          types.push('DOCUMENT_COLLECTION');
        }

        if (preselectedData.request.service.deliveryAppointment) {
          types.push('DOCUMENT_SUBMISSION');
        }

        setAvailableTypes(types);
      }
    }
  }, [form, preselectedData]);

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
          setCurrentTab('request'); // Retourner à l'onglet de sélection du service
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

  const handleTabChange = (value: string) => {
    const tab = value as Step;
    const currentValue = form.getValues();

    // Validation before allowing tab switch
    switch (tab) {
      case 'slot':
        if (!currentValue.requestId || !currentValue.type) {
          return; // Don't allow switching if request is not selected
        }
        break;
      case 'confirmation':
        if (
          !currentValue.requestId ||
          !currentValue.type ||
          !currentValue.date ||
          !currentValue.startTime
        ) {
          return; // Don't allow switching if required fields are missing
        }
        break;
    }

    setCurrentTab(tab);
  };

  const isTabAccessible = (tab: Step): boolean => {
    const currentValue = form.getValues();

    switch (tab) {
      case 'request':
        return true; // Always accessible
      case 'slot':
        return !!(currentValue.requestId && currentValue.type);
      case 'confirmation':
        return !!(
          currentValue.requestId &&
          currentValue.type &&
          currentValue.date &&
          currentValue.startTime
        );
      default:
        return false;
    }
  };

  const isTabCompleted = (tab: Step): boolean => {
    const currentValue = form.getValues();

    switch (tab) {
      case 'request':
        return !!(currentValue.requestId && currentValue.type);
      case 'slot':
        return !!(currentValue.date && currentValue.startTime);
      case 'confirmation':
        return false; // Never completed until form submission
      default:
        return false;
    }
  };

  const renderServiceInfo = () => {
    if (!selectedRequest) return null;

    return (
      <div className="mt-6 mx-auto rounded-lg border p-4">
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

  function handleRequestChange(requestId?: string) {
    if (!requestId) {
      setSelectedRequest(undefined);
      setAvailableTypes([]);
      return;
    }

    // Only show eligible requests: not completed/cancelled and no appointment
    const eligibleRequests: FullServiceRequest[] = serviceRequests.filter(
      (req) => !['COMPLETED', 'CANCELLED'].includes(req.status),
    );

    const request = eligibleRequests.find((r) => r.id === requestId);

    if (!request) {
      setSelectedRequest(undefined);
      setAvailableTypes([]);
      return;
    }

    setSelectedRequest(request);
    const types: AppointmentType[] = [];

    console.log({ request });

    if (request.service.requiresAppointment) {
      types.push('DOCUMENT_COLLECTION');
    }

    if (request.service.deliveryAppointment) {
      types.push('DOCUMENT_SUBMISSION');
    }

    setAvailableTypes(types);
  }

  // Only show eligible requests: not completed/cancelled and no appointment
  const eligibleRequests: FullServiceRequest[] = serviceRequests.filter(
    (req) => !['COMPLETED', 'CANCELLED'].includes(req.status),
  );

  if (!attendeeId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t('new.attendee_id_required')}</p>
      </div>
    );
  }

  if (eligibleRequests.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t('request.no_eligible')}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {steps.map((step) => {
              const isCompleted = isTabCompleted(step);
              const isAccessible = isTabAccessible(step);

              return (
                <TabsTrigger
                  key={step}
                  value={step}
                  disabled={!isAccessible}
                  className={cn(
                    'relative',
                    isCompleted && 'bg-primary/10',
                    !isAccessible && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted && <CheckCircle className="h-4 w-4 text-primary" />}
                    <span>{t(stepTranslations[step])}</span>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <CardContainer title={t('steps.request')} subtitle={t('request.description')}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="requestId"
                  render={({ field }) => (
                    <FormItem className="w-max">
                      <FormLabel>{t('request.label')}</FormLabel>
                      <FormControl>
                        <MultiSelect<string>
                          options={eligibleRequests.map((request) => ({
                            value: request.id,
                            label: request.service.name,
                          }))}
                          selected={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            handleRequestChange(value);
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

                {selectedRequest && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="w-max">
                        <FormLabel>{t('type.label')}</FormLabel>
                        <FormControl>
                          <MultiSelect<AppointmentType>
                            options={availableTypes.map((type) => ({
                              value: type,
                              label: t(`type.options.${type}`),
                            }))}
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
              </div>
            </CardContainer>
          </TabsContent>

          <TabsContent value="slot" className="space-y-4">
            <CardContainer title={t('steps.slot')}>
              <div className="space-y-4">
                {selectedRequest && (
                  <>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="w-max">
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
              </div>
            </CardContainer>
          </TabsContent>

          <TabsContent value="confirmation" className="space-y-4">
            <CardContainer
              title={t('steps.confirmation')}
              footerContent={
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('actions.submitting') : t('actions.confirm')}
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                {selectedRequest && form.watch('date') && (
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
                )}
              </div>
            </CardContainer>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}

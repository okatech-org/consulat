'use client';

import { useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentType } from '@/convex/lib/constants';
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
import { cn, useDateLocale } from '@/lib/utils';
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '../ui/date-picker';
import CardContainer from '../layouts/card-container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Doc, Id } from 'convex/_generated/dataModel';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

// Convex-based appointment schema
const AppointmentSchema = z.object({
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  duration: z.number(),
  type: z.string(),
  organizationId: z.string(),
  serviceId: z.string().optional(),
  attendeeId: z.string(),
  agentId: z.string().optional(),
  countryCode: z.string(),
  requestId: z.string().optional(),
});

type AppointmentInput = z.infer<typeof AppointmentSchema>;

// Type pour les créneaux avec agents disponibles
interface TimeSlotWithAgent {
  start: Date;
  end: Date;
  duration: number;
  availableAgents: string[];
}

interface NewAppointmentFormProps {
  serviceRequests?: Doc<'requests'>[];
  countryCode: string;
  organizationId: Id<'organizations'>;
  attendeeId: Id<'users'>;
  preselectedData?: { type?: AppointmentType; request?: Doc<'requests'> };
}

type Step = 'request' | 'slot' | 'confirmation';

const steps = ['request', 'slot', 'confirmation'] as const;

const stepTranslations = {
  request: 'steps.request',
  slot: 'steps.slot',
  confirmation: 'steps.confirmation',
} as const;

export function NewAppointmentForm({
  serviceRequests = [],
  countryCode,
  organizationId,
  attendeeId,
  preselectedData,
}: NewAppointmentFormProps) {
  const t = useTranslations('appointments');
  const t_inputs = useTranslations('inputs');
  const { formatDate } = useDateLocale();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<Step>(
    preselectedData?.type && preselectedData.request?._id ? 'slot' : 'request',
  );

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAgent>();
  const [selectedRequest, setSelectedRequest] = useState<Doc<'requests'>>();
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Doc<'services'>>();
  const [availableTypes, setAvailableTypes] = useState<AppointmentType[]>([]);

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      countryCode,
      organizationId: organizationId as string,
      date: new Date(),
      attendeeId: attendeeId as string,
      duration: 30,
    },
  });

  const selectedDate = form.watch('date');

  // Get service details for selected request
  const serviceDetails = useQuery(
    api.functions.service.getService,
    selectedRequest?.serviceId ? { serviceId: selectedRequest.serviceId } : 'skip',
  );

  // Get available time slots
  const availableSlots = useQuery(
    api.functions.appointment.getAppointmentAvailability,
    selectedServiceDetails && selectedDate
      ? {
          organizationId,
          date: selectedDate.getTime(),
          duration: selectedServiceDetails.appointmentDuration || 30,
        }
      : 'skip',
  );

  // Create appointment mutation
  const createAppointment = useMutation(api.functions.appointment.createAppointment);

  // Update service details when they load
  useLayoutEffect(() => {
    if (serviceDetails) {
      setSelectedServiceDetails(serviceDetails);
    }
  }, [serviceDetails]);

  useLayoutEffect(() => {
    if (preselectedData?.request) {
      form.setValue('requestId', preselectedData.request._id as string);
      form.setValue('serviceId', preselectedData.request.serviceId as string);
      setSelectedRequest(preselectedData.request);

      if (preselectedData.type) {
        form.setValue('type', preselectedData.type);
        setAvailableTypes([preselectedData.type]);
      } else if (serviceDetails) {
        const types: AppointmentType[] = [];

        if (serviceDetails.requiresAppointment) {
          types.push(AppointmentType.DocumentCollection);
        }

        if (serviceDetails.deliveryAppointment) {
          types.push(AppointmentType.DocumentSubmission);
        }

        setAvailableTypes(types);
      }
    }
  }, [form, preselectedData, serviceDetails]);

  const onSubmit = async (data: AppointmentInput) => {
    if (!selectedTimeSlot) return;

    const startTimestamp = selectedTimeSlot.start.getTime();
    const endTimestamp = selectedTimeSlot.end.getTime();
    const now = Date.now();

    console.log('Submitting appointment:', {
      startTimestamp,
      endTimestamp,
      now,
      startDate: new Date(startTimestamp),
      endDate: new Date(endTimestamp),
      isPast: startTimestamp <= now,
    });

    try {
      await createAppointment({
        startAt: startTimestamp,
        endAt: endTimestamp,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: data.type,
        organizationId: organizationId,
        serviceId: data.serviceId as Id<'services'> | undefined,
        requestId: data.requestId as Id<'requests'> | undefined,
        participants: [
          {
            userId: attendeeId,
            role: 'attendee',
            status: 'confirmed',
          },
        ],
      });

      toast({
        title: t('messages.success.create'),
        description: t('messages.success.create_description'),
        variant: 'success',
      });

      router.push(ROUTES.user.appointments);
    } catch (error) {
      toast({
        title: t('messages.errors.create'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleTabChange = (value: string) => {
    const tab = value as Step;
    const currentValue = form.getValues();

    switch (tab) {
      case 'slot':
        if (!currentValue.requestId || !currentValue.type) {
          return;
        }
        break;
      case 'confirmation':
        if (
          !currentValue.requestId ||
          !currentValue.type ||
          !currentValue.date ||
          !currentValue.startTime
        ) {
          return;
        }
        break;
    }

    setCurrentTab(tab);
  };

  const isTabAccessible = (tab: Step): boolean => {
    const currentValue = form.getValues();

    switch (tab) {
      case 'request':
        return true;
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
        return false;
      default:
        return false;
    }
  };

  const renderServiceInfo = () => {
    if (!selectedServiceDetails) return null;

    return (
      <div className="mt-6 mx-auto rounded-lg border p-4">
        <h3 className="font-medium">{selectedServiceDetails.name}</h3>
        {selectedServiceDetails.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedServiceDetails.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Clock className="size-4" />
          <span className="text-sm">
            Durée : {selectedServiceDetails.appointmentDuration} minutes
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {t_inputs(`serviceCategory.options.${selectedServiceDetails.category}`)}
          </Badge>
        </div>
      </div>
    );
  };

  const renderTimeSlotPicker = () => {
    if (!selectedServiceDetails || !selectedDate) return null;

    const timeSlots: TimeSlotWithAgent[] =
      availableSlots?.map((slot) => ({
        start: new Date(slot.startAt),
        end: new Date(slot.endAt),
        duration: (slot.endAt - slot.startAt) / (1000 * 60),
        availableAgents: ['agent'],
      })) || [];

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Sélectionnez un créneau</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{selectedServiceDetails.appointmentDuration} min</span>
          </div>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {timeSlots.map((slot) => {
            const isSelected = selectedTimeSlot?.start.getTime() === slot.start.getTime();

            return (
              <Button
                type="button"
                key={slot.start.toISOString()}
                variant={isSelected ? 'default' : 'outline'}
                disabled={!slot.availableAgents[0]}
                className="h-auto py-4"
                onClick={() => {
                  const { start, end, duration } = slot;

                  form.setValue('startTime', start);
                  form.setValue('endTime', end);
                  form.setValue('duration', duration);
                  setSelectedTimeSlot(slot);
                }}
              >
                {formatDate(slot.start, 'HH:mm')}
              </Button>
            );
          })}
          {timeSlots.length === 0 && !availableSlots && (
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
    );
  };

  function handleRequestChange(requestId?: string) {
    if (!requestId) {
      setSelectedRequest(undefined);
      setAvailableTypes([]);
      setSelectedServiceDetails(undefined);
      form.setValue('agentId', '', { shouldDirty: true });
      form.setValue('serviceId', '', { shouldDirty: true });
      return;
    }

    const eligibleRequests = serviceRequests.filter(
      (req) => !['completed', 'cancelled'].includes(req.status),
    );

    const request = eligibleRequests.find((r) => r._id === requestId);

    if (!request) {
      setSelectedRequest(undefined);
      setAvailableTypes([]);
      return;
    }

    setSelectedRequest(request);
    form.setValue('serviceId', request.serviceId as string, { shouldDirty: true });
  }

  // Update available types when service details load
  useLayoutEffect(() => {
    if (selectedServiceDetails && selectedRequest) {
      const types: AppointmentType[] = [];

      if (selectedServiceDetails.requiresAppointment) {
        types.push(AppointmentType.DocumentCollection);
      }

      if (selectedServiceDetails.deliveryAppointment) {
        types.push(AppointmentType.DocumentSubmission);
      }

      setAvailableTypes(types);
    }
  }, [selectedServiceDetails, selectedRequest]);

  const eligibleRequests = serviceRequests.filter(
    (req) => !['completed', 'cancelled'].includes(req.status),
  );

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentTab);
    const nextIndex = currentIndex + 1;

    if (nextIndex < steps.length) {
      const nextTab = steps[nextIndex];
      handleTabChange(nextTab as Step);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.indexOf(currentTab);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      const prevTab = steps[prevIndex];
      setCurrentTab(prevTab as Step);
    }
  };

  const canGoNext = (): boolean => {
    const currentValue = form.getValues();

    switch (currentTab) {
      case 'request':
        return !!(currentValue.requestId && currentValue.type);
      case 'slot':
        return !!(currentValue.date && currentValue.startTime);
      case 'confirmation':
        return false;
      default:
        return false;
    }
  };

  const canGoPrevious = (): boolean => {
    return currentTab !== 'request';
  };

  const isLastStep = (): boolean => {
    return currentTab === 'confirmation';
  };

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

  function handleTypeChange(type: string) {
    if (
      type === AppointmentType.DocumentCollection &&
      selectedServiceDetails?.deliveryAppointmentDuration
    ) {
      form.setValue('duration', selectedServiceDetails.deliveryAppointmentDuration);
      return;
    }

    if (
      type === AppointmentType.DocumentSubmission &&
      selectedServiceDetails?.deliveryAppointmentDuration
    ) {
      form.setValue('duration', selectedServiceDetails.deliveryAppointmentDuration);
      return;
    }

    form.setValue('duration', 15);
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
            <CardContainer
              title={t('steps.request')}
              subtitle={t('request.description')}
              footerContent={
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {t('actions.next')}
                  </Button>
                </div>
              }
            >
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
                            value: request._id as string,
                            label: `Request ${request.number}`,
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

                {selectedRequest && selectedServiceDetails && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="w-max">
                        <FormLabel>{t('type.label')}</FormLabel>
                        <FormControl>
                          <MultiSelect<string>
                            options={availableTypes.map((type) => ({
                              value: type,
                              label: t(`type.options.${type}`),
                            }))}
                            selected={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              handleTypeChange(value);
                            }}
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
            <CardContainer
              title={t('steps.slot')}
              footerContent={
                <div className="flex justify-between items-center gap-2">
                  {canGoPrevious() && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      leftIcon={<ArrowLeft className="size-icon" />}
                    >
                      {t('actions.back')}
                    </Button>
                  )}

                  {!isLastStep() && (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!canGoNext()}
                      className={!canGoPrevious() ? 'ml-auto' : ''}
                      rightIcon={<ArrowRight className="size-icon" />}
                    >
                      {t('actions.next')}
                    </Button>
                  )}
                </div>
              }
            >
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
                <div className="flex justify-between items-center gap-2">
                  {canGoPrevious() && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      leftIcon={<ArrowLeft className="size-icon" />}
                    >
                      {t('actions.back')}
                    </Button>
                  )}

                  <Button type="submit" className={!canGoPrevious() ? 'ml-auto' : ''}>
                    {t('actions.confirm')}
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                {selectedServiceDetails && form.watch('date') && (
                  <div className="rounded-lg border p-4">
                    <dl className="divide-y">
                      <div className="grid grid-cols-2 gap-4 py-3">
                        <dt className="font-medium">{t('confirmation.service')}</dt>
                        <dd>{selectedServiceDetails.name}</dd>
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

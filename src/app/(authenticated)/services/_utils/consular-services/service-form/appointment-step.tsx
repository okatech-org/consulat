'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ServiceStep } from '@/types/consular-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormNavigation } from './form-navigation'
import { MobileProgress } from '@/app/(public)/registration/_utils/components/mobile-progress'
import { TimeSlotPicker } from '@/components/appointments/time-slot-picker'
import { AppointmentDetails } from '@/components/appointments/appointment-details'
import { ScheduleDisplay } from '@/components/appointments/schedule-display'
import { useEffect, useState } from 'react'
import { getConsulateSchedule } from '@/actions/appointments'
import { z } from 'zod'

const appointmentSchema = z.object({
  date: z.string().min(1, 'messages.errors.date_required'),
  time: z.string().min(1, 'messages.errors.time_required'),
  duration: z.number().min(15, 'messages.errors.duration_invalid'),
})

type AppointmentSchemaInput = z.infer<typeof appointmentSchema>

interface AppointmentStepProps {
  consulateId: string
  onSubmit: (data: AppointmentSchemaInput) => void
  isLoading?: boolean
  navigation?: {
    steps: ServiceStep[]
    currentStep: number
    handleFinalSubmit: () => void
    handleNext: () => void
    handlePrevious: () => void
  }
}

export function AppointmentStep({
                                  consulateId,
                                  navigation,
                                  isLoading = false,
                                  onSubmit
                                }: AppointmentStepProps) {
  const t = useTranslations('consular.services.form.appointment')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schedule, setSchedule] = useState<any[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(true)

  const form = useForm<AppointmentSchemaInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: '',
      time: '',
      duration: 15,
    }
  })

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const consulateSchedule = await getConsulateSchedule(consulateId)
        setSchedule(consulateSchedule)
      } catch (error) {
        console.error('Error loading schedule:', error)
      } finally {
        setLoadingSchedule(false)
      }
    }

    loadSchedule()
  }, [consulateId])

  function handleSubmit(data: AppointmentSchemaInput) {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Horaires d'ouverture */}
            {!loadingSchedule && <ScheduleDisplay schedule={schedule} />}

            {/* Sélecteur de créneau */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('select_date')}</FormLabel>
                  <FormControl>
                    <TimeSlotPicker
                      consulateId={consulateId}
                      duration={30}
                      onSelect={({ date, time }) => {
                        form.setValue('date', date.toISOString())
                        form.setValue('time', time)
                      }}
                      isLoading={isLoading}
                      selectedDate={field.value ? new Date(field.value) : undefined}
                      selectedTime={form.watch('time')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Détails du rendez-vous */}
            {form.watch('date') && form.watch('time') && (
              <AppointmentDetails
                date={new Date(form.watch('date'))}
                time={form.watch('time')}
                duration={form.watch('duration')}
                type="DOCUMENT_SUBMISSION"
              />
            )}
          </CardContent>
        </Card>

        {navigation && (
          <>
            <FormNavigation
              currentStep={navigation.currentStep}
              totalSteps={navigation.steps.length}
              isLoading={isLoading}
              onNext={() => {
                form.handleSubmit(handleSubmit)()
              }}
              onPrevious={navigation.handlePrevious}
              isValid={(!!form.watch('date') && !!form.watch('time'))}
              onSubmit={navigation.handleFinalSubmit}
            />

            <MobileProgress
              currentStep={navigation.currentStep}
              totalSteps={navigation.steps.length}
              stepTitle={navigation.steps[navigation.currentStep].title}
              isOptional={false}
            />
          </>
        )}
      </form>
    </Form>
  )
}
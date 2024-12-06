import { FormServiceStep } from '@/types/consular-service'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { DynamicField } from './dynamic-field'
import { FullProfile } from '@/types'

interface FormStepProps {
  step: FormServiceStep
  onSubmit: (data: Record<string, unknown>) => void
  defaultValues?: Record<string, unknown>
  profile: FullProfile | null
  isLoading?: boolean
}

export function FormStep({
                           step,
                           onSubmit,
                           defaultValues,
                           profile,
                           isLoading = false,
                         }: FormStepProps) {
  const form = useForm({
    defaultValues: defaultValues || {},
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {step.fields.map((field) => (
          <DynamicField
            key={field.name}
            data={field}
            form={form}
            isPreFilled={!!profile?.[field.name as keyof FullProfile]}
            disabled={isLoading}
          />
        ))}
      </form>
    </Form>
  )
}

// src/components/consular-services/service-form/appointment-step.tsx

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar } from '@/components/ui/calendar'
import { AppointmentConfig } from '@/types/consular-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface AppointmentStepProps {
  config: AppointmentConfig
  onSubmit: (appointment: { date: Date; duration: number }) => void
  isLoading?: boolean
}

export function AppointmentStep({
                                  config,
                                  onSubmit,
                                  isLoading = false,
                                }: AppointmentStepProps) {
  const t = useTranslations('consular.services.form')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(parseInt(hours), parseInt(minutes))

      onSubmit({
        date: appointmentDate,
        duration: config.duration,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('appointment.select_date')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const day = date.getDay()
              return !config.availableDays.includes(day)
            }}
            locale={fr}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>{t('appointment.select_time')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-2">
            {generateTimeSlots(config).map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? 'default' : 'outline'}
                onClick={() => setSelectedTime(time)}
                disabled={isLoading}
              >
                {time}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
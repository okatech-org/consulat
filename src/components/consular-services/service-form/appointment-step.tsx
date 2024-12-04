'use client'

import { UseFormReturn } from 'react-hook-form'
import { ServiceFormData } from '@/types/consular-service'
import { Calendar } from '@/components/ui/calendar'
import { TimeSelect } from '@/components/ui/time-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { FormField } from '@/components/ui/form'

interface AppointmentStepProps {
  form: UseFormReturn<ServiceFormData>
  isSubmitting: boolean
}

export function AppointmentStep({ form, isSubmitting }: AppointmentStepProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('appointment.title')}</CardTitle>
          <CardDescription>{t('appointment.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="appointment.date"
            render={({ field }) => (
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  // Logique pour désactiver certaines dates
                  return date < new Date() || date.getDay() === 0 || date.getDay() === 6
                }}
                initialFocus
              />
            )}
          />

          <FormField
            control={form.control}
            name="appointment.time"
            render={({ field }) => (
              <TimeSelect
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
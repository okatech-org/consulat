'use client'

import { useForm, UseFormReturn } from 'react-hook-form'
import { ServiceStep } from '@/types/consular-service'
import { Calendar } from '@/components/ui/calendar'
import { TimeSelect } from '@/components/ui/time-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { FormField } from '@/components/ui/form'
import { FormNavigation } from '@/components/consular-services/service-form/form-navigation'
import { MobileProgress } from '@/components/registration/mobile-progress'
import React from 'react'

interface AppointmentStepProps {
  isSubmitting: boolean,
  isLoading?: boolean
  navigation?: {
    steps: ServiceStep[]
    currentStep: number
    handleFinalSubmit: () => void
    handleNext: () => void
    handlePrevious: () => void
  }
}

export function AppointmentStep({ isSubmitting, navigation, isLoading = false }: AppointmentStepProps) {
  const t = useTranslations('consular.services.form')

  const form: UseFormReturn<{
    appointment: {
      date?: Date
      time?: string
    }
  }> = useForm({
    defaultValues: {
      appointment: {
        date: undefined,
        time: undefined,
      },
    },
  })

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
      {navigation && (
        <>
          <FormNavigation
            currentStep={navigation.currentStep}
            totalSteps={navigation.steps.length}
            isLoading={isLoading}
            onNext={navigation.handleNext}
            onPrevious={navigation.handlePrevious}
            isValid={true}
            onSubmit={navigation.handleFinalSubmit}
          />

          {/* Progression mobile */}
          <MobileProgress
            currentStep={navigation.currentStep}
            totalSteps={navigation.steps.length}
            stepTitle={navigation.steps[navigation.currentStep].title}
            isOptional={false}
          />
        </>
      )}
    </div>
  )
}
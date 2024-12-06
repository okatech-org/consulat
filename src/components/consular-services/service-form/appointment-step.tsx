'use client'

import { useForm } from 'react-hook-form'
import { ServiceStep } from '@/types/consular-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { Form } from '@/components/ui/form'
import { FormNavigation } from '@/components/consular-services/service-form/form-navigation'
import { MobileProgress } from '@/components/registration/mobile-progress'
import React from 'react'

type AppointmentSchemaInput = {
  date: string
  time: string
  duration: number
}

interface AppointmentStepProps {
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

export function AppointmentStep({ navigation, isLoading = false, onSubmit }: AppointmentStepProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const t = useTranslations('consular.services.form')

  const form = useForm<AppointmentSchemaInput>({
    defaultValues: {
      date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
      time: '09:00',
      duration: 30,
    }
  })

  function handleSubmit(data: AppointmentSchemaInput) {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-4"}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t('appointment.title')}</CardTitle>
            <CardDescription>{t('appointment.description')}</CardDescription>
          </CardHeader>
          <CardContent className={`grid grid-cols-1 gap-4`}>
          </CardContent>
        </Card>
        {navigation && (
          <>
            <FormNavigation
              currentStep={navigation.currentStep}
              totalSteps={navigation.steps.length}
              isLoading={isLoading}
              onNext={() => {
                formRef.current?.dispatchEvent(new Event('submit', {cancelable: true}))
              }}
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
      </form>
    </Form>
  )
}
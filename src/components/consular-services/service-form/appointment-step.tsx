import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TimeSlotPicker } from '@/components/appointments/time-slot-picker'
import { AppointmentDetails } from '@/components/appointments/appointment-details'
import { Button } from '@/components/ui/button'

interface AppointmentStepProps {
  consulateId: string
  serviceId: string
  duration?: number
  onSubmit: (data: { date: Date; time: string; duration: number }) => void
  isLoading?: boolean
  formRef?: React.RefObject<HTMLFormElement>
}

export function AppointmentStep({
                                  consulateId,
                                  serviceId,
                                  duration = 30,
                                  onSubmit,
                                  isLoading,
                                  formRef
                                }: AppointmentStepProps) {
  const t = useTranslations('consular.services.form')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()

  const handleSelect = ({ date, time }: { date: Date; time: string }) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      onSubmit({
        date: selectedDate,
        time: selectedTime,
        duration
      })
    }
  }

  return (
    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <Card>
        <CardHeader>
          <CardTitle>{t('appointment.title')}</CardTitle>
          <CardDescription>{t('appointment.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TimeSlotPicker
            consulateId={consulateId}
            duration={duration}
            onSelect={handleSelect}
            isLoading={isLoading}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />

          {selectedDate && selectedTime && (
            <AppointmentDetails
              date={selectedDate}
              time={selectedTime}
              duration={duration}
              type={t('appointment.type')}
            />
          )}

          <Button
            type="submit"
            disabled={!selectedDate || !selectedTime || isLoading}
            className="w-full"
          >
            {t('appointment.confirm')}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
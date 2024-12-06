import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, isBefore, startOfToday } from 'date-fns'
import { generateTimeSlots } from '@/actions/appointments'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TimeSlotPickerProps {
  consulateId: string
  duration: number
  onSelect: (data: { date: Date; time: string }) => void
  isLoading?: boolean
  selectedDate?: Date
  selectedTime?: string
}

export function TimeSlotPicker({
                                 consulateId,
                                 duration,
                                 onSelect,
                                 isLoading,
                                 selectedDate,
                                 selectedTime
                               }: TimeSlotPickerProps) {
  const t = useTranslations('consular.services.form.appointment')

  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const [time, setTime] = useState<string | undefined>(selectedTime)
  const [slots, setSlots] = useState<Date[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Fonction pour désactiver les dates passées et weekends
  const disableDate = (date: Date) => {
    const today = startOfToday()
    return isBefore(date, today) || [0, 6].includes(date.getDay())
  }

  // Charger les créneaux disponibles quand une date est sélectionnée
  const handleDateSelect = async (newDate: Date | undefined) => {
    setDate(newDate)
    setTime(undefined)

    if (!newDate) {
      setSlots([])
      return
    }

    setLoadingSlots(true)
    try {
      const availableSlots = await generateTimeSlots({
        consulateId,
        date: newDate,
        duration
      })
      setSlots(availableSlots)
    } catch (error) {
      console.error('Error loading time slots:', error)
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Gérer la sélection d'un créneau
  const handleTimeSelect = (newTime: string) => {
    setTime(newTime)
    if (date) {
      onSelect({ date, time: newTime })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={fr}
            disabled={disableDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {date && (
        <Card>
          <CardContent className="pt-4">
            {loadingSlots ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                {t('no_slots')}
                <p className="text-sm">{t('no_slots_description')}</p>
                <Button
                  variant="link"
                  onClick={() => setDate(undefined)}
                >
                  {t('select_another_date')}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-3 gap-2 p-1">
                  {slots.map((slot) => (
                    <Button
                      key={slot.toISOString()}
                      variant={time === format(slot, 'HH:mm') ? "default" : "outline"}
                      onClick={() => handleTimeSelect(format(slot, 'HH:mm'))}
                      className="w-full"
                    >
                      {format(slot, 'HH:mm')}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
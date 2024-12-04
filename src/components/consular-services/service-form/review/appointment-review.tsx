'use client'

import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslations } from 'next-intl'

interface AppointmentReviewProps {
  appointment: {
    date: Date
    time: string
    type: string
  }
}

export function AppointmentReview({ appointment }: AppointmentReviewProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="space-y-4">
      {/* Date */}
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">{t('appointment.date')}</p>
          <p className="font-medium">
            {format(new Date(appointment.date), 'PPPP', { locale: fr })}
          </p>
        </div>
      </div>

      {/* Heure */}
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">{t('appointment.time')}</p>
          <p className="font-medium">
            {appointment.time}
          </p>
        </div>
      </div>

      {/* Type de rendez-vous */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium">
          {t(`appointment.types.${appointment.type}`)}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(`appointment.type_descriptions.${appointment.type}`)}
        </p>
      </div>
    </div>
  )
}
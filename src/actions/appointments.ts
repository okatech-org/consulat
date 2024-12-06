import { db } from '@/lib/prisma'
import { addMinutes, setHours, setMinutes, startOfDay } from 'date-fns'

interface GetAvailableSlotsParams {
  consulateId: string
  date: Date
  duration: number
}

export async function getAvailableTimeSlots({
                                              consulateId,
                                              date,
                                              duration
                                            }: GetAvailableSlotsParams) {
  // Récupérer les horaires d'ouverture pour ce jour
  const schedule = await db.consulateSchedule.findFirst({
    where: {
      consulateId,
      dayOfWeek: date.getDay(),
      isOpen: true
    }
  })

  if (!schedule) {
    return []
  }

  // Récupérer les créneaux déjà réservés
  const bookedSlots = await db.timeSlot.findMany({
    where: {
      consulateId,
      startTime: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      },
      isAvailable: false
    }
  })

  // Générer tous les créneaux possibles en fonction des horaires d'ouverture
  // et retirer les créneaux déjà réservés
  // À implémenter selon la logique métier spécifique

  return ['09:00', '09:30', '10:00'] // Example
}

export async function getConsulateSchedule(consulateId: string) {
  return db.consulateSchedule.findMany({
    where: { consulateId }
  })
}

export async function generateTimeSlots({
                                          consulateId,
                                          date,
                                          duration = 30
                                        }: {
  consulateId: string
  date: Date
  duration: number
}) {
  // Récupérer les horaires pour ce jour
  const schedule = await db.consulateSchedule.findFirst({
    where: {
      consulateId,
      dayOfWeek: date.getDay(),
      isOpen: true
    }
  })

  if (!schedule) {
    return []
  }

  // Convertir les heures d'ouverture/fermeture en Date
  const [openHour, openMinute] = schedule.openTime.split(':').map(Number)
  const [closeHour, closeMinute] = schedule.closeTime.split(':').map(Number)

  const startTime = setMinutes(setHours(startOfDay(date), openHour), openMinute)
  const endTime = setMinutes(setHours(startOfDay(date), closeHour), closeMinute)

  // Générer tous les créneaux possibles
  const slots: Date[] = []
  let currentSlot = startTime

  while (currentSlot < endTime) {
    slots.push(currentSlot)
    currentSlot = addMinutes(currentSlot, duration)
  }

  // Récupérer les créneaux déjà réservés
  const bookedSlots = await db.appointment.findMany({
    where: {
      consulateId,
      date: {
        gte: startOfDay(date),
        lt: addMinutes(startOfDay(date), 24 * 60)
      }
    }
  })

  // Filtrer les créneaux disponibles
  return slots.filter(slot => {
    const slotEnd = addMinutes(slot, duration)
    return !bookedSlots.some(booking => {
      const bookingEnd = addMinutes(booking.date, booking.duration)
      return (
        (slot >= booking.date && slot < bookingEnd) ||
        (slotEnd > booking.date && slotEnd <= bookingEnd)
      )
    })
  })
}

export async function createAppointment({
                                          consulateId,
                                          userId,
                                          date,
                                          duration,
                                          serviceRequestId
                                        }: {
  consulateId: string
  userId: string
  date: Date
  duration: number
  serviceRequestId: string
}) {
  return db.appointment.create({
    data: {
      consulateId,
      userId,
      date,
      duration,
      type: 'DOCUMENT_SUBMISSION',
      status: 'CONFIRMED',
      serviceRequestId
    }
  })
}
'use server'

import { db } from '@/lib/prisma'
import { addMinutes, setHours, setMinutes, startOfDay } from 'date-fns'

interface GetAvailableSlotsParams {
  consulateId: string
  date: Date
  duration: number
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

export async function rescheduleAppointment({
                                              appointmentId,
                                              newDate,
                                              newTime
                                            }: {
  appointmentId: string
  newDate: Date
  newTime: string
}) {
  const [hours, minutes] = newTime.split(':').map(Number)
  const scheduledDate = new Date(newDate)
  scheduledDate.setHours(hours, minutes)

  return db.appointment.update({
    where: { id: appointmentId },
    data: {
      date: scheduledDate,
      status: 'PENDING'
    }
  })
}

export async function cancelAppointment(appointmentId: string) {
  return db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED'
    }
  })
}

export async function getUpcomingAppointments(userId: string) {
  return db.appointment.findMany({
    where: {
      userId,
      date: { gte: new Date() },
      status: { not: 'CANCELLED' }
    },
    orderBy: { date: 'asc' },
    include: {
      consulate: true,
      serviceRequest: true
    }
  })
}
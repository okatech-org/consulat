'use server';

import { db } from '@/lib/prisma';
import { addMinutes, setHours, setMinutes, startOfDay } from 'date-fns';
import { AppointmentType } from '@prisma/client';
import { format, isWithinInterval, parse } from 'date-fns';

export async function generateTimeSlots({
  consulateId,
  date,
  duration = 30,
}: {
  consulateId: string;
  date: Date;
  duration: number;
}) {
  // Récupérer les horaires pour ce jour
  const schedule = await db.consulateSchedule.findFirst({
    where: {
      consulateId,
      dayOfWeek: date.getDay(),
      isOpen: true,
    },
  });

  if (!schedule) {
    return [];
  }

  // Convertir les heures d'ouverture/fermeture en Date
  const [openHour, openMinute] = schedule.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = schedule.closeTime.split(':').map(Number);

  const startTime = setMinutes(setHours(startOfDay(date), openHour), openMinute);
  const endTime = setMinutes(setHours(startOfDay(date), closeHour), closeMinute);

  // Générer tous les créneaux possibles
  const slots: Date[] = [];
  let currentSlot = startTime;

  while (currentSlot < endTime) {
    slots.push(currentSlot);
    currentSlot = addMinutes(currentSlot, duration);
  }

  // Récupérer les créneaux déjà réservés
  const bookedSlots = await db.appointment.findMany({
    where: {
      consulateId,
      date: {
        gte: startOfDay(date),
        lt: addMinutes(startOfDay(date), 24 * 60),
      },
    },
  });

  // Filtrer les créneaux disponibles
  return slots.filter((slot) => {
    const slotEnd = addMinutes(slot, duration);
    return !bookedSlots.some((booking) => {
      const bookingEnd = addMinutes(booking.date, booking.duration);
      return (
        (slot >= booking.date && slot < bookingEnd) ||
        (slotEnd > booking.date && slotEnd <= bookingEnd)
      );
    });
  });
}

export async function createAppointment({
  consulateId,
  userId,
  date,
  duration,
  serviceRequestId,
}: {
  consulateId: string;
  userId: string;
  date: Date;
  duration: number;
  serviceRequestId: string;
}) {
  return db.appointment.create({
    data: {
      consulateId,
      userId,
      date,
      duration,
      type: 'DOCUMENT_SUBMISSION',
      status: 'CONFIRMED',
      serviceRequestId,
    },
  });
}

export async function rescheduleAppointment({
  appointmentId,
  newDate,
  newTime,
}: {
  appointmentId: string;
  newDate: Date;
  newTime: string;
}) {
  const [hours, minutes] = newTime.split(':').map(Number);
  const scheduledDate = new Date(newDate);
  scheduledDate.setHours(hours, minutes);

  return db.appointment.update({
    where: { id: appointmentId },
    data: {
      date: scheduledDate,
      status: 'PENDING',
    },
  });
}

export async function cancelAppointment(appointmentId: string) {
  return db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
    },
  });
}

export async function getUpcomingAppointments(userId: string) {
  return db.appointment.findMany({
    where: {
      userId,
      date: { gte: new Date() },
      status: { not: 'CANCELLED' },
    },
    orderBy: { date: 'asc' },
    include: {
      consulate: true,
      serviceRequest: true,
    },
  });
}

interface GetAvailableSlotsParams {
  date: Date;
  organizationId: string;
  countryCode: string;
  appointmentType: AppointmentType;
}

export async function getAvailableSlots({
  date,
  organizationId,
  countryCode,
  appointmentType,
}: GetAvailableSlotsParams) {
  // 1. Récupérer l'organisation et ses configurations
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      appointments: {
        where: {
          date: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000), // Le même jour
          },
        },
      },
    },
  });

  if (!organization?.metadata) {
    throw new Error('Organization not found or missing metadata');
  }

  const countryMetadata = (organization.metadata as Record<string, any>)[countryCode];
  if (!countryMetadata?.settings?.schedule) {
    throw new Error('No schedule configuration found for this country');
  }

  // 2. Obtenir les horaires pour ce jour
  const dayName = format(date, 'EEEE').toLowerCase();
  const daySchedule = countryMetadata.settings.schedule[dayName];

  if (!daySchedule?.isOpen) {
    return [];
  }

  // 3. Vérifier si c'est un jour férié ou une fermeture exceptionnelle
  if (isDayOff(date, countryMetadata.settings)) {
    return [];
  }

  // 4. Générer les créneaux disponibles
  const slots = [];
  for (const slot of daySchedule.slots) {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);

    let slotStart = setHours(setMinutes(date, startMinute), startHour);
    const dayEnd = setHours(setMinutes(date, endMinute), endHour);

    // Durée du créneau basée sur le type de rendez-vous
    const duration = getAppointmentDuration(appointmentType);

    // Générer les créneaux
    while (addMinutes(slotStart, duration) <= dayEnd) {
      const slotEnd = addMinutes(slotStart, duration);

      // Vérifier si le créneau est déjà pris
      const isAvailable = !organization.appointments.some((appointment) =>
        isOverlapping(
          { start: slotStart, end: slotEnd },
          {
            start: appointment.date,
            end: addMinutes(appointment.date, appointment.duration),
          },
        ),
      );

      if (isAvailable) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
        });
      }

      slotStart = addMinutes(slotStart, duration);
    }
  }

  return slots;
}

function isDayOff(date: Date, settings: any): boolean {
  // Vérifier les jours fériés
  const isHoliday = settings.holidays?.some(
    (holiday: { date: string }) =>
      format(parse(holiday.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd') ===
      format(date, 'yyyy-MM-dd'),
  );
  if (isHoliday) return true;

  // Vérifier les fermetures exceptionnelles
  return settings.closures?.some((closure: { start: string; end: string }) =>
    isWithinInterval(date, {
      start: parse(closure.start, 'yyyy-MM-dd', new Date()),
      end: parse(closure.end, 'yyyy-MM-dd', new Date()),
    }),
  );
}

function isOverlapping(
  slot1: { start: Date; end: Date },
  slot2: { start: Date; end: Date },
): boolean {
  return slot1.start < slot2.end && slot2.start < slot1.end;
}

function getAppointmentDuration(type: AppointmentType): number {
  switch (type) {
    case AppointmentType.DOCUMENT_COLLECTION:
      return 15;
    case AppointmentType.DOCUMENT_SUBMISSION:
      return 30;
    case AppointmentType.FIRST_REGISTRATION:
      return 45;
    case AppointmentType.MARRIAGE_CEREMONY:
      return 60;
    case AppointmentType.EMERGENCY:
      return 30;
    default:
      return 30;
  }
}

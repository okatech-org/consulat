import {
  addMinutes,
  eachDayOfInterval,
  format,
  isWithinInterval,
  parse,
  setHours,
  setMinutes,
} from 'date-fns';
import { AppointmentType, Organization } from '@prisma/client';
import { db } from '@/lib/prisma';

interface GetAvailableSlotsOptions {
  organizationId: string;
  countryCode: string;
  serviceType: AppointmentType;
  startDate: Date;
  endDate: Date;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export async function getAvailableSlots({
  organizationId,
  countryCode,
  serviceType,
  startDate,
  endDate,
}: GetAvailableSlotsOptions): Promise<TimeSlot[]> {
  // 1. Récupérer l'organisation et ses configurations
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      agents: true,
      appointments: {
        where: {
          date: {
            gte: startDate,
            lte: endDate,
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

  // 2. Obtenir la durée du service
  const duration = getServiceDuration(serviceType);

  // 3. Générer tous les créneaux possibles
  const slots: TimeSlot[] = [];
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of days) {
    // Vérifier si le jour est ouvert
    const dayName = format(day, 'EEEE').toLowerCase();
    const daySchedule = countryMetadata.settings.schedule[dayName];

    if (!daySchedule?.isOpen) continue;
    if (isDayOff(day, countryMetadata.settings)) continue;

    // Générer les créneaux pour chaque plage horaire
    for (const slot of daySchedule.slots) {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);

      let slotStart = setHours(setMinutes(day, startMinute), startHour);
      const dayEnd = setHours(setMinutes(day, endMinute), endHour);

      // Générer des créneaux selon la durée du service
      while (addMinutes(slotStart, duration) <= dayEnd) {
        slots.push({
          startTime: slotStart,
          endTime: addMinutes(slotStart, duration),
          available: true,
        });
        slotStart = addMinutes(slotStart, duration);
      }
    }
  }

  // 4. Filtrer les créneaux déjà pris
  return filterAvailableSlots(slots, organization.appointments, duration);
}

function getServiceDuration(type: AppointmentType): number {
  switch (type) {
    case 'DOCUMENT_SUBMISSION':
    case 'DOCUMENT_PICKUP':
      return 15;
    case 'FIRST_REGISTRATION':
    case 'RENEWAL':
      return 30;
    case 'MARRIAGE':
    case 'EMERGENCY':
      return 45;
    default:
      return 30;
  }
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

function filterAvailableSlots(
  slots: TimeSlot[],
  existingAppointments: any[],
  duration: number,
): TimeSlot[] {
  return slots.filter((slot) => {
    // Vérifier si le créneau chevauche un RDV existant
    return !existingAppointments.some((appointment) =>
      isOverlapping(slot, appointment, duration),
    );
  });
}

function isOverlapping(
  slot: TimeSlot,
  appointment: { date: Date; duration: number },
  duration: number,
): boolean {
  const appointmentEnd = addMinutes(appointment.date, appointment.duration);
  return (
    (slot.startTime >= appointment.date && slot.startTime < appointmentEnd) ||
    (slot.endTime > appointment.date && slot.endTime <= appointmentEnd)
  );
}

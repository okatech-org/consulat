'use server';

import { db } from '@/lib/prisma';
import { DayScheduleInput, TimeSlotInput } from '@/schemas/appointment';
import { ServiceCategory, UserRole } from '@prisma/client';
import { eachDayOfInterval, format, isSameDay, parseISO, addMinutes } from 'date-fns';

interface BaseTimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

interface TimeSlotWithAgent extends BaseTimeSlot {
  availableAgents: string[]; // IDs des agents disponibles
}

interface AgentWithAppointments {
  id: string;
  managedAppointments: Array<{
    date: Date;
    duration: number;
  }>;
}

interface GenerateTimeSlotsParams {
  consulateId: string;
  date: Date;
  duration: number;
}

export async function getAvailableTimeSlots(
  serviceCategory: ServiceCategory,
  organizationId: string,
  countryCode: string,
  startDate: Date,
  endDate: Date,
  duration: number,
) {
  // 1. Récupération des données nécessaires
  const [agents, countryData, organizationData] = await Promise.all([
    db.user.findMany({
      where: {
        role: UserRole.AGENT,
        organizationId: organizationId,
        serviceCategories: {
          has: serviceCategory,
        },
      },
      include: {
        managedAppointments: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
        },
      },
    }),
    db.country.findUnique({
      where: {
        code: countryCode,
      },
    }),
    db.organization.findUnique({
      where: {
        id: organizationId,
      },
    }),
  ]);

  if (!countryData || !organizationData || agents.length === 0) {
    return [];
  }

  const countryHolidays = JSON.parse(countryData.metadata as string).holidays || [];
  const organizationSchedule: Record<string, DayScheduleInput> =
    JSON.parse(organizationData.metadata as string).schedule || {};
  const organizationHolidays =
    JSON.parse(organizationData.metadata as string).holidays || [];

  // 2. Génération des créneaux de base à partir des horaires d'ouverture
  const baseSlots = generateBaseSlotsFromSchedule(
    startDate,
    endDate,
    duration,
    organizationSchedule,
  );

  // 3. Filtrage des jours fériés et vacances
  const slotsExcludingHolidays = filterHolidaysAndClosures(
    baseSlots,
    countryHolidays,
    organizationHolidays,
  );

  // 4. Vérification de la disponibilité des agents
  const slotsWithAgents = checkAgentAvailability(slotsExcludingHolidays, agents);

  // 5. Ne retourner que les créneaux qui ont au moins un agent disponible
  return slotsWithAgents
    .filter((slot) => slot.availableAgents.length > 0)
    .map(({ start, end, duration }) => ({ start, end, duration }));
}

export async function generateBaseSlotsFromSchedule(
  startDate: Date,
  endDate: Date,
  duration: number,
  schedule: Record<string, DayScheduleInput>,
): Promise<BaseTimeSlot[]> {
  const slots: BaseTimeSlot[] = [];
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of days) {
    const dayName = format(day, 'EEEE').toLowerCase();
    const daySchedule = schedule[dayName];

    if (!daySchedule?.isOpen) continue;

    for (const timeSlot of daySchedule.slots) {
      if (!timeSlot?.start || !timeSlot?.end) continue;

      const startParts = timeSlot.start.toString().split(':');
      const endParts = timeSlot.end.toString().split(':');

      if (startParts.length !== 2 || endParts.length !== 2) continue;

      const startHourStr = startParts[0];
      const startMinuteStr = startParts[1];
      const endHourStr = endParts[0];
      const endMinuteStr = endParts[1];

      if (!startHourStr || !startMinuteStr || !endHourStr || !endMinuteStr) continue;

      const startHour = parseInt(startHourStr, 10);
      const startMinute = parseInt(startMinuteStr, 10);
      const endHour = parseInt(endHourStr, 10);
      const endMinute = parseInt(endMinuteStr, 10);

      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute))
        continue;

      let currentStart = new Date(day);
      currentStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(day);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      while (addMinutes(currentStart, duration) <= slotEnd) {
        slots.push({
          start: new Date(currentStart),
          end: addMinutes(currentStart, duration),
          duration,
        });
        currentStart = addMinutes(currentStart, duration);
      }
    }
  }

  return slots;
}

function filterHolidaysAndClosures(
  slots: BaseTimeSlot[],
  countryHolidays: Array<{ date: string }>,
  organizationHolidays: Array<{ date: string }>,
): BaseTimeSlot[] {
  return slots.filter(
    (slot) =>
      !isHoliday(slot.start, countryHolidays) &&
      !isHoliday(slot.start, organizationHolidays),
  );
}

function checkAgentAvailability(
  slots: BaseTimeSlot[],
  agents: AgentWithAppointments[],
): TimeSlotWithAgent[] {
  return slots.map((slot) => {
    const availableAgents = agents
      .filter(
        (agent) =>
          !agent.managedAppointments.some((appointment) =>
            isOverlapping(slot, appointment),
          ),
      )
      .map((agent) => agent.id);

    return {
      ...slot,
      availableAgents,
    };
  });
}

function isHoliday(date: Date, holidays: Array<{ date: string }>): boolean {
  return holidays.some((h) => isSameDay(parseISO(h.date), date));
}

function isOverlapping(
  slot: TimeSlotInput,
  appointment: { date: Date; duration: number },
): boolean {
  const appointmentEnd = addMinutes(appointment.date, appointment.duration);
  return (
    (slot.start >= appointment.date && slot.start < appointmentEnd) ||
    (slot.end > appointment.date && slot.end <= appointmentEnd)
  );
}

export async function generateTimeSlots({
  consulateId,
  date,
  duration,
}: GenerateTimeSlotsParams): Promise<Date[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const slots = await getAvailableTimeSlots(
    ServiceCategory.OTHER, // TODO: Get from service
    consulateId,
    'FR', // TODO: Get from user
    startOfDay,
    endOfDay,
    duration,
  );

  return slots.map((slot) => slot.start);
}

export async function getAvailableServices(countryCode: string) {
  const countryData = await db.country.findUnique({
    where: {
      code: countryCode,
    },
    include: {
      availableServices: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return countryData?.availableServices ?? [];
}

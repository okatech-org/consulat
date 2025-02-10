'use server';

import { db } from '@/lib/prisma';
import { DayScheduleInput, TimeSlotInput } from '@/schemas/appointment';
import { ServiceCategory, UserRole } from '@prisma/client';
import {
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  parse,
  addMinutes,
} from 'date-fns';

export async function getAvailableTimeSlots(
  serviceCategory: ServiceCategory,
  organizationId: string,
  countryCode: string,
  startDate: Date,
  endDate: Date,
  duration: number,
) {
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

  const countryHolidays = JSON.parse(countryData?.metadata as string).holidays || [];
  const organizationSchedule: Record<string, DayScheduleInput> =
    JSON.parse(organizationData?.metadata as string).schedule || {};
  const organizationHolidays =
    JSON.parse(organizationData?.metadata as string).holidays || [];

  const allSlots: TimeSlotInput[] = [];
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of days) {
    if (isHoliday(day, countryHolidays) || isHoliday(day, organizationHolidays)) continue;

    const dayName = format(day, 'EEEE').toLowerCase();
    const daySchedule = organizationSchedule[dayName];

    if (!daySchedule?.isOpen) continue;

    for (const slot of daySchedule.slots) {
      let currentStart = parse(slot.start.toString(), 'HH:mm', day);
      const endTime = parse(slot.end.toString(), 'HH:mm', day);

      while (addMinutes(currentStart, duration) <= endTime) {
        allSlots.push({
          start: currentStart,
          end: addMinutes(currentStart, duration),
          duration,
        });
        currentStart = addMinutes(currentStart, duration);
      }
    }
  }

  const availableSlots = allSlots.filter((slot) => {
    return agents.some(
      (agent) =>
        !agent.managedAppointments.some((appointment) =>
          isOverlapping(slot, appointment),
        ),
    );
  });

  return availableSlots;
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

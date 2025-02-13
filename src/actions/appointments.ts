'use server';

import { db } from '@/lib/prisma';
import {
  CountryMetadata,
  OrganizationMetadata,
  OrganizationMetadataSchedule,
  OrganizationMetadataHoliday,
  WeekDay,
} from '@/schemas/organization';
import {
  Appointment,
  OrgaServiceRequest,
  nization,
  ServiceCategory,
  User,
  UserRole,
  ServiceRequest,
  Organization,
  AppointmentStatus,
} from '@prisma/client';
import { eachDayOfInterval, format, isSameDay, parseISO, addMinutes } from 'date-fns';
import {
  AppointmentInput,
  AppointmentSchema,
  AppointmentWithRelations,
} from '@/schemas/appointment';

export interface BaseTimeSlot {
  start: Date;
  end: Date;
  duration: number;
}

export interface TimeSlotWithAgent extends BaseTimeSlot {
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
): Promise<TimeSlotWithAgent[]> {
  // 1. Récupération des données nécessaires
  const [agents, countryData, organizationData] = await Promise.all([
    db.user.findMany({
      where: {
        role: UserRole.AGENT,
        agentOrganizationId: organizationId,
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

  const countryMetadata = JSON.parse(countryData.metadata as string) as CountryMetadata;
  const organizationMetadata = JSON.parse(
    organizationData.metadata as string,
  ) as OrganizationMetadata;
  const countrySettings = organizationMetadata[countryCode]?.settings;

  if (!countrySettings) {
    return [];
  }

  // 2. Génération des créneaux de base à partir des horaires d'ouverture
  const baseSlots = await generateBaseSlotsFromSchedule(
    startDate,
    endDate,
    duration,
    countrySettings.schedule,
  );

  // 3. Filtrage des jours fériés et vacances
  const slotsExcludingHolidays = filterHolidaysAndClosures(
    baseSlots,
    countryMetadata.holidays ?? [],
    countrySettings.holidays,
  );

  // 4. Vérification de la disponibilité des agents
  const slotsWithAgents = checkAgentAvailability(slotsExcludingHolidays, agents);

  // 5. Ne retourner que les créneaux qui ont au moins un agent disponible
  return slotsWithAgents.filter((slot) => slot.availableAgents.length > 0);
}

export async function generateBaseSlotsFromSchedule(
  startDate: Date,
  endDate: Date,
  duration: number,
  schedule: OrganizationMetadataSchedule,
): Promise<BaseTimeSlot[]> {
  const slots: BaseTimeSlot[] = [];
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of days) {
    const dayName = format(day, 'EEEE').toLowerCase() as WeekDay;
    const daySchedule = schedule[dayName];

    if (!daySchedule?.isOpen || !daySchedule.slots?.length) continue;

    for (const timeSlot of daySchedule.slots) {
      const start = timeSlot?.start;
      const end = timeSlot?.end;

      if (!start || !end) continue;

      const startParts = start.split(':');
      const endParts = end.split(':');

      if (startParts.length !== 2 || endParts.length !== 2) continue;

      const startHour = parseInt(startParts[0] ?? '0', 10);
      const startMinute = parseInt(startParts[1] ?? '0', 10);
      const endHour = parseInt(endParts[0] ?? '0', 10);
      const endMinute = parseInt(endParts[1] ?? '0', 10);

      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute))
        continue;

      let currentStart = new Date(day);
      currentStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(day);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      while (currentStart.getTime() + duration * 60000 <= slotEnd.getTime()) {
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
  countryHolidays: OrganizationMetadataHoliday[],
  organizationHolidays: OrganizationMetadataHoliday[],
): BaseTimeSlot[] {
  return slots.filter(
    (slot) =>
      !isHoliday(slot.start, countryHolidays) &&
      !isHoliday(slot.start, organizationHolidays),
  );
}

function isHoliday(date: Date, holidays: OrganizationMetadataHoliday[]): boolean {
  return holidays.some((h) => h.date && isSameDay(parseISO(h.date), date));
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

function isOverlapping(
  slot: BaseTimeSlot,
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

export async function createAppointment(data: AppointmentInput) {
  try {
    // Valider les données avec Zod
    const validatedData = AppointmentSchema.parse(data);

    // Créer le rendez-vous dans la base de données
    const appointment = await db.appointment.create({
      data: {
        date: validatedData.date,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        duration: validatedData.duration,
        type: validatedData.type,
        status: validatedData.status,
        organizationId: validatedData.organizationId,
        serviceId: validatedData.serviceId,
        attendeeId: validatedData.attendeeId,
        agentId: validatedData.agentId,
        countryCode: validatedData.countryCode,
        instructions: validatedData.instructions,
      },
    });

    return { success: true, data: appointment };
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}

interface GroupedAppointments {
  upcoming: AppointmentWithRelations[];
  past: AppointmentWithRelations[];
  cancelled: AppointmentWithRelations[];
}

export async function getUserAppointments(userId: string): Promise<{
  success: boolean;
  data?: GroupedAppointments;
  error?: string;
}> {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        attendeeId: userId,
      },
      include: {
        organization: true,
        agent: true,
        request: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Grouper les rendez-vous par statut
    const now = new Date();
    const grouped = appointments.reduce(
      (acc, appointment) => {
        const appointmentDate = new Date(appointment.date);
        if (appointment.status === 'CANCELLED') {
          acc.cancelled.push(appointment);
        } else if (appointmentDate < now) {
          acc.past.push(appointment);
        } else {
          acc.upcoming.push(appointment);
        }
        return acc;
      },
      {
        upcoming: [],
        past: [],
        cancelled: [],
      } as GroupedAppointments,
    );

    return { success: true, data: grouped };
  } catch (error) {
    console.error('Failed to fetch user appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    return { success: true, appointment };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, error: 'Failed to cancel appointment' };
  }
}

export async function rescheduleAppointment(
  appointmentId: string,
  newDate: Date,
  newStartTime: Date,
  newEndTime: Date,
  newAgentId: string,
) {
  try {
    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        agentId: newAgentId,
        status: AppointmentStatus.CONFIRMED,
        rescheduledFrom: new Date(),
      },
    });

    return { success: true, appointment };
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return { success: false, error: 'Failed to reschedule appointment' };
  }
}

export async function getAppointment(id: string) {
  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        organization: true,
        agent: true,
        request: {
          include: {
            service: true,
          },
        },
      },
    });

    return appointment;
  } catch (error) {
    console.error('Failed to fetch appointment:', error);
    return null;
  }
}

export async function completeAppointment(id: string) {
  'use server';

  return db.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
}

export async function missAppointment(id: string) {
  'use server';

  return db.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.MISSED,
      missedAt: new Date(),
    },
  });
}

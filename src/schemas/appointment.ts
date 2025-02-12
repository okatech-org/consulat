import {
  AppointmentType,
  User,
  ServiceRequest,
  Organization,
  Appointment,
  ConsularService,
} from '@prisma/client';
import { AppointmentStatus } from '@prisma/client';
import { z } from 'zod';

export const AppointmentSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: 'appointments.validation.date_required',
  }),
  startTime: z.date({
    required_error: 'appointments.validation.start_time_required',
  }),
  endTime: z.date({
    required_error: 'appointments.validation.end_time_required',
  }),
  duration: z.number(),
  type: z.nativeEnum(AppointmentType, {
    required_error: 'appointments.validation.type_required',
  }),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.CONFIRMED),
  organizationId: z.string({
    required_error: 'appointments.validation.organization_required',
  }),
  serviceId: z.string({
    required_error: 'appointments.validation.service_required',
  }),
  attendeeId: z.string(),
  agentId: z.string(),
  countryCode: z.string({
    required_error: 'appointments.validation.country_required',
  }),
  instructions: z.string().optional(),
  requestId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  cancelReason: z.string().optional(),
  rescheduledFrom: z.date().optional(),
});

export type AppointmentInput = z.infer<typeof AppointmentSchema>;

export const TimeSlotSchema = z.object({
  start: z.date(),
  end: z.date(),
  duration: z.number().optional(),
});

export type TimeSlotInput = z.infer<typeof TimeSlotSchema>;

export const DayScheduleSchema = z.object({
  isOpen: z.boolean(),
  slots: z.array(TimeSlotSchema),
});

export type DayScheduleInput = z.infer<typeof DayScheduleSchema>;

export interface AppointmentWithRelations extends Appointment {
  organization: Organization;
  agent: User | null;
  request?: (ServiceRequest & { service: ConsularService }) | null;
}

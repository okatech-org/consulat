import { AppointmentType, AppointmentStatus, CountryCode } from '@/convex/lib/constants';
import type { CompleteProfile } from '@/convex/lib/types';
import type { Id } from '@/convex/_generated/dataModel';
import { z } from 'zod';

export const AppointmentSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    error: 'appointments.validation.date_required',
  }),
  startTime: z.date({
    error: 'appointments.validation.start_time_required',
  }),
  endTime: z.date({
    error: 'appointments.validation.end_time_required',
  }),
  duration: z.number({
    error: 'appointments.validation.duration_required',
  }),
  type: z.enum(AppointmentType, {
    error: 'appointments.validation.type_required',
  }),
  status: z.enum(AppointmentStatus).default(AppointmentStatus.Confirmed),
  organizationId: z.string(),
  serviceId: z.string(),
  attendeeId: z.string(),
  agentId: z.string(),
  countryCode: z.enum(CountryCode, {
    error: 'appointments.validation.country_required',
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

export interface AppointmentWithRelations {
  _id: Id<'appointments'>;
  date: number;
  startTime: number;
  endTime: number;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  organizationId: Id<'organizations'>;
  agentId?: Id<'users'> | null;
  requestId?: Id<'requests'> | null;
  attendeeId?: Id<'users'> | null;
  serviceId?: Id<'services'> | null;
  instructions?: string | null;
  createdAt: number;
  updatedAt: number;
  cancelledAt?: number | null;
  cancelReason?: string | null;
  rescheduledFrom?: number | null;
  organization?: {
    _id: Id<'organizations'>;
    name: string;
  };
  agent?: CompleteProfile | null;
  request?: {
    _id: Id<'requests'>;
    service?: {
      _id: Id<'services'>;
      name: string;
    } | null;
  } | null;
  attendee?: CompleteProfile | null;
  service?: {
    _id: Id<'services'>;
    name: string;
  } | null;
}

// Type optimisé pour la liste des rendez-vous (dashboard)
export interface DashboardAppointment {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  instructions?: string | null;
  organization: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  } | null;
  agent: {
    id: string;
    name: string | null;
  } | null;
  request?: {
    service: {
      name: string;
      category: string;
    };
  } | null;
}

// Interface pour les rendez-vous groupés avec pagination
export interface PaginatedAppointments {
  appointments: DashboardAppointment[];
  totalCount: number;
  hasMore: boolean;
}

export interface GroupedAppointmentsDashboard {
  upcoming: PaginatedAppointments;
  past: PaginatedAppointments;
  cancelled: PaginatedAppointments;
}

import { AppointmentType, AppointmentStatus } from '@prisma/client';
import type {
  User,
  ServiceRequest,
  Organization,
  Appointment,
  ConsularService,
} from '@prisma/client';
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
  duration: z.number({
    required_error: 'appointments.validation.duration_required',
  }),
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
  attendee?: User | null;
  service?: ConsularService | null;
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

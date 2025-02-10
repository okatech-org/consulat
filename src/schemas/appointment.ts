import { AppointmentType } from '@prisma/client';
import { AppointmentStatus } from '@prisma/client';
import { z } from 'zod';

export const AppointmentSchema = z.object({
  id: z.string().optional(),
  date: z.date({
    required_error: 'messages.error.required',
  }),
  startTime: z.date(),
  endTime: z.date(),
  duration: z.number(),
  type: z.nativeEnum(AppointmentType).default(AppointmentType.DOCUMENT_SUBMISSION),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.CONFIRMED),
  organizationId: z.string({
    required_error: 'messages.error.required',
  }),
  serviceId: z.string({
    required_error: 'messages.error.required',
  }),
  attendeeId: z.string(),
  agentId: z.string(),
  countryCode: z.string(),
  instructions: z.string().optional(),
  requestId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  cancelReason: z.string().optional(),
  rescheduledFrom: z.date().optional(),
  time: z.string({
    required_error: 'messages.error.required',
  }),
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

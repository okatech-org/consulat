import type { Prisma } from '@prisma/client';

export const AppointmentListItemSelect: Prisma.AppointmentSelect = {
  id: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
  duration: true,
  attendee: {
    select: {
      id: true,
      name: true,
      profileId: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  agent: {
    select: {
      id: true,
      name: true,
    },
  },
  service: {
    select: {
      id: true,
      name: true,
    },
  },
  organization: {
    select: {
      id: true,
      name: true,
    },
  },
  type: true,
  requestId: true,
};

export type AppointmentListItem = Prisma.AppointmentGetPayload<{
  select: typeof AppointmentListItemSelect;
}>;

export interface GroupedAppointments {
  upcoming: AppointmentListItem[];
  past: AppointmentListItem[];
  cancelled: AppointmentListItem[];
}

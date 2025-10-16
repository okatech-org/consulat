import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { AppointmentStatus, ParticipantRole, ParticipantStatus } from '../lib/constants';
import type { AppointmentType } from '../lib/constants';
import { Doc } from '../_generated/dataModel';
import {
  addressValidator,
  appointmentStatusValidator,
  appointmentTypeValidator,
  participantRoleValidator,
  participantStatusValidator,
} from '../lib/validators';

export const createAppointment = mutation({
  args: {
    startAt: v.number(),
    endAt: v.number(),
    timezone: v.string(),
    type: v.string(),
    organizationId: v.id('organizations'),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    participants: v.array(
      v.object({
        userId: v.id('users'),
        role: v.optional(participantRoleValidator),
        status: v.optional(participantStatusValidator),
      }),
    ),
    location: v.optional(
      v.object({
        state: v.optional(v.string()),
        complement: v.optional(v.string()),
        coordinates: v.optional(
          v.object({
            latitude: v.number(),
            longitude: v.number(),
          }),
        ),
        street: v.string(),
        city: v.string(),
        postalCode: v.string(),
        country: v.string(),
      }),
    ),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    if (args.startAt >= args.endAt) {
      throw new Error('Start time must be before end time');
    }

    if (args.startAt <= Date.now()) {
      throw new Error('Appointment cannot be scheduled in the past');
    }

    const existingAppointments = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const hasConflict = existingAppointments.some(
      (appointment) =>
        appointment.status !== AppointmentStatus.Cancelled &&
        ((args.startAt >= appointment.startAt && args.startAt < appointment.endAt) ||
          (args.endAt > appointment.startAt && args.endAt <= appointment.endAt) ||
          (args.startAt <= appointment.startAt && args.endAt >= appointment.endAt)),
    );

    if (hasConflict) {
      throw new Error('Appointment time conflicts with existing appointment');
    }

    const appointmentId = await ctx.db.insert('appointments', {
      startAt: args.startAt,
      endAt: args.endAt,
      timezone: args.timezone,
      type: args.type as AppointmentType,
      status: AppointmentStatus.Pending,
      organizationId: args.organizationId,
      serviceId: args.serviceId,
      requestId: args.requestId,
      participants: args.participants.map((participant) => ({
        userId: participant.userId,
        role: participant.role || ParticipantRole.Attendee,
        status: participant.status || ParticipantStatus.Tentative,
      })),
      location: args.location,
      actions: [],
    });

    return appointmentId;
  },
});

export const getAppointment = query({
  args: { appointmentId: v.id('appointments') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appointmentId);
  },
});

export const getAllAppointments = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    status: v.optional(appointmentStatusValidator),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let appointments: Array<Doc<'appointments'>> = [];

    if (args.organizationId && args.status) {
      appointments = await ctx.db
        .query('appointments')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('asc')
        .collect();
    } else if (args.organizationId) {
      appointments = await ctx.db
        .query('appointments')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .order('asc')
        .collect();
    } else if (args.status) {
      appointments = await ctx.db
        .query('appointments')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('asc')
        .collect();
    } else {
      appointments = await ctx.db.query('appointments').order('asc').collect();
    }

    if (args.serviceId) {
      appointments = appointments.filter((apt) => apt.serviceId === args.serviceId);
    }

    if (args.requestId) {
      appointments = appointments.filter((apt) => apt.requestId === args.requestId);
    }

    if (args.startDate) {
      appointments = appointments.filter((apt) => apt.startAt >= args.startDate!);
    }

    if (args.endDate) {
      appointments = appointments.filter((apt) => apt.endAt <= args.endDate!);
    }

    if (args.limit) {
      appointments = appointments.slice(0, args.limit);
    }

    return appointments;
  },
});

export const getAppointmentsByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let appointments = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .order('asc')
      .collect();

    if (args.startDate) {
      appointments = appointments.filter((apt) => apt.startAt >= args.startDate!);
    }

    if (args.endDate) {
      appointments = appointments.filter((apt) => apt.endAt <= args.endDate!);
    }

    return appointments;
  },
});

export const getAppointmentsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const allAppointments = await ctx.db.query('appointments').order('asc').collect();

    return allAppointments.filter((appointment) =>
      appointment.participants.some((participant) => participant.userId === args.userId),
    );
  },
});

export const getAppointmentsByStatus = query({
  args: { status: appointmentStatusValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('appointments')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('asc')
      .collect();
  },
});

export const getUpcomingAppointments = query({
  args: {
    userId: v.optional(v.id('users')),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let appointments = await ctx.db
      .query('appointments')
      .filter((q) => q.gt(q.field('startAt'), Date.now()))
      .order('asc')
      .collect();

    if (args.userId) {
      appointments = appointments.filter((appointment) =>
        appointment.participants.some(
          (participant) => participant.userId === args.userId,
        ),
      );
    }

    if (args.organizationId) {
      appointments = appointments.filter(
        (apt) => apt.organizationId === args.organizationId,
      );
    }

    if (args.limit) {
      appointments = appointments.slice(0, args.limit);
    }

    return appointments;
  },
});

export const getAppointmentAvailability = query({
  args: {
    organizationId: v.id('organizations'),
    date: v.number(),
    duration: v.number(),
  },
  returns: v.array(
    v.object({
      startAt: v.number(),
      endAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .filter((q) =>
        q.and(
          q.gte(q.field('startAt'), startOfDay.getTime()),
          q.lte(q.field('startAt'), endOfDay.getTime()),
        ),
      )
      .collect();

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const workingHours = { start: 9, end: 17 };
    const availableSlots = [];

    for (let hour = workingHours.start; hour < workingHours.end; hour += 0.5) {
      const slotStart = startOfDay.getTime() + hour * 60 * 60 * 1000;
      const slotEnd = slotStart + args.duration * 60 * 1000;

      const hasConflict = existingAppointments.some(
        (apt) =>
          apt.status !== 'cancelled' &&
          ((slotStart >= apt.startAt && slotStart < apt.endAt) ||
            (slotEnd > apt.startAt && slotEnd <= apt.endAt) ||
            (slotStart <= apt.startAt && slotEnd >= apt.endAt)),
      );

      if (!hasConflict) {
        availableSlots.push({
          startAt: slotStart,
          endAt: slotEnd,
        });
      }
    }

    return availableSlots;
  },
});

export const updateAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    timezone: v.optional(v.string()),
    type: v.optional(appointmentTypeValidator),
    status: v.optional(appointmentStatusValidator),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    participants: v.optional(
      v.array(
        v.object({
          userId: v.id('users'),
          role: participantRoleValidator,
          status: participantStatusValidator,
        }),
      ),
    ),
    location: v.optional(addressValidator),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const existingAppointment = await ctx.db.get(args.appointmentId);
    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    if (args.startAt !== undefined || args.endAt !== undefined) {
      const startAt = args.startAt ?? existingAppointment.startAt;
      const endAt = args.endAt ?? existingAppointment.endAt;

      if (startAt >= endAt) {
        throw new Error('Start time must be before end time');
      }

      if (startAt <= Date.now()) {
        throw new Error('Appointment cannot be scheduled in the past');
      }
    }

    const updateData = {
      ...(args.startAt !== undefined && { startAt: args.startAt }),
      ...(args.endAt !== undefined && { endAt: args.endAt }),
      ...(args.timezone && { timezone: args.timezone }),
      ...(args.type && { type: args.type }),
      ...(args.status && { status: args.status }),
      ...(args.serviceId !== undefined && { serviceId: args.serviceId }),
      ...(args.requestId !== undefined && { requestId: args.requestId }),
      ...(args.participants && { participants: args.participants }),
      ...(args.location !== undefined && { location: args.location }),
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.appointmentId, updateData);
    return args.appointmentId;
  },
});

export const confirmAppointment = mutation({
  args: { appointmentId: v.id('appointments') },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.Pending) {
      throw new Error('Only pending appointments can be confirmed');
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Confirmed,
    });

    return args.appointmentId;
  },
});

export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    reason: v.optional(v.string()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.Cancelled) {
      throw new Error('Appointment is already cancelled');
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Cancelled,
    });

    return args.appointmentId;
  },
});

export const completeAppointment = mutation({
  args: { appointmentId: v.id('appointments') },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.Confirmed) {
      throw new Error('Only confirmed appointments can be completed');
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Completed,
    });

    return args.appointmentId;
  },
});

export const addParticipantToAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    userId: v.id('users'),
    role: v.optional(participantRoleValidator),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const existingParticipant = appointment.participants.find(
      (p) => p.userId === args.userId,
    );

    if (existingParticipant) {
      throw new Error('Participant already exists in appointment');
    }

    const newParticipant = {
      userId: args.userId,
      role: args.role || ParticipantRole.Attendee,
      status: ParticipantStatus.Tentative,
    };

    await ctx.db.patch(args.appointmentId, {
      participants: [...appointment.participants, newParticipant],
    });

    return args.appointmentId;
  },
});

export const updateParticipantStatus = mutation({
  args: {
    appointmentId: v.id('appointments'),
    userId: v.id('users'),
    status: v.string(),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const participantIndex = appointment.participants.findIndex(
      (p) => p.userId === args.userId,
    );

    if (participantIndex === -1) {
      throw new Error('Participant not found in appointment');
    }

    const updatedParticipants = [...appointment.participants];
    updatedParticipants[participantIndex] = {
      ...updatedParticipants[participantIndex],
      status: args.status as ParticipantStatus,
    };

    await ctx.db.patch(args.appointmentId, {
      participants: updatedParticipants,
    });

    return args.appointmentId;
  },
});

export const removeParticipantFromAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    userId: v.id('users'),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updatedParticipants = appointment.participants.filter(
      (p) => p.userId !== args.userId,
    );

    if (updatedParticipants.length === appointment.participants.length) {
      throw new Error('Participant not found in appointment');
    }

    await ctx.db.patch(args.appointmentId, {
      participants: updatedParticipants,
    });

    return args.appointmentId;
  },
});

export const rescheduleAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    newStartAt: v.number(),
    newEndAt: v.number(),
    newTimezone: v.optional(v.string()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (args.newStartAt >= args.newEndAt) {
      throw new Error('Start time must be before end time');
    }

    if (args.newStartAt <= Date.now()) {
      throw new Error('Appointment cannot be scheduled in the past');
    }

    await ctx.db.patch(args.appointmentId, {
      startAt: args.newStartAt,
      endAt: args.newEndAt,
      timezone: args.newTimezone || appointment.timezone,
      status: AppointmentStatus.Scheduled,
    });

    return args.appointmentId;
  },
});

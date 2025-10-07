import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { AppointmentStatus, ParticipantStatus } from '../../lib/constants'

export const updateAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    timezone: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    participants: v.optional(v.array(v.any())),
    location: v.optional(v.any()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const existingAppointment = await ctx.db.get(args.appointmentId)
    if (!existingAppointment) {
      throw new Error('Appointment not found')
    }

    // Validation des dates si modifiées
    if (args.startAt !== undefined || args.endAt !== undefined) {
      const startAt = args.startAt ?? existingAppointment.startAt
      const endAt = args.endAt ?? existingAppointment.endAt

      if (startAt >= endAt) {
        throw new Error('Start time must be before end time')
      }

      if (startAt <= Date.now()) {
        throw new Error('Appointment cannot be scheduled in the past')
      }
    }

    const updateData = {
      ...(args.startAt !== undefined && { startAt: args.startAt }),
      ...(args.endAt !== undefined && { endAt: args.endAt }),
      ...(args.timezone && { timezone: args.timezone }),
      ...(args.type && { type: args.type }),
      ...(args.status && { status: args.status as AppointmentStatus }),
      ...(args.serviceId !== undefined && { serviceId: args.serviceId }),
      ...(args.requestId !== undefined && { requestId: args.requestId }),
      ...(args.participants && { participants: args.participants }),
      ...(args.location !== undefined && { location: args.location }),
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.appointmentId, updateData)
    return args.appointmentId
  },
})

export const confirmAppointment = mutation({
  args: { appointmentId: v.id('appointments') },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    if (appointment.status !== AppointmentStatus.Pending) {
      throw new Error('Only pending appointments can be confirmed')
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Confirmed,
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    reason: v.optional(v.string()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    if (appointment.status === AppointmentStatus.Cancelled) {
      throw new Error('Appointment is already cancelled')
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Cancelled,
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

export const completeAppointment = mutation({
  args: { appointmentId: v.id('appointments') },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    if (appointment.status !== AppointmentStatus.Confirmed) {
      throw new Error('Only confirmed appointments can be completed')
    }

    await ctx.db.patch(args.appointmentId, {
      status: AppointmentStatus.Completed,
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

export const addParticipantToAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    userId: v.id('users'),
    role: v.optional(v.string()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // Vérifier si le participant existe déjà
    const existingParticipant = appointment.participants.find(
      (p) => p.userId === args.userId,
    )

    if (existingParticipant) {
      throw new Error('Participant already exists in appointment')
    }

    const newParticipant = {
      userId: args.userId,
      role: args.role || 'attendee',
      status: ParticipantStatus.Tentative,
    }

    await ctx.db.patch(args.appointmentId, {
      participants: [...appointment.participants, newParticipant],
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

export const updateParticipantStatus = mutation({
  args: {
    appointmentId: v.id('appointments'),
    userId: v.id('users'),
    status: v.string(),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const participantIndex = appointment.participants.findIndex(
      (p) => p.userId === args.userId,
    )

    if (participantIndex === -1) {
      throw new Error('Participant not found in appointment')
    }

    const updatedParticipants = [...appointment.participants]
    updatedParticipants[participantIndex] = {
      ...updatedParticipants[participantIndex],
      status: args.status as ParticipantStatus,
    }

    await ctx.db.patch(args.appointmentId, {
      participants: updatedParticipants,
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

export const removeParticipantFromAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    userId: v.id('users'),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const updatedParticipants = appointment.participants.filter(
      (p) => p.userId !== args.userId,
    )

    if (updatedParticipants.length === appointment.participants.length) {
      throw new Error('Participant not found in appointment')
    }

    await ctx.db.patch(args.appointmentId, {
      participants: updatedParticipants,
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

export const rescheduleAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    newStartAt: v.number(),
    newEndAt: v.number(),
    newTimezone: v.optional(v.string()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // Validation des nouvelles dates
    if (args.newStartAt >= args.newEndAt) {
      throw new Error('Start time must be before end time')
    }

    if (args.newStartAt <= Date.now()) {
      throw new Error('Appointment cannot be scheduled in the past')
    }

    await ctx.db.patch(args.appointmentId, {
      startAt: args.newStartAt,
      endAt: args.newEndAt,
      timezone: args.newTimezone || appointment.timezone,
      status: AppointmentStatus.Rescheduled,
      updatedAt: Date.now(),
    })

    return args.appointmentId
  },
})

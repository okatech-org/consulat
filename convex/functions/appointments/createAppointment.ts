import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import {
  AppointmentStatus,
  ParticipantRole,
  ParticipantStatus,
} from '../../lib/constants'
import type { AppointmentType } from '../../lib/constants'

export const createAppointment = mutation({
  args: {
    startAt: v.number(),
    endAt: v.number(),
    timezone: v.string(),
    type: v.string(),
    organizationId: v.id('organizations'),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    participants: v.array(v.any()),
    location: v.optional(v.any()),
  },
  returns: v.id('appointments'),
  handler: async (ctx, args) => {
    // Validation des dates
    if (args.startAt >= args.endAt) {
      throw new Error('Start time must be before end time')
    }

    if (args.startAt <= Date.now()) {
      throw new Error('Appointment cannot be scheduled in the past')
    }

    // Vérifier les conflits de planning
    const existingAppointments = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()

    const hasConflict = existingAppointments.some(
      (appointment) =>
        appointment.status !== AppointmentStatus.Cancelled &&
        ((args.startAt >= appointment.startAt &&
          args.startAt < appointment.endAt) ||
          (args.endAt > appointment.startAt &&
            args.endAt <= appointment.endAt) ||
          (args.startAt <= appointment.startAt &&
            args.endAt >= appointment.endAt)),
    )

    if (hasConflict) {
      throw new Error('Appointment time conflicts with existing appointment')
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
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cancelledAt: undefined,
    })

    return appointmentId
  },
})

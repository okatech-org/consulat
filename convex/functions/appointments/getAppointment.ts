import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getAppointment = query({
  args: { appointmentId: v.id('appointments') },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appointmentId)
  },
})

export const getAllAppointments = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let appointments: Array<any> = []

    if (args.organizationId && args.status) {
      appointments = await ctx.db
        .query('appointments')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('asc')
        .collect()
    } else if (args.organizationId) {
      appointments = await ctx.db
        .query('appointments')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .order('asc')
        .collect()
    } else if (args.status) {
      appointments = await ctx.db
        .query('appointments')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('asc')
        .collect()
    } else {
      appointments = await ctx.db.query('appointments').order('asc').collect()
    }

    // Filtres additionnels
    if (args.serviceId) {
      appointments = appointments.filter(
        (apt) => apt.serviceId === args.serviceId,
      )
    }

    if (args.requestId) {
      appointments = appointments.filter(
        (apt) => apt.requestId === args.requestId,
      )
    }

    if (args.startDate) {
      appointments = appointments.filter(
        (apt) => apt.startAt >= args.startDate!,
      )
    }

    if (args.endDate) {
      appointments = appointments.filter((apt) => apt.endAt <= args.endDate!)
    }

    if (args.limit) {
      appointments = appointments.slice(0, args.limit)
    }

    return appointments
  },
})

export const getAppointmentsByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let appointments = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .order('asc')
      .collect()

    if (args.startDate) {
      appointments = appointments.filter(
        (apt) => apt.startAt >= args.startDate!,
      )
    }

    if (args.endDate) {
      appointments = appointments.filter((apt) => apt.endAt <= args.endDate!)
    }

    return appointments
  },
})

export const getAppointmentsByUser = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const allAppointments = await ctx.db
      .query('appointments')
      .order('asc')
      .collect()

    return allAppointments.filter((appointment) =>
      appointment.participants.some(
        (participant) => participant.userId === args.userId,
      ),
    )
  },
})

export const getAppointmentsByStatus = query({
  args: { status: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('appointments')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('asc')
      .collect()
  },
})

export const getUpcomingAppointments = query({
  args: {
    userId: v.optional(v.id('users')),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let appointments = await ctx.db
      .query('appointments')
      .filter((q) => q.gt(q.field('startAt'), Date.now()))
      .order('asc')
      .collect()

    if (args.userId) {
      appointments = appointments.filter((appointment) =>
        appointment.participants.some(
          (participant) => participant.userId === args.userId,
        ),
      )
    }

    if (args.organizationId) {
      appointments = appointments.filter(
        (apt) => apt.organizationId === args.organizationId,
      )
    }

    if (args.limit) {
      appointments = appointments.slice(0, args.limit)
    }

    return appointments
  },
})

export const getAppointmentAvailability = query({
  args: {
    organizationId: v.id('organizations'),
    date: v.number(), // Timestamp du jour
    duration: v.number(), // Durée en minutes
  },
  returns: v.array(
    v.object({
      startAt: v.number(),
      endAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(args.date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.gte(q.field('startAt'), startOfDay.getTime()),
          q.lte(q.field('startAt'), endOfDay.getTime()),
        ),
      )
      .collect()

    // Récupérer la configuration de l'organisation
    const organization = await ctx.db.get(args.organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    // Logique simple : 9h-17h, créneaux de 30min
    const workingHours = { start: 9, end: 17 }
    const slotDuration = 30 * 60 * 1000 // 30 minutes en millisecondes
    const availableSlots = []

    for (let hour = workingHours.start; hour < workingHours.end; hour += 0.5) {
      const slotStart = startOfDay.getTime() + hour * 60 * 60 * 1000
      const slotEnd = slotStart + args.duration * 60 * 1000

      const hasConflict = existingAppointments.some(
        (apt) =>
          apt.status !== 'cancelled' &&
          ((slotStart >= apt.startAt && slotStart < apt.endAt) ||
            (slotEnd > apt.startAt && slotEnd <= apt.endAt) ||
            (slotStart <= apt.startAt && slotEnd >= apt.endAt)),
      )

      if (!hasConflict) {
        availableSlots.push({
          startAt: slotStart,
          endAt: slotEnd,
        })
      }
    }

    return availableSlots
  },
})

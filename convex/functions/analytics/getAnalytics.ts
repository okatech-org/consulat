import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getDashboardStats = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    users: v.object({
      total: v.number(),
      active: v.number(),
      inactive: v.number(),
    }),
    requests: v.object({
      total: v.number(),
      inPeriod: v.number(),
      byStatus: v.object({
        draft: v.number(),
        submitted: v.number(),
        pending: v.number(),
        completed: v.number(),
      }),
    }),
    appointments: v.object({
      total: v.number(),
      inPeriod: v.number(),
      byStatus: v.object({
        pending: v.number(),
        confirmed: v.number(),
        completed: v.number(),
        cancelled: v.number(),
      }),
    }),
    documents: v.object({
      total: v.number(),
      inPeriod: v.number(),
      byStatus: v.object({
        pending: v.number(),
        validated: v.number(),
        rejected: v.number(),
      }),
    }),
    notifications: v.object({
      total: v.number(),
      inPeriod: v.number(),
      unread: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 jours par défaut
    const endDate = args.endDate || Date.now()

    // Compter les utilisateurs
    const allUsers = await ctx.db.query('users').collect()
    const activeUsers = allUsers.filter((user) => user.status === 'active')

    // Compter les demandes
    let requests = await ctx.db.query('requests').collect()
    if (args.organizationId) {
      // Filtrer par organisation via les services
      const orgServices = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .collect()

      const serviceIds = orgServices.map((service) => service._id)
      requests = requests.filter((request) =>
        serviceIds.includes(request.serviceId),
      )
    }

    const requestsInPeriod = requests.filter(
      (request) =>
        request.createdAt >= startDate && request.createdAt <= endDate,
    )

    // Compter les rendez-vous
    let appointments = await ctx.db.query('appointments').collect()
    if (args.organizationId) {
      appointments = appointments.filter(
        (apt) => apt.organizationId === args.organizationId,
      )
    }

    const appointmentsInPeriod = appointments.filter(
      (appointment) =>
        appointment.startAt >= startDate && appointment.startAt <= endDate,
    )

    // Compter les documents
    const allDocuments = await ctx.db.query('documents').collect()
    const documentsInPeriod = allDocuments.filter(
      (document) =>
        document.createdAt >= startDate && document.createdAt <= endDate,
    )

    // Compter les notifications
    const allNotifications = await ctx.db.query('notifications').collect()
    const notificationsInPeriod = allNotifications.filter(
      (notification) =>
        notification.createdAt >= startDate &&
        notification.createdAt <= endDate,
    )

    return {
      users: {
        total: allUsers.length,
        active: activeUsers.length,
        inactive: allUsers.length - activeUsers.length,
      },
      requests: {
        total: requests.length,
        inPeriod: requestsInPeriod.length,
        byStatus: {
          draft: requests.filter((r) => r.status === 'draft').length,
          submitted: requests.filter((r) => r.status === 'submitted').length,
          pending: requests.filter((r) => r.status === 'pending').length,
          completed: requests.filter((r) => r.status === 'completed').length,
        },
      },
      appointments: {
        total: appointments.length,
        inPeriod: appointmentsInPeriod.length,
        byStatus: {
          pending: appointments.filter((a) => a.status === 'pending').length,
          confirmed: appointments.filter((a) => a.status === 'confirmed')
            .length,
          completed: appointments.filter((a) => a.status === 'completed')
            .length,
          cancelled: appointments.filter((a) => a.status === 'cancelled')
            .length,
        },
      },
      documents: {
        total: allDocuments.length,
        inPeriod: documentsInPeriod.length,
        byStatus: {
          pending: allDocuments.filter((d) => d.status === 'pending').length,
          validated: allDocuments.filter((d) => d.status === 'validated')
            .length,
          rejected: allDocuments.filter((d) => d.status === 'rejected').length,
        },
      },
      notifications: {
        total: allNotifications.length,
        inPeriod: notificationsInPeriod.length,
        unread: allNotifications.filter((n) => !n.readAt).length,
      },
    }
  },
})

export const getRequestAnalytics = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    totalRequests: v.number(),
    requestsInPeriod: v.number(),
    serviceAnalytics: v.array(
      v.object({
        serviceId: v.id('services'),
        serviceName: v.string(),
        totalRequests: v.number(),
        requestsInPeriod: v.number(),
        byStatus: v.object({
          draft: v.number(),
          submitted: v.number(),
          pending: v.number(),
          completed: v.number(),
        }),
      }),
    ),
    dailyStats: v.record(v.string(), v.number()),
    averageProcessingTime: v.number(),
  }),
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000
    const endDate = args.endDate || Date.now()

    let requests = await ctx.db.query('requests').collect()

    if (args.organizationId) {
      const orgServices = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .collect()

      const serviceIds = orgServices.map((service) => service._id)
      requests = requests.filter((request) =>
        serviceIds.includes(request.serviceId),
      )
    }

    const requestsInPeriod = requests.filter(
      (request) =>
        request.createdAt >= startDate && request.createdAt <= endDate,
    )

    // Analytics par service
    const services = await ctx.db.query('services').collect()
    const serviceAnalytics = services.map((service) => {
      const serviceRequests = requests.filter(
        (r) => r.serviceId === service._id,
      )
      const serviceRequestsInPeriod = requestsInPeriod.filter(
        (r) => r.serviceId === service._id,
      )

      return {
        serviceId: service._id,
        serviceName: service.name,
        totalRequests: serviceRequests.length,
        requestsInPeriod: serviceRequestsInPeriod.length,
        byStatus: {
          draft: serviceRequests.filter((r) => r.status === 'draft').length,
          submitted: serviceRequests.filter((r) => r.status === 'submitted')
            .length,
          pending: serviceRequests.filter((r) => r.status === 'pending').length,
          completed: serviceRequests.filter((r) => r.status === 'completed')
            .length,
        },
      }
    })

    // Analytics par période (jours)
    const dailyStats: Record<string, number> = {}
    const periodDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))

    for (let i = 0; i < periodDays; i++) {
      const dayStart = startDate + i * 24 * 60 * 60 * 1000
      const dayEnd = dayStart + 24 * 60 * 60 * 1000
      const dayKey = new Date(dayStart).toISOString().split('T')[0]

      dailyStats[dayKey] = requestsInPeriod.filter(
        (request) =>
          request.createdAt >= dayStart && request.createdAt < dayEnd,
      ).length
    }

    return {
      totalRequests: requests.length,
      requestsInPeriod: requestsInPeriod.length,
      serviceAnalytics,
      dailyStats,
      averageProcessingTime: calculateAverageProcessingTime(requestsInPeriod),
    }
  },
})

export const getUserAnalytics = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.object({
    totalUsers: v.number(),
    usersInPeriod: v.number(),
    byStatus: v.object({
      active: v.number(),
      inactive: v.number(),
      suspended: v.number(),
    }),
    byRole: v.record(v.string(), v.number()),
    byCountry: v.record(v.string(), v.number()),
    newUsersTrend: v.record(v.string(), v.number()),
  }),
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000
    const endDate = args.endDate || Date.now()

    let users = await ctx.db.query('users').collect()

    if (args.organizationId) {
      const memberships = await ctx.db
        .query('memberships')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .collect()

      const userIds = memberships.map((m) => m.userId)
      users = users.filter((user) => userIds.includes(user._id))
    }

    const usersInPeriod = users.filter(
      (user) => user.createdAt >= startDate && user.createdAt <= endDate,
    )

    // Analytics par rôle
    const roleAnalytics: Record<string, number> = {}
    users.forEach((user) => {
      user.roles.forEach((role) => {
        roleAnalytics[role] = (roleAnalytics[role] || 0) + 1
      })
    })

    // Analytics par pays
    const countryAnalytics: Record<string, number> = {}
    users.forEach((user) => {
      if (user.countryCode) {
        countryAnalytics[user.countryCode] =
          (countryAnalytics[user.countryCode] || 0) + 1
      }
    })

    return {
      totalUsers: users.length,
      usersInPeriod: usersInPeriod.length,
      byStatus: {
        active: users.filter((u) => u.status === 'active').length,
        inactive: users.filter((u) => u.status === 'inactive').length,
        suspended: users.filter((u) => u.status === 'suspended').length,
      },
      byRole: roleAnalytics,
      byCountry: countryAnalytics,
      newUsersTrend: calculateNewUsersTrend(usersInPeriod, startDate, endDate),
    }
  },
})

// Fonctions utilitaires
function calculateAverageProcessingTime(requests: Array<any>): number {
  const completedRequests = requests.filter(
    (r) => r.status === 'completed' && r.completedAt,
  )

  if (completedRequests.length === 0) return 0

  const totalTime = completedRequests.reduce((sum, request) => {
    return sum + (request.completedAt - request.createdAt)
  }, 0)

  return totalTime / completedRequests.length
}

function calculateNewUsersTrend(
  users: Array<any>,
  startDate: number,
  endDate: number,
): Record<string, number> {
  const dailyStats: Record<string, number> = {}
  const periodDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))

  for (let i = 0; i < periodDays; i++) {
    const dayStart = startDate + i * 24 * 60 * 60 * 1000
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    const dayKey = new Date(dayStart).toISOString().split('T')[0]

    dailyStats[dayKey] = users.filter(
      (user) => user.createdAt >= dayStart && user.createdAt < dayEnd,
    ).length
  }

  return dailyStats
}

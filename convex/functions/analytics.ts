import { v } from 'convex/values';
import { query } from '../_generated/server';

export const getDashboardStats = query({
  handler: async (ctx) => {
    const [
      totalCountries,
      totalOrganizations,
      totalServices,
      totalUsers,
      totalDocuments,
      totalRequests,
      totalTickets,
      totalChildProfiles,
      totalProfiles,
      totalMemberships,
    ] = await Promise.all([
      ctx.db.query('countries').collect(),
      ctx.db.query('organizations').collect(),
      ctx.db.query('services').collect(),
      ctx.db.query('users').collect(),
      ctx.db.query('documents').collect(),
      ctx.db.query('requests').collect(),
      ctx.db.query('tickets').collect(),
      ctx.db.query('childProfiles').collect(),
      ctx.db.query('profiles').collect(),
      ctx.db.query('memberships').collect(),
    ]);

    return {
      users: {
        total: totalUsers.length,
        active: totalUsers.length,
        inactive: totalUsers.length,
      },
      documents: {
        total: totalDocuments.length,
        byStatus: {
          pending: totalDocuments.filter((d) => d.status === 'pending').length,
          validated: totalDocuments.filter((d) => d.status === 'validated').length,
          rejected: totalDocuments.filter((d) => d.status === 'rejected').length,
        },
      },
      services: {
        total: totalServices.length,
        byStatus: {
          active: totalServices.filter((s) => s.status === 'active').length,
          inactive: totalServices.filter((s) => s.status === 'inactive').length,
        },
      },
      organizations: {
        total: totalOrganizations.length,
        byStatus: {
          active: totalOrganizations.filter((o) => o.status === 'active').length,
          inactive: totalOrganizations.filter((o) => o.status === 'inactive').length,
        },
      },
      countries: {
        total: totalCountries.length,
        byStatus: {
          active: totalCountries.filter((c) => c.status === 'active').length,
          inactive: totalCountries.filter((c) => c.status === 'inactive').length,
        },
      },

      tickets: {
        total: totalTickets.length,
      },
      childProfiles: {
        total: totalChildProfiles.length,
        byStatus: {
          active: totalChildProfiles.filter((c) => c.status === 'active').length,
          inactive: totalChildProfiles.filter((c) => c.status === 'inactive').length,
        },
      },
      profiles: {
        total: totalProfiles.length,
        byStatus: {
          active: totalProfiles.filter((p) => p.status === 'active').length,
          inactive: totalProfiles.filter((p) => p.status === 'inactive').length,
        },
      },
      memberships: {
        total: totalMemberships.length,
        byStatus: {
          active: totalMemberships.filter((m) => m.status === 'active').length,
          inactive: totalMemberships.filter((m) => m.status === 'inactive').length,
        },
      },
      requests: {
        total: totalRequests.length,
        byStatus: {
          draft: totalRequests.filter((r) => r.status === 'draft').length,
          submitted: totalRequests.filter((r) => r.status === 'submitted').length,
          pending: totalRequests.filter((r) => r.status === 'pending').length,
          completed: totalRequests.filter((r) => r.status === 'completed').length,
        },
      },
    };
  },
});

export const getRequestAnalytics = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate || Date.now();

    let requests = await ctx.db.query('requests').collect();

    if (args.organizationId) {
      const orgServices = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .collect();

      const serviceIds = orgServices.map((service) => service._id);
      requests = requests.filter((request) => serviceIds.includes(request.serviceId));
    }

    const requestsInPeriod = requests.filter(
      (request) => request._creationTime >= startDate && request._creationTime <= endDate,
    );

    const services = await ctx.db.query('services').collect();
    const serviceAnalytics = services.map((service) => {
      const serviceRequests = requests.filter((r) => r.serviceId === service._id);
      const serviceRequestsInPeriod = requestsInPeriod.filter(
        (r) => r.serviceId === service._id,
      );

      return {
        serviceId: service._id,
        serviceName: service.name,
        totalRequests: serviceRequests.length,
        requestsInPeriod: serviceRequestsInPeriod.length,
        byStatus: {
          draft: serviceRequests.filter((r) => r.status === 'draft').length,
          submitted: serviceRequests.filter((r) => r.status === 'submitted').length,
          pending: serviceRequests.filter((r) => r.status === 'pending').length,
          completed: serviceRequests.filter((r) => r.status === 'completed').length,
        },
      };
    });

    const dailyStats: Record<string, number> = {};
    const periodDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));

    for (let i = 0; i < periodDays; i++) {
      const dayStart = startDate + i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayKey = new Date(dayStart).toISOString().split('T')[0];

      dailyStats[dayKey] = requestsInPeriod.filter(
        (request) => request._creationTime >= dayStart && request._creationTime < dayEnd,
      ).length;
    }

    return {
      totalRequests: requests.length,
      requestsInPeriod: requestsInPeriod.length,
      serviceAnalytics,
      dailyStats,
      averageProcessingTime: calculateAverageProcessingTime(requestsInPeriod),
    };
  },
});

export const getUserAnalytics = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate || Date.now();

    let users = await ctx.db.query('users').collect();

    if (args.organizationId) {
      const memberships = await ctx.db
        .query('memberships')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .collect();

      const userIds = memberships.map((m) => m.userId);
      users = users.filter((user) => userIds.includes(user._id));
    }

    const usersInPeriod = users.filter(
      (user) => user._creationTime >= startDate && user._creationTime <= endDate,
    );

    const roleAnalytics: Record<string, number> = {};
    users.forEach((user) => {
      user.roles.forEach((role) => {
        roleAnalytics[role] = (roleAnalytics[role] || 0) + 1;
      });
    });

    return {
      totalUsers: users.length,
      usersInPeriod: usersInPeriod.length,
      byStatus: {
        active: users.filter((u) => u.status === 'active').length,
        inactive: users.filter((u) => u.status === 'inactive').length,
        suspended: users.filter((u) => u.status === 'suspended').length,
      },
      byRole: roleAnalytics,
      newUsersTrend: calculateNewUsersTrend(
        usersInPeriod.map((u) => ({ createdAt: u._creationTime })),
        startDate,
        endDate,
      ),
    };
  },
});

function calculateAverageProcessingTime(
  requests: Array<{
    status: string | number;
    completedAt?: number;
    _creationTime: number;
  }>,
): number {
  const completedRequests = requests.filter(
    (r) => r.status === 'completed' && r.completedAt,
  );

  if (completedRequests.length === 0) return 0;

  const totalTime = completedRequests.reduce((sum, request) => {
    return sum + (request.completedAt! - request._creationTime);
  }, 0);

  return totalTime / completedRequests.length;
}

function calculateNewUsersTrend(
  users: Array<{ createdAt: number }>,
  startDate: number,
  endDate: number,
): Record<string, number> {
  const dailyStats: Record<string, number> = {};
  const periodDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));

  for (let i = 0; i < periodDays; i++) {
    const dayStart = startDate + i * 24 * 60 * 60 * 1000;
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayKey = new Date(dayStart).toISOString().split('T')[0];

    dailyStats[dayKey] = users.filter(
      (user) => user.createdAt >= dayStart && user.createdAt < dayEnd,
    ).length;
  }

  return dailyStats;
}

export const getManagerDashboardData = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const managedMemberships = await ctx.db
      .query('memberships')
      .filter((q) => q.eq(q.field('managerId'), args.userId))
      .collect();

    const managedMembershipIds = managedMemberships.map((m) => m._id);

    if (managedMembershipIds.length === 0) {
      return {
        stats: {
          totalAgents: 0,
          pendingRequests: 0,
          processingRequests: 0,
          completedRequests: 0,
          avgProcessingTime: 0,
          trend: {
            value: 0,
            isPositive: true,
          },
        },
        managedAgents: [],
        recentRequests: [],
        requestsByStatus: {
          submitted: 0,
          pending: 0,
          pendingCompletion: 0,
          validated: 0,
          rejected: 0,
          inProduction: 0,
          readyForPickup: 0,
          completed: 0,
        },
      };
    }

    const managedAgentsData = await Promise.all(
      managedMemberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        const assignedRequestsCount = await ctx.db
          .query('requests')
          .withIndex('by_assignee', (q) => q.eq('assignedAgentId', membership._id))
          .collect();

        const completedRequests = assignedRequestsCount.filter(
          (r) => r.status === 'completed',
        ).length;

        return {
          id: user?._id || membership._id,
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Agent',
          email: user?.email || '',
          _count: {
            assignedRequests: assignedRequestsCount.length,
          },
          completedRequests,
        };
      }),
    );

    const allRequests = await ctx.db
      .query('requests')
      .filter((q) =>
        q.or(...managedMembershipIds.map((id) => q.eq(q.field('assignedAgentId'), id))),
      )
      .collect();

    const services = await ctx.db.query('services').collect();
    const serviceMap = new Map(services.map((s) => [s._id, s]));

    const requestsWithDetails = await Promise.all(
      allRequests.map(async (request) => {
        const service = serviceMap.get(request.serviceId);
        const assignedMembership = request.assignedAgentId
          ? await ctx.db.get(request.assignedAgentId)
          : null;
        const assignedUser =
          assignedMembership && assignedMembership.userId
            ? await ctx.db.get(assignedMembership.userId)
            : null;

        return {
          id: request._id,
          status: request.status,
          createdAt: request._creationTime,
          submittedAt: request.submittedAt,
          completedAt: request.completedAt,
          service: {
            name: service?.name || 'Unknown Service',
          },
          assignedTo: assignedUser
            ? {
                name:
                  `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() ||
                  'Agent',
              }
            : null,
        };
      }),
    );

    const pendingStatuses = ['submitted', 'pending', 'pending_completion'];
    const processingStatuses = [
      'validated',
      'in_production',
      'ready_for_pickup',
      'appointment_scheduled',
    ];

    const pendingRequests = requestsWithDetails.filter((req) =>
      pendingStatuses.includes(req.status),
    ).length;

    const processingRequests = requestsWithDetails.filter((req) =>
      processingStatuses.includes(req.status),
    ).length;

    const completedRequests = requestsWithDetails.filter(
      (req) => req.status === 'completed',
    ).length;

    const completedWithTime = requestsWithDetails.filter(
      (req) => req.status === 'completed' && req.completedAt && req.submittedAt,
    );

    const avgProcessingTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce((acc, req) => {
            const time = req.completedAt! - req.submittedAt!;
            return acc + time;
          }, 0) /
          completedWithTime.length /
          (1000 * 60 * 60)
        : 0;

    const recentRequests = [...requestsWithDetails]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).getTime();
    const currentMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
      23,
      59,
      59,
    ).getTime();
    const previousMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    ).getTime();
    const previousMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0,
      23,
      59,
      59,
    ).getTime();

    const currentMonthCompleted = requestsWithDetails.filter(
      (req) =>
        req.status === 'completed' &&
        req.completedAt &&
        req.completedAt >= currentMonthStart &&
        req.completedAt <= currentMonthEnd,
    ).length;

    const previousMonthCompleted = requestsWithDetails.filter(
      (req) =>
        req.status === 'completed' &&
        req.completedAt &&
        req.completedAt >= previousMonthStart &&
        req.completedAt <= previousMonthEnd,
    ).length;

    const trend =
      previousMonthCompleted > 0
        ? ((currentMonthCompleted - previousMonthCompleted) / previousMonthCompleted) *
          100
        : 0;

    return {
      stats: {
        totalAgents: managedAgentsData.length,
        pendingRequests,
        processingRequests,
        completedRequests,
        avgProcessingTime: Math.round(avgProcessingTime),
        trend: {
          value: Math.abs(Math.round(trend)),
          isPositive: trend >= 0,
        },
      },
      managedAgents: managedAgentsData,
      recentRequests,
      requestsByStatus: {
        submitted: requestsWithDetails.filter((r) => r.status === 'submitted').length,
        pending: requestsWithDetails.filter((r) => r.status === 'pending').length,
        pendingCompletion: requestsWithDetails.filter(
          (r) => r.status === 'pending_completion',
        ).length,
        validated: requestsWithDetails.filter((r) => r.status === 'validated').length,
        rejected: requestsWithDetails.filter((r) => r.status === 'rejected').length,
        inProduction: requestsWithDetails.filter((r) => r.status === 'in_production')
          .length,
        readyForPickup: requestsWithDetails.filter((r) => r.status === 'ready_for_pickup')
          .length,
        completed: completedRequests,
      },
    };
  },
});

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { RequestStatus, ServicePriority } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

// Import existing dashboard actions
import {
  getManagerDashboardData as getManagerDashboardDataAction,
  getAgentPerformanceMetrics as getAgentPerformanceMetricsAction,
} from '@/actions/manager-dashboard';
import { getServiceRequestStats as getServiceRequestStatsAction } from '@/actions/service-requests';

export const dashboardRouter = createTRPCRouter({
  // Statistiques générales du dashboard admin
  getAdminStats: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.session.user.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const whereClause: {
        assignedOrganizationId?: string;
      } = {};
      if (input.organizationId) {
        whereClause.assignedOrganizationId = input.organizationId;
      }

      const dateFilter =
        input.startDate && input.endDate
          ? {
              createdAt: {
                gte: input.startDate,
                lte: input.endDate,
              },
            }
          : {};

      const [
        completedRequests,
        processingRequests,
        validatedProfiles,
        pendingProfiles,
        totalUsers,
        totalAppointments,
        recentRegistrations,
        upcomingAppointments,
      ] = await Promise.all([
        ctx.db.serviceRequest.count({
          where: {
            ...(input.organizationId ? { organizationId: input.organizationId } : {}),
            status: RequestStatus.COMPLETED,
            ...dateFilter,
          },
        }),
        ctx.db.serviceRequest.count({
          where: {
            ...(input.organizationId ? { organizationId: input.organizationId } : {}),
            status: {
              in: [
                RequestStatus.VALIDATED,
                RequestStatus.CARD_IN_PRODUCTION,
                RequestStatus.READY_FOR_PICKUP,
                RequestStatus.APPOINTMENT_SCHEDULED,
              ],
            },
            ...dateFilter,
          },
        }),
        ctx.db.profile.count({
          where: {
            ...whereClause,
            status: RequestStatus.COMPLETED,
            ...dateFilter,
          },
        }),
        ctx.db.profile.count({
          where: {
            ...whereClause,
            status: {
              in: [RequestStatus.SUBMITTED, RequestStatus.PENDING],
            },
            ...dateFilter,
          },
        }),
        ctx.db.user.count({
          where: input.organizationId
            ? { assignedOrganizationId: input.organizationId }
            : {},
        }),
        ctx.db.appointment.count({
          where: {
            ...(input.organizationId ? { organizationId: input.organizationId } : {}),
            ...dateFilter,
          },
        }),
        ctx.db.profile.findMany({
          where: {
            ...whereClause,
            status: {
              in: [RequestStatus.SUBMITTED, RequestStatus.PENDING],
            },
          },
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.db.appointment.findMany({
          where: {
            ...(input.organizationId ? { organizationId: input.organizationId } : {}),
            date: {
              gte: new Date(),
            },
          },
          take: 5,
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          include: {
            request: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            attendee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
      ]);

      return {
        stats: {
          completedRequests,
          processingRequests,
          validatedProfiles,
          pendingProfiles,
          totalUsers,
          totalAppointments,
        },
        recentData: {
          recentRegistrations,
          upcomingAppointments,
        },
      };
    }),

  // Statistiques pour les agents
  getAgentStats: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const agentId = input.agentId || ctx.session.user.id;

      // Vérifier les permissions
      if (
        agentId !== ctx.session.user.id &&
        !ctx.session.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const dateFilter =
        input.startDate && input.endDate
          ? {
              createdAt: {
                gte: input.startDate,
                lte: input.endDate,
              },
            }
          : {};

      // Récupérer les demandes assignées à l'agent
      const assignedRequests = await ctx.db.serviceRequest.findMany({
        where: {
          assignedToId: agentId,
          ...dateFilter,
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Calculer les statistiques
      const pendingRequests = assignedRequests.filter((req) =>
        ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(req.status),
      ).length;

      const processingRequests = assignedRequests.filter((req) =>
        [
          'VALIDATED',
          'CARD_IN_PRODUCTION',
          'READY_FOR_PICKUP',
          'APPOINTMENT_SCHEDULED',
        ].includes(req.status),
      ).length;

      const completedRequests = assignedRequests.filter(
        (req) => req.status === 'COMPLETED',
      ).length;

      // Récupérer les rendez-vous de l'agent
      const appointmentsResponse = await ctx.db.appointment.findMany({
        where: {
          agentId,
          ...dateFilter,
        },
        include: {
          attendee: {
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
        },
      });

      // Grouper les rendez-vous
      const now = new Date();
      const appointments = appointmentsResponse.reduce(
        (acc, appointment) => {
          const appointmentDate = new Date(appointment.startTime);
          if (appointment.status === 'CANCELLED') {
            acc.cancelled.push(appointment);
          } else if (appointmentDate < now) {
            acc.past.push(appointment);
          } else {
            acc.upcoming.push(appointment);
          }
          return acc;
        },
        {
          upcoming: [] as typeof appointmentsResponse,
          past: [] as typeof appointmentsResponse,
          cancelled: [] as typeof appointmentsResponse,
        },
      );

      return {
        stats: {
          pendingRequests,
          processingRequests,
          completedRequests,
          totalRequests: assignedRequests.length,
          upcomingAppointments: appointments.upcoming.length,
          completedAppointments: appointments.past.length,
        },
        appointments,
        recentRequests: assignedRequests
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5),
      };
    }),

  // Statistiques pour les managers
  getManagerStats: protectedProcedure
    .input(
      z.object({
        managerId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const managerId = input.managerId || ctx.session.user.id;

      // Vérifier les permissions
      if (
        managerId !== ctx.session.user.id &&
        !ctx.session.user.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas les permissions pour accéder à cette page.",
        });
      }

      try {
        const dashboardData = await getManagerDashboardDataAction();
        return dashboardData;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors du chargement des données du dashboard manager',
        });
      }
    }),

  // Statistiques SuperAdmin
  getSuperAdminStats: protectedProcedure.query(async ({ ctx }) => {
    // Vérifier les permissions
    if (!ctx.session.user.roles?.includes('SUPER_ADMIN')) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: "Vous n'avez pas les permissions pour accéder à cette page.",
      });
    }

    const [
      totalCountries,
      totalOrganizations,
      totalServices,
      totalUsers,
      activeCountries,
      activeOrganizations,
    ] = await Promise.all([
      ctx.db.country.count(),
      ctx.db.organization.count(),
      ctx.db.consularService.count(),
      ctx.db.user.count(),
      ctx.db.country.count({
        where: { status: 'ACTIVE' },
      }),
      ctx.db.organization.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    return {
      stats: {
        totalCountries,
        totalOrganizations,
        totalServices,
        totalUsers,
        activeCountries,
        activeOrganizations,
      },
    };
  }),

  // Métriques de performance d'un agent (pour les managers)
  getAgentPerformanceMetrics: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const metrics = await getAgentPerformanceMetricsAction(input.agentId);
        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch agent performance metrics',
        });
      }
    }),

  // Statistiques globales des demandes de service
  getServiceRequestStats: protectedProcedure.query(async () => {
    try {
      const stats = await getServiceRequestStatsAction();
      return stats;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch service request stats',
      });
    }
  }),

  // Statistiques par période (pour les graphiques)
  getStatsByPeriod: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']),
        startDate: z.date(),
        endDate: z.date(),
        organizationId: z.string().optional(),
        agentId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const serviceRequestWhere: {
        organizationId?: string;
        assignedToId?: string;
      } = {};

      const appointmentWhere: {
        organizationId?: string;
        agentId?: string;
      } = {};

      if (input.organizationId) {
        serviceRequestWhere.organizationId = input.organizationId;
        appointmentWhere.organizationId = input.organizationId;
      }

      if (input.agentId) {
        serviceRequestWhere.assignedToId = input.agentId;
        appointmentWhere.agentId = input.agentId;
      }

      // Récupérer les données groupées par période
      const requests = await ctx.db.serviceRequest.findMany({
        where: {
          ...serviceRequestWhere,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          completedAt: true,
        },
      });

      const appointments = await ctx.db.appointment.findMany({
        where: {
          ...appointmentWhere,
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          date: true,
        },
      });

      // Grouper par période et calculer les métriques
      // Cette logique peut être étendue selon les besoins
      return {
        requests: {
          total: requests.length,
          completed: requests.filter((r) => r.status === 'COMPLETED').length,
          pending: requests.filter((r) => ['SUBMITTED', 'PENDING'].includes(r.status))
            .length,
        },
        appointments: {
          total: appointments.length,
          completed: appointments.filter((a) => a.status === 'COMPLETED').length,
          upcoming: appointments.filter((a) => a.status === 'CONFIRMED').length,
        },
      };
    }),

  // Statistiques en temps réel pour le dashboard
  getRealTimeStats: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const [requestsToday, appointmentsToday, completedToday, urgentPending] =
      await Promise.all([
        ctx.db.serviceRequest.count({
          where: {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),
        ctx.db.appointment.count({
          where: {
            date: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),
        ctx.db.serviceRequest.count({
          where: {
            status: RequestStatus.COMPLETED,
            completedAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),
        ctx.db.serviceRequest.count({
          where: {
            priority: ServicePriority.URGENT,
            status: {
              in: [
                RequestStatus.SUBMITTED,
                RequestStatus.PENDING,
                RequestStatus.PENDING_COMPLETION,
              ],
            },
          },
        }),
      ]);

    return {
      requestsToday,
      appointmentsToday,
      completedToday,
      urgentPending,
      lastUpdated: new Date(),
    };
  }),
});

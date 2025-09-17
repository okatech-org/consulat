import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { Prisma, UserRole, RequestActionType, NotificationType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { env } from '@/env';
import { ROUTES } from '@/schemas/routes';
import { getTranslations } from 'next-intl/server';
import {
  AgentDetailsSelect,
  agentFiltersSchema,
  assignRequestSchema,
  createAgentSchema,
  updateAgentSchema,
} from './misc';
import { AgentListItemSelect } from './misc';

export const agentsRouter = createTRPCRouter({
  // Récupérer la liste des agents avec filtres et pagination
  getList: protectedProcedure.input(agentFiltersSchema).query(async ({ ctx, input }) => {
    // Vérifier les permissions
    const user = ctx.auth.userId;

    const {
      search,
      linkedCountries,
      assignedServices,
      assignedOrganizationId,
      managedByUserId,
      page,
      limit,
      sortBy,
    } = input;

    // Construire les filtres
    const where: Prisma.UserWhereInput = {
      OR: [{ roles: { has: UserRole.AGENT } }, { roles: { has: UserRole.MANAGER } }],
    };

    // Filtres par défaut selon le rôle
    if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
      where.managedByUserId = user.id;
    }

    if (managedByUserId?.length) {
      where.managedByUserId = { in: managedByUserId };
    }

    if (assignedServices?.length) {
      where.assignedServices = { some: { id: { in: assignedServices } } };
    }

    if (linkedCountries?.length) {
      where.linkedCountries = { some: { code: { in: linkedCountries } } };
    }

    if (assignedOrganizationId?.length) {
      where.assignedOrganizationId = { in: assignedOrganizationId };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [items, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: AgentListItemSelect,
          orderBy: sortBy ? { [sortBy.field]: sortBy.direction } : { createdAt: 'desc' },
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch agents',
      });
    }
  }),

  // Récupérer un agent par ID avec détails complets
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];

      if (!user.roles.some((role) => allowedRoles.includes(role))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to view agent details',
        });
      }

      try {
        const agent = await ctx.db.user.findUnique({
          where: { id: input.id },
          select: AgentDetailsSelect,
        });

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          });
        }

        // Vérifier si un manager peut voir cet agent
        if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
          if (agent.managedByUserId !== user.id && agent.id !== user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only view agents you manage',
            });
          }
        }

        return agent;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching agent details:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch agent details',
        });
      }
    }),

  // Créer un nouvel agent
  create: protectedProcedure.input(createAgentSchema).mutation(async ({ ctx, input }) => {
    const user = ctx.auth.userId;
    if (!user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions to create agents',
      });
    }

    const {
      firstName,
      lastName,
      countryIds,
      serviceIds,
      role,
      managedByUserId,
      managedAgentIds,
      ...rest
    } = input;

    try {
      const agent = await ctx.db.user.create({
        data: {
          ...rest,
          name: `${firstName} ${lastName}`,
          roles: [role],
          role,
          ...(managedByUserId && { managedByUserId }),
          linkedCountries: {
            connect: countryIds.map((id) => ({ id })),
          },
          ...(serviceIds.length > 0 && {
            assignedServices: {
              connect: serviceIds.map((id) => ({ id })),
            },
          }),
        },
        select: AgentDetailsSelect,
      });

      // Si c'est un manager, assigner les agents
      if (role === UserRole.MANAGER && managedAgentIds?.length) {
        await ctx.db.user.updateMany({
          where: {
            id: { in: managedAgentIds },
          },
          data: {
            managedByUserId: agent.id,
          },
        });
      }

      // Notification de bienvenue
      const t = await getTranslations('agent.notifications');
      await notify({
        userId: agent.id,
        type: NotificationType.FEEDBACK,
        title: t('welcome.title'),
        message: t('welcome.message', {
          organization: agent.assignedOrganization?.name ?? 'N/A',
        }),
        channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
        email: agent.email || undefined,
        priority: 'high',
        actions: [
          {
            label: t('welcome.action'),
            url: `${env.NEXT_PUBLIC_URL}${ROUTES.dashboard.base}`,
            primary: true,
          },
        ],
        metadata: {
          createdBy: user.id,
          createdByName: user.name || '',
          assignedServices: serviceIds,
        },
      });

      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create agent',
      });
    }
  }),

  // Mettre à jour un agent
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateAgentSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      if (
        !user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to update agents',
        });
      }

      const { id, data } = input;

      try {
        // Vérifier que l'agent existe
        const existingAgent = await ctx.db.user.findUnique({
          where: { id },
          select: { id: true, managedByUserId: true },
        });

        if (!existingAgent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          });
        }

        // Vérifier les permissions pour les managers
        if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
          if (existingAgent.managedByUserId !== user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only update agents you manage',
            });
          }
        }

        const updateData: Prisma.UserUpdateInput = {};

        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
        if (data.role) updateData.role = data.role;

        if (data.managedByUserId !== undefined) {
          if (data.managedByUserId) {
            updateData.managedBy = { connect: { id: data.managedByUserId } };
          } else {
            updateData.managedBy = { disconnect: true };
          }
        }

        if (data.countryIds) {
          updateData.linkedCountries = {
            set: data.countryIds.map((id) => ({ id })),
          };
        }

        if (data.serviceIds) {
          updateData.assignedServices = {
            set: data.serviceIds.map((id) => ({ id })),
          };
        }

        // Gérer les agents managés pour les managers
        if (data.managedAgentIds && data.role === UserRole.MANAGER) {
          // Mettre à jour les agents managés
          await ctx.db.user.updateMany({
            where: {
              id: { in: data.managedAgentIds },
            },
            data: {
              managedByUserId: id,
            },
          });

          // Retirer le manager des agents qui ne sont plus managés
          const currentManagedAgents = await ctx.db.user.findMany({
            where: { managedByUserId: id },
            select: { id: true },
          });

          const agentsToRemove = currentManagedAgents
            .filter((agent) => !data.managedAgentIds!.includes(agent.id))
            .map((agent) => agent.id);

          if (agentsToRemove.length > 0) {
            await ctx.db.user.updateMany({
              where: {
                id: { in: agentsToRemove },
              },
              data: {
                managedByUserId: null,
              },
            });
          }
        }

        const updatedAgent = await ctx.db.user.update({
          where: { id },
          data: updateData,
          select: AgentDetailsSelect,
        });

        return updatedAgent;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error updating agent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update agent',
        });
      }
    }),

  // Assigner une demande à un agent
  assignRequest: protectedProcedure
    .input(assignRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      if (
        !user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to assign requests',
        });
      }

      const { requestId, agentId } = input;

      try {
        // Vérifier que la demande existe
        const request = await ctx.db.serviceRequest.findUnique({
          where: { id: requestId },
          select: {
            id: true,
            status: true,
            serviceCategory: true,
            organizationId: true,
            countryCode: true,
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Request not found',
          });
        }

        // Vérifier que l'agent existe et est disponible
        const agent = await ctx.db.user.findUnique({
          where: { id: agentId },
          select: {
            id: true,
            name: true,
            email: true,
            managedByUserId: true,
          },
        });

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          });
        }

        // Vérifier les permissions pour les managers
        if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
          if (agent.managedByUserId !== user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only assign requests to agents you manage',
            });
          }
        }

        // Assigner la demande
        const updatedRequest = await ctx.db.serviceRequest.update({
          where: { id: requestId },
          data: {
            assignedToId: agentId,
            assignedAt: new Date(),
            status: 'PENDING',
            lastActionAt: new Date(),
            lastActionBy: user.id,
          },
          include: {
            assignedTo: true,
            service: true,
          },
        });

        // Créer une action de traçabilité
        await ctx.db.requestAction.create({
          data: {
            type: RequestActionType.ASSIGNMENT,
            requestId,
            userId: user.id,
            data: {
              previousStatus: request.status,
              newStatus: 'PENDING',
              assignedToId: agentId,
              assignedToName: agent.name,
            },
          },
        });

        // Notifier l'agent
        const t = await getTranslations('agent.notifications');
        await notify({
          userId: agentId,
          type: NotificationType.REQUEST_NEW,
          title: t('REQUEST_NEW.title'),
          message: t('REQUEST_NEW.message', {
            requestType: request.serviceCategory,
          }),
          channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
          email: agent.email || undefined,
          actions: [
            {
              label: t('REQUEST_NEW.see_request'),
              url: `${env.NEXT_PUBLIC_URL}${ROUTES.dashboard.service_requests(request.id)}`,
              primary: true,
            },
          ],
          metadata: {
            requestId: request.id,
            requestType: request.serviceCategory,
            organizationId: request.organizationId,
            countryCode: request.countryCode,
          },
        });

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error assigning request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign request',
        });
      }
    }),

  // Réassigner une demande (pour les managers)
  reassignRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        fromAgentId: z.string(),
        toAgentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      if (
        !user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to reassign requests',
        });
      }

      const { requestId, fromAgentId, toAgentId } = input;

      try {
        // Vérifier que les agents sont managés par ce manager (si applicable)
        if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
          const [fromAgent, toAgent] = await Promise.all([
            ctx.db.user.findUnique({
              where: { id: fromAgentId },
              select: { managedByUserId: true },
            }),
            ctx.db.user.findUnique({
              where: { id: toAgentId },
              select: { managedByUserId: true, name: true, email: true },
            }),
          ]);

          if (!fromAgent || !toAgent) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'One or both agents not found',
            });
          }

          if (
            fromAgent.managedByUserId !== user.id ||
            toAgent.managedByUserId !== user.id
          ) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only reassign between agents you manage',
            });
          }
        }

        // Réassigner la demande
        const updatedRequest = await ctx.db.serviceRequest.update({
          where: { id: requestId },
          data: {
            assignedToId: toAgentId,
            assignedAt: new Date(),
            lastActionAt: new Date(),
            lastActionBy: user.id,
          },
          include: {
            assignedTo: true,
            service: true,
          },
        });

        // Créer une action de traçabilité
        await ctx.db.requestAction.create({
          data: {
            type: RequestActionType.ASSIGNMENT,
            requestId,
            userId: user.id,
            data: {
              previousAgentId: fromAgentId,
              newAgentId: toAgentId,
              reassignedBy: user.id,
              reason: 'Manager reassignment',
            },
          },
        });

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error reassigning request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reassign request',
        });
      }
    }),

  // Récupérer les agents disponibles pour un service/pays
  getAvailable: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        countryCode: z.string(),
        serviceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      if (
        !user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to view available agents',
        });
      }

      const { organizationId, countryCode, serviceId } = input;

      try {
        const agents = await ctx.db.user.findMany({
          where: {
            assignedOrganizationId: organizationId,
            linkedCountries: {
              some: {
                code: countryCode,
              },
            },
            assignedServices: {
              some: {
                id: serviceId,
              },
            },
            roles: {
              has: UserRole.AGENT,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            _count: {
              select: {
                assignedRequests: {
                  where: {
                    status: {
                      notIn: ['COMPLETED', 'REJECTED'],
                    },
                  },
                },
              },
            },
            completedRequests: true,
            averageProcessingTime: true,
          },
          orderBy: {
            name: 'asc',
          },
        });

        return agents;
      } catch (error) {
        console.error('Error fetching available agents:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch available agents',
        });
      }
    }),

  // Récupérer les métriques de performance d'un agent
  getPerformanceMetrics: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      if (
        !user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to view performance metrics',
        });
      }

      const { agentId } = input;

      try {
        // Vérifier que l'agent existe et les permissions
        const agent = await ctx.db.user.findUnique({
          where: { id: agentId },
          select: {
            id: true,
            name: true,
            managedByUserId: true,
            completedRequests: true,
            averageProcessingTime: true,
          },
        });

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          });
        }

        // Vérifier les permissions pour les managers
        if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
          if (agent.managedByUserId !== user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You can only view metrics for agents you manage',
            });
          }
        }

        // Récupérer les demandes de l'agent
        const requests = await ctx.db.serviceRequest.findMany({
          where: {
            assignedToId: agentId,
          },
          select: {
            id: true,
            status: true,
            priority: true,
            serviceCategory: true,
            createdAt: true,
            submittedAt: true,
            completedAt: true,
            assignedAt: true,
          },
        });

        // Calculer les métriques
        const completedRequests = requests.filter((r) => r.status === 'COMPLETED').length;
        const pendingRequests = requests.filter((r) =>
          ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(r.status),
        ).length;
        const processingRequests = requests.filter((r) =>
          [
            'VALIDATED',
            'CARD_IN_PRODUCTION',
            'READY_FOR_PICKUP',
            'APPOINTMENT_SCHEDULED',
          ].includes(r.status),
        ).length;

        // Calculer le temps de traitement moyen
        const completedWithTime = requests.filter(
          (req) => req.status === 'COMPLETED' && req.completedAt && req.submittedAt,
        );

        const avgProcessingTime =
          completedWithTime.length > 0
            ? completedWithTime.reduce((acc, req) => {
                const time = req.completedAt!.getTime() - req.submittedAt!.getTime();
                return acc + time;
              }, 0) /
              completedWithTime.length /
              (1000 * 60 * 60) // Convertir en heures
            : 0;

        // Statistiques par catégorie
        const categoriesStats = requests.reduce(
          (acc, req) => {
            const category = req.serviceCategory;
            if (!acc[category]) {
              acc[category] = { total: 0, completed: 0 };
            }
            acc[category].total++;
            if (req.status === 'COMPLETED') {
              acc[category].completed++;
            }
            return acc;
          },
          {} as Record<string, { total: number; completed: number }>,
        );

        return {
          agentId,
          agentName: agent.name || 'Agent',
          completedRequests,
          pendingRequests,
          processingRequests,
          totalRequests: requests.length,
          avgProcessingTime: Math.round(avgProcessingTime),
          categoriesStats,
          completionRate:
            requests.length > 0 ? (completedRequests / requests.length) * 100 : 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching performance metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch performance metrics',
        });
      }
    }),

  // Récupérer les statistiques globales des agents
  getStats: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        managerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.auth.userId;
      if (
        !user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to view agent statistics',
        });
      }

      const { organizationId, managerId } = input;

      try {
        const where: Prisma.UserWhereInput = {
          roles: {
            has: UserRole.AGENT,
          },
        };

        // Filtres selon les permissions
        if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
          where.managedByUserId = user.id;
        } else {
          if (organizationId) {
            where.assignedOrganizationId = organizationId;
          }
          if (managerId) {
            where.managedByUserId = managerId;
          }
        }

        const [totalAgents, activeAgents, agentRequests] = await Promise.all([
          ctx.db.user.count({ where }),
          ctx.db.user.count({
            where: {
              ...where,
              assignedRequests: {
                some: {
                  status: {
                    notIn: ['COMPLETED', 'REJECTED'],
                  },
                },
              },
            },
          }),
          ctx.db.serviceRequest.groupBy({
            by: ['assignedToId'],
            where: {
              assignedTo: where,
            },
            _count: {
              id: true,
            },
            _avg: {
              processingTime: true,
            },
          }),
        ]);

        const totalActiveRequests = agentRequests.reduce(
          (sum, agent) => sum + (agent._count?.id || 0),
          0,
        );
        const avgProcessingTime =
          agentRequests.length > 0
            ? agentRequests.reduce(
                (sum, agent) => sum + (agent._avg?.processingTime || 0),
                0,
              ) / agentRequests.length
            : 0;

        return {
          totalAgents,
          activeAgents,
          totalActiveRequests,
          avgProcessingTime: Math.round(avgProcessingTime),
          utilizationRate: totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0,
        };
      } catch (error) {
        console.error('Error fetching agent statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch agent statistics',
        });
      }
    }),
});

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { Prisma, RequestStatus, ServicePriority, UserRole } from '@prisma/client';

// Import existing request actions
import {
  assignServiceRequest,
  updateServiceRequestStatus,
  updateServiceRequest,
} from '@/actions/service-requests';
import {
  validateConsularRegistration,
  updateConsularRegistrationStatus,
  startCardProduction,
} from '@/actions/consular-registration';
import { validateRegistrationRequest } from '@/actions/registrations';
import { reassignRequest } from '@/actions/manager-dashboard';
import {
  requestFiltersSchema,
  statusUpdateSchema,
  assignmentSchema,
  consularValidationSchema,
} from './inputs';
import { RequestDetailsSelect, RequestListItemSelect } from './misc';

export const requestsRouter = createTRPCRouter({
  // Récupérer la liste des demandes avec filtres et pagination
  getList: protectedProcedure
    .input(requestFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          search,
          status,
          priority,
          serviceCategory,
          assignedToId,
          organizationId,
          page = 1,
          limit = 10,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          userId,
        } = input || {};

        const where: Prisma.ServiceRequestWhereInput = {};

        if (ctx.user.roles.includes(UserRole.AGENT)) {
          where.assignedToId = { in: [ctx.auth.userId] };
        }

        if (ctx.user.roles.includes(UserRole.USER)) {
          where.submittedById = ctx.auth.userId;
        }

        if (userId) where.submittedById = userId;
        if (status) where.status = { in: status };
        if (priority) where.priority = { in: priority };
        if (serviceCategory) where.serviceCategory = { in: serviceCategory };
        if (assignedToId && !ctx.user.roles.includes(UserRole.MANAGER)) {
          where.assignedToId = { in: assignedToId };
        }
        if (organizationId) where.organizationId = { in: organizationId };

        if (search) {
          where.OR = [
            { requestedFor: { firstName: { contains: search, mode: 'insensitive' } } },
            { requestedFor: { lastName: { contains: search, mode: 'insensitive' } } },
            { requestedFor: { email: { contains: search, mode: 'insensitive' } } },
            { requestedFor: { phoneNumber: { contains: search, mode: 'insensitive' } } },
            { requestedFor: { cardNumber: { contains: search, mode: 'insensitive' } } },
            {
              requestedFor: { passportNumber: { contains: search, mode: 'insensitive' } },
            },
            { service: { name: { contains: search, mode: 'insensitive' } } },
          ];
        }

        const [requests, total] = await Promise.all([
          ctx.db.serviceRequest.findMany({
            where,
            select: RequestListItemSelect,
            ...(sortBy && {
              orderBy:
                sortBy === 'firstName' || sortBy === 'lastName'
                  ? { requestedFor: { [sortBy]: sortOrder } }
                  : { [sortBy]: sortOrder },
            }),
            skip: (page - 1) * limit,
            take: limit,
          }),
          ctx.db.serviceRequest.count({ where }),
        ]);

        return {
          items: requests,
          total,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu récupérer les demandes",
        });
      }
    }),

  // Récupérer une demande par ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return ctx.db.serviceRequest.findUnique({
          where: { id: input.id },
          select: RequestDetailsSelect,
        });
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : "La demande à laquelle vous tentez d'accéder n'existe pas",
        });
      }
    }),

  // Récupérer les demandes d'un utilisateur spécifique
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (
        input.userId !== ctx.auth.userId &&
        !ctx.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas les permissions pour accéder à cette demande",
        });
      }

      try {
        const result = await ctx.db.serviceRequest.findMany({
          where: {
            OR: [{ submittedById: input.userId }, { assignedToId: input.userId }],
          },
          select: RequestListItemSelect,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu récupérer les demandes de l'utilisateur",
        });
      }
    }),

  // Assigner une demande à un agent
  assign: protectedProcedure.input(assignmentSchema).mutation(async ({ input, ctx }) => {
    // Vérifier les permissions
    if (
      !ctx.user.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role))
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: "Vous n'avez pas les permissions pour assigner une demande",
      });
    }

    try {
      const result = await assignServiceRequest(input.requestId, input.agentId);
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : "Nous n'avons pas pu assigner la demande",
      });
    }
  }),

  // Réassigner une demande (pour les managers)
  reassign: protectedProcedure
    .input(assignmentSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.user.roles?.includes('MANAGER')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les managers peuvent réassigner des demandes',
        });
      }

      try {
        const result = await reassignRequest(input.requestId, input.agentId);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu réassigner la demande",
        });
      }
    }),

  // Mettre à jour le statut d'une demande
  updateStatus: protectedProcedure
    .input(statusUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (
        !ctx.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "Vous n'avez pas les permissions pour mettre à jour le statut de la demande",
        });
      }

      try {
        const result = await updateServiceRequestStatus(
          input.requestId,
          input.status,
          input.notes,
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu mettre à jour le statut de la demande",
        });
      }
    }),

  // Mettre à jour une demande (données générales)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        priority: z.nativeEnum(ServicePriority).optional(),
        organizationId: z.string().optional(),
        assignedToId: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (
        !ctx.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas les permissions pour mettre à jour la demande",
        });
      }

      try {
        const result = await updateServiceRequest(input);

        if ('error' in result) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.error,
          });
        }

        return result.data;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu mettre à jour la demande",
        });
      }
    }),

  // Valider une inscription consulaire
  validateConsularRegistration: protectedProcedure
    .input(consularValidationSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (
        !ctx.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "Vous n'avez pas les permissions pour valider l'inscription consulaire",
        });
      }

      try {
        const result = await validateConsularRegistration(
          input.requestId,
          input.profileId,
          input.residenceCountryCode,
          input.status,
          input.validityYears,
          input.notes,
          input.organizationId,
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu valider l'inscription consulaire",
        });
      }
    }),

  // Mettre à jour le statut d'une inscription consulaire
  updateConsularStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        profileId: z.string(),
        status: z.nativeEnum(RequestStatus),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (
        !ctx.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "Vous n'avez pas les permissions pour mettre à jour le statut de l'inscription consulaire",
        });
      }

      try {
        const result = await updateConsularRegistrationStatus(
          input.requestId,
          input.profileId,
          input.status,
          input.notes,
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu mettre à jour le statut de l'inscription consulaire",
        });
      }
    }),

  // Démarrer la production de carte
  startCardProduction: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (
        !ctx.user.roles?.some((role) =>
          ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas les permissions pour démarrer la production de carte",
        });
      }

      try {
        const result = await startCardProduction(input.requestId);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu démarrer la production de carte",
        });
      }
    }),

  // Valider une demande d'inscription (pour les admins)
  validateRegistration: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        profileId: z.string(),
        status: z.nativeEnum(RequestStatus),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.user.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "Vous n'avez pas les permissions pour valider une demande d'inscription",
        });
      }

      try {
        const result = await validateRegistrationRequest(input);

        if ('error' in result) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.error,
          });
        }

        return result.data;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : "Nous n'avons pas pu valider la demande d'inscription",
        });
      }
    }),

  // Obtenir l'historique des actions d'une demande
  getActionHistory: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const actions = await ctx.db.requestAction.findMany({
          where: {
            requestId: input.requestId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                roles: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return actions;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Nous n'avons pas pu récupérer l'historique des actions de la demande",
        });
      }
    }),

  // Obtenir les notes d'une demande
  getNotes: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const notes = await ctx.db.note.findMany({
          where: {
            serviceRequestId: input.requestId,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                roles: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return notes;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Nous n'avons pas pu récupérer les notes de la demande",
        });
      }
    }),

  // Ajouter une note à une demande
  addNote: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        content: z.string().min(1),
        type: z.enum(['INTERNAL', 'FEEDBACK', 'VALIDATION']).default('INTERNAL'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const note = await ctx.db.note.create({
          data: {
            content: input.content,
            type: input.type,
            serviceRequestId: input.requestId,
            authorId: ctx.auth.userId,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                roles: true,
              },
            },
          },
        });

        return note;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Nous n'avons pas pu ajouter la note à la demande",
        });
      }
    }),

  // Obtenir les statistiques des demandes par statut
  getStatusStats: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        agentId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const whereClause: {
        organizationId?: string;
        assignedToId?: string;
        createdAt?: { gte: Date; lte: Date };
      } = {};

      if (input.organizationId) {
        whereClause.organizationId = input.organizationId;
      }

      if (input.agentId) {
        whereClause.assignedToId = input.agentId;
      }

      if (input.startDate && input.endDate) {
        whereClause.createdAt = {
          gte: input.startDate,
          lte: input.endDate,
        };
      }

      try {
        const [statusStats, priorityStats, categoryStats] = await Promise.all([
          ctx.db.serviceRequest.groupBy({
            by: ['status'],
            where: whereClause,
            _count: true,
          }),
          ctx.db.serviceRequest.groupBy({
            by: ['priority'],
            where: whereClause,
            _count: true,
          }),
          ctx.db.serviceRequest.groupBy({
            by: ['serviceCategory'],
            where: whereClause,
            _count: true,
          }),
        ]);

        return {
          byStatus: Object.fromEntries(
            statusStats.map((stat) => [stat.status, stat._count]),
          ),
          byPriority: Object.fromEntries(
            priorityStats.map((stat) => [stat.priority, stat._count]),
          ),
          byCategory: Object.fromEntries(
            categoryStats.map((stat) => [stat.serviceCategory, stat._count]),
          ),
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Nous n'avons pas pu récupérer les statistiques des demandes",
        });
      }
    }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const request = await ctx.db.serviceRequest.findFirst({
      where: {
        submittedById: ctx.auth.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: RequestDetailsSelect,
    });

    return request;
  }),
});

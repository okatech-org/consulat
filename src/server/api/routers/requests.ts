import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { RequestStatus, ServicePriority, ServiceCategory } from '@prisma/client';

// Import existing request actions
import { 
  getServiceRequestsList,
  getServiceRequest,
  assignServiceRequest,
  updateServiceRequestStatus,
  updateServiceRequest,
  getServiceRequestsByUser,
} from '@/actions/service-requests';
import { 
  validateConsularRegistration,
  updateConsularRegistrationStatus,
  startCardProduction,
} from '@/actions/consular-registration';
import { 
  validateRegistrationRequest 
} from '@/actions/registrations';
import { 
  reassignRequest 
} from '@/actions/manager-dashboard';

// Schema pour les filtres de demandes
const requestFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.nativeEnum(RequestStatus)).optional(),
  priority: z.array(z.nativeEnum(ServicePriority)).optional(),
  serviceCategory: z.array(z.nativeEnum(ServiceCategory)).optional(),
  assignedToId: z.array(z.string()).optional(),
  organizationId: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema pour la mise à jour de statut
const statusUpdateSchema = z.object({
  requestId: z.string(),
  status: z.nativeEnum(RequestStatus),
  notes: z.string().optional(),
});

// Schema pour l'assignation
const assignmentSchema = z.object({
  requestId: z.string(),
  agentId: z.string(),
});

// Schema pour la validation consulaire
const consularValidationSchema = z.object({
  requestId: z.string(),
  profileId: z.string(),
  residenceCountryCode: z.string(),
  status: z.nativeEnum(RequestStatus),
  validityYears: z.number().min(1).max(10).default(3),
  notes: z.string().optional(),
  organizationId: z.string().optional(),
});

export const requestsRouter = createTRPCRouter({
  // Récupérer la liste des demandes avec filtres et pagination
  getList: protectedProcedure
    .input(requestFiltersSchema)
    .query(async ({ input }) => {
      try {
        const result = await getServiceRequestsList(input);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch requests',
        });
      }
    }),

  // Récupérer une demande par ID
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const request = await getServiceRequest(input.id);
        return request;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error instanceof Error ? error.message : 'Request not found',
        });
      }
    }),

  // Récupérer les demandes d'un utilisateur spécifique
  getByUser: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (input.userId !== ctx.session.user.id && 
          !ctx.session.user.roles?.some(role => 
            ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role)
          )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      try {
        const requests = await getServiceRequestsByUser(input.userId);
        return requests;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user requests',
        });
      }
    }),

  // Assigner une demande à un agent
  assign: protectedProcedure
    .input(assignmentSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      try {
        const result = await assignServiceRequest(input.requestId, input.agentId);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to assign request',
        });
      }
    }),

  // Réassigner une demande (pour les managers)
  reassign: protectedProcedure
    .input(assignmentSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.includes('MANAGER')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only managers can reassign requests',
        });
      }

      try {
        const result = await reassignRequest(input.requestId, input.agentId);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to reassign request',
        });
      }
    }),

  // Mettre à jour le statut d'une demande
  updateStatus: protectedProcedure
    .input(statusUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      try {
        const result = await updateServiceRequestStatus(
          input.requestId,
          input.status,
          input.notes
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update request status',
        });
      }
    }),

  // Mettre à jour une demande (données générales)
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      priority: z.nativeEnum(ServicePriority).optional(),
      organizationId: z.string().optional(),
      assignedToId: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
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
          message: error instanceof Error ? error.message : 'Failed to update request',
        });
      }
    }),

  // Valider une inscription consulaire
  validateConsularRegistration: protectedProcedure
    .input(consularValidationSchema)
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
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
          input.organizationId
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to validate consular registration',
        });
      }
    }),

  // Mettre à jour le statut d'une inscription consulaire
  updateConsularStatus: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      profileId: z.string(),
      status: z.nativeEnum(RequestStatus),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      try {
        const result = await updateConsularRegistrationStatus(
          input.requestId,
          input.profileId,
          input.status,
          input.notes
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update consular status',
        });
      }
    }),

  // Démarrer la production de carte
  startCardProduction: protectedProcedure
    .input(z.object({
      requestId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      try {
        const result = await startCardProduction(input.requestId);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to start card production',
        });
      }
    }),

  // Valider une demande d'inscription (pour les admins)
  validateRegistration: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      profileId: z.string(),
      status: z.nativeEnum(RequestStatus),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Vérifier les permissions
      if (!ctx.session.user.roles?.some(role => 
        ['ADMIN', 'SUPER_ADMIN'].includes(role)
      )) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can validate registrations',
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
          message: error instanceof Error ? error.message : 'Failed to validate registration',
        });
      }
    }),

  // Obtenir l'historique des actions d'une demande
  getActionHistory: protectedProcedure
    .input(z.object({
      requestId: z.string(),
    }))
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch action history',
        });
      }
    }),

  // Obtenir les notes d'une demande
  getNotes: protectedProcedure
    .input(z.object({
      requestId: z.string(),
    }))
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notes',
        });
      }
    }),

  // Ajouter une note à une demande
  addNote: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      content: z.string().min(1),
      type: z.enum(['INTERNAL', 'FEEDBACK', 'VALIDATION']).default('INTERNAL'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const note = await ctx.db.note.create({
          data: {
            content: input.content,
            type: input.type,
            serviceRequestId: input.requestId,
            authorId: ctx.session.user.id,
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add note',
        });
      }
    }),

  // Obtenir les statistiques des demandes par statut
  getStatusStats: protectedProcedure
    .input(z.object({
      organizationId: z.string().optional(),
      agentId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
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
            statusStats.map(stat => [stat.status, stat._count])
          ),
          byPriority: Object.fromEntries(
            priorityStats.map(stat => [stat.priority, stat._count])
          ),
          byCategory: Object.fromEntries(
            categoryStats.map(stat => [stat.serviceCategory, stat._count])
          ),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch status statistics',
        });
      }
    }),
}); 
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import {
  getAvailableConsularServices,
  getUserServiceRequests,
  getServiceRequestDetails,
  getConsularServiceDetails,
  getConsularService,
  submitServiceRequest,
} from '@/actions/services';
import { ServiceCategory, RequestStatus, type Prisma } from '@prisma/client';
import type { CountryCode } from '@/lib/autocomplete-datas';

// Types optimisés pour le dashboard des services
export type DashboardService = {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
  isFree: boolean;
  price: number | null;
  currency: string | null;
  requiresAppointment: boolean;
};

export type DashboardServiceRequest = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  estimatedCompletionDate: Date | null;
  service: {
    id: string;
    name: string;
    category: ServiceCategory;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
};

// Sélections optimisées
const DashboardServiceSelect: Prisma.ConsularServiceSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  isActive: true,
  isFree: true,
  price: true,
  currency: true,
  requiresAppointment: true,
  organization: {
    select: {
      id: true,
      name: true,
      type: true,
      countries: true,
    },
  },
};

const DashboardServiceRequestSelect = {
  select: {
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    estimatedCompletionDate: true,
    service: {
      select: {
        id: true,
        name: true,
        category: true,
      },
    },
    organization: {
      select: {
        id: true,
        name: true,
        type: true,
      },
    },
  },
} as const;

export const servicesRouter = createTRPCRouter({
  // Nouvelle procédure optimisée pour les services disponibles avec pagination et filtres
  getAvailableServicesDashboard: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          category: z.nativeEnum(ServiceCategory).optional(),
          isActive: z.boolean().optional(),
          search: z.string().optional(),
          organizationId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const category = input?.category;
      const isActive = input?.isActive;
      const search = input?.search;
      const organizationId = input?.organizationId;

      try {
        const where = {
          ...(category
            ? { category }
            : { category: { notIn: ['REGISTRATION' as ServiceCategory] } }),
          ...(typeof isActive === 'boolean' && { isActive }),
          ...(organizationId && { organizationId }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }),
        };

        const services = await ctx.db.consularService.findMany({
          where: {
            ...where,
            organization: {
              countries: {
                some: {
                  code: ctx.user.countryCode!,
                },
              },
            },
          },
          select: DashboardServiceSelect,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { name: 'asc' },
        });

        let nextCursor: string | undefined = undefined;
        if (services.length > limit) {
          const nextItem = services.pop();
          nextCursor = nextItem!.id;
        }

        const totalCount = await ctx.db.consularService.count({ where });

        return {
          services,
          nextCursor,
          totalCount,
          hasMore: services.length === limit + 1,
        };
      } catch (error) {
        console.error('Error fetching dashboard services:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des services',
        });
      }
    }),

  // Nouvelle procédure optimisée pour les demandes utilisateur avec pagination
  getUserServiceRequestsDashboard: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          status: z.array(z.nativeEnum(RequestStatus)).optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const status = input?.status;
      const search = input?.search;

      try {
        const where = {
          submittedById: ctx.user.id,
          ...(status && status.length > 0 && { status: { in: status } }),
          ...(search && {
            OR: [
              { service: { name: { contains: search, mode: 'insensitive' as const } } },
              { id: { contains: search, mode: 'insensitive' as const } },
            ],
          }),
        };

        const requests = await ctx.db.serviceRequest.findMany({
          where,
          ...DashboardServiceRequestSelect,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        if (requests.length > limit) {
          const nextItem = requests.pop();
          nextCursor = nextItem!.id;
        }

        const totalCount = await ctx.db.serviceRequest.count({ where });

        // Calculer les statistiques
        const stats = await Promise.all([
          ctx.db.serviceRequest.count({
            where: {
              submittedById: ctx.user.id,
              status: {
                in: [
                  'DRAFT',
                  'SUBMITTED',
                  'EDITED',
                  'PENDING',
                  'PENDING_COMPLETION',
                  'VALIDATED',
                  'CARD_IN_PRODUCTION',
                ],
              },
            },
          }),
          ctx.db.serviceRequest.count({
            where: {
              submittedById: ctx.user.id,
              status: { in: ['COMPLETED', 'READY_FOR_PICKUP'] },
            },
          }),
          ctx.db.serviceRequest.count({
            where: {
              submittedById: ctx.user.id,
              status: { in: ['PENDING_COMPLETION', 'READY_FOR_PICKUP'] },
            },
          }),
        ]);

        return {
          requests: requests as DashboardServiceRequest[],
          nextCursor,
          totalCount,
          hasMore: requests.length === limit + 1,
          stats: {
            ongoing: stats[0],
            completed: stats[1],
            needsAttention: stats[2],
            total: totalCount,
          },
        };
      } catch (error) {
        console.error('Error fetching dashboard service requests:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des demandes',
        });
      }
    }),

  // Récupérer les services consulaires disponibles (ancienne version)
  getAvailable: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user.countryCode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            "Vous n'avez pas de pays associé à votre compte, veuillez compléter votre profil consulaire",
        });
      }
      const countryCode = ctx.user.countryCode as CountryCode;
      const services = await getAvailableConsularServices(countryCode);
      return services;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des services',
      });
    }
  }),

  // Récupérer les demandes de service de l'utilisateur
  getUserRequests: protectedProcedure.query(async () => {
    try {
      const requests = await getUserServiceRequests();
      return requests;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des demandes',
      });
    }
  }),

  // Récupérer une demande de service par ID
  getRequestById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const request = await getServiceRequestDetails(input.id);
        return request;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la récupération de la demande',
        });
      }
    }),

  // Récupérer les détails d'un service consulaire
  getServiceDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const service = await getConsularServiceDetails(input.id);
        return service;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la récupération du service',
        });
      }
    }),

  // Récupérer un service consulaire avec ses étapes
  getService: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const service = await getConsularService(input.id);
        return service;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la récupération du service',
        });
      }
    }),

  // Soumettre une demande de service
  submitRequest: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        requestedForId: z.string(),
        organizationId: z.string(),
        countryCode: z.string(),
        serviceCategory: z.string(),
        formData: z.record(z.any()).optional(),
        requiredDocuments: z.array(z.object({ id: z.string() })).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const request = await submitServiceRequest({
          ...input,
          submittedById: ctx.user.id,
          status: 'SUBMITTED',
          formData: input.formData as Prisma.JsonObject,
          requiredDocuments: input.requiredDocuments?.map((doc) => ({ id: doc.id })),
        });

        return request;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la soumission de la demande',
        });
      }
    }),
});

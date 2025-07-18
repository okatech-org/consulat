import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { OrganizationStatus, OrganizationType } from '@prisma/client';
import { organizationSchema, updateOrganizationSchema } from '@/schemas/organization';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { env } from '@/env';
import { sendAdminWelcomeEmail } from '@/lib/services/notifications/providers/emails';

export const organizationsRouter = createTRPCRouter({
  /**
   * Récupérer les infos d'une organisation par ID avec des select spécifiques dynamiques
   */
  getByIdWithSelect: protectedProcedure
    .input(z.object({ id: z.string(), select: z.array(z.string()).optional() }))
    .query(async ({ ctx, input }) => {
      const { id, select } = input;
      const organization = await ctx.db.organization.findUnique({
        where: { id },
        select: select
          ? select.reduce(
              (acc, field) => {
                acc[field] = true;
                return acc;
              },
              {} as Record<string, boolean>,
            )
          : undefined,
      });

      return organization;
    }),

  /**
   * Récupérer la liste de toutes les organisations
   */
  getList: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          type: z.array(z.nativeEnum(OrganizationType)).optional(),
          status: z.array(z.nativeEnum(OrganizationStatus)).optional(),
          countryId: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.session?.user?.roles?.some((role) =>
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès refusé. Permissions insuffisantes.',
        });
      }

      const { search, type, status, countryId, page = 1, limit = 10 } = input || {};
      const skip = (page - 1) * limit;

      // Filtrer par organisation pour les non-super-admins
      const currentUser = ctx.session.user;
      let organizationFilter = {};

      if (!currentUser.roles?.includes('SUPER_ADMIN')) {
        if (currentUser.assignedOrganizationId) {
          organizationFilter = {
            id: currentUser.assignedOrganizationId ?? currentUser.organizationId,
          };
        } else {
          // Pas d'organisation assignée, retourner vide
          return {
            items: [],
            total: 0,
            pages: 0,
            currentPage: page,
          };
        }
      }

      const where = {
        ...organizationFilter,
        ...(search && {
          name: { contains: search, mode: 'insensitive' as const },
        }),
        ...(type && type.length > 0 && { type: { in: type } }),
        ...(status && status.length > 0 && { status: { in: status } }),
        ...(countryId && {
          countries: { some: { id: countryId } },
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.organization.findMany({
          where,
          skip,
          take: limit,
          include: {
            countries: true,
            _count: {
              select: {
                services: true,
                agents: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.organization.count({ where }),
      ]);

      return {
        items,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * Récupérer une organisation par son ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.session?.user?.roles?.some((role) =>
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès refusé. Permissions insuffisantes.',
        });
      }

      const organization = await ctx.db.organization.findUnique({
        where: { id: input.id },
        include: {
          countries: true,
          services: true,
          agents: {
            include: {
              linkedCountries: true,
              assignedServices: true,
            },
          },
          _count: {
            select: {
              services: true,
              agents: true,
            },
          },
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organisation non trouvée.',
        });
      }

      return {
        ...organization,
        metadata: organization.metadata
          ? JSON.parse(organization.metadata as string)
          : null,
      };
    }),

  /**
   * Créer une nouvelle organisation
   */
  create: protectedProcedure
    .input(organizationSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!ctx.session?.user?.roles?.includes('SUPER_ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les super administrateurs peuvent créer des organisations.',
        });
      }

      // Créer l'organisation
      const organization = await ctx.db.organization.create({
        data: {
          name: input.name,
          type: input.type,
          status: input.status,
          countries: {
            connect: input.countryIds.map((id) => ({ id })),
          },
        },
        include: {
          countries: true,
          _count: {
            select: {
              services: true,
              agents: true,
            },
          },
        },
      });

      // Créer l'utilisateur admin si email fourni
      if (input.adminEmail && input.countryIds[0]) {
        await ctx.db.user.create({
          data: {
            email: input.adminEmail,
            roles: ['ADMIN'],
            role: 'ADMIN',
            assignedOrganizationId: organization.id,
            countryCode: input.countryIds[0],
          },
        });

        // Envoyer l'email de bienvenue
        await sendAdminWelcomeEmail({
          adminEmail: input.adminEmail,
          adminName: `@${input.adminEmail.split('@')[0]}`,
          organizationName: input.name,
          dashboardUrl: `${env.NEXT_PUBLIC_URL}/${ROUTES.dashboard.base}`,
          organizationLogo: env.NEXT_PUBLIC_ORG_LOGO,
        });
      }

      // Revalidate paths
      revalidatePath(ROUTES.sa.organizations);

      return organization;
    }),

  /**
   * Mettre à jour une organisation
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateOrganizationSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.session?.user?.roles?.some((role) => ['SUPER_ADMIN', 'ADMIN'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes pour modifier cette organisation.',
        });
      }

      const currentUser = ctx.session.user;

      // Vérifier l'accès à cette organisation pour les admins
      if (
        !currentUser.roles?.includes('SUPER_ADMIN') &&
        currentUser.organizationId !== input.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous ne pouvez modifier que votre organisation.',
        });
      }

      const { countryIds, ...rest } = input.data;

      const organization = await ctx.db.organization.update({
        where: { id: input.id },
        data: {
          ...rest,
          ...(countryIds && {
            countries: {
              set: countryIds.map((id) => ({ id })),
            },
          }),
        },
        include: {
          countries: true,
          _count: {
            select: {
              services: true,
              agents: true,
            },
          },
        },
      });

      // Revalidate paths
      revalidatePath(ROUTES.sa.organizations);

      return organization;
    }),

  /**
   * Mettre à jour le statut d'une organisation
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(OrganizationStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.session?.user?.roles?.some((role) => ['SUPER_ADMIN', 'ADMIN'].includes(role))
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes pour modifier le statut.',
        });
      }

      const currentUser = ctx.session.user;

      // Vérifier l'accès pour les admins
      if (
        !currentUser.roles?.includes('SUPER_ADMIN') &&
        currentUser.assignedOrganizationId !== input.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous ne pouvez modifier que votre organisation.',
        });
      }

      const organization = await ctx.db.organization.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          countries: true,
          _count: {
            select: {
              services: true,
              agents: true,
            },
          },
        },
      });

      // Revalidate paths
      revalidatePath(ROUTES.sa.organizations);

      return organization;
    }),

  /**
   * Mettre à jour les paramètres d'une organisation
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          logo: z.string().optional(),
          type: z.nativeEnum(OrganizationType).optional(),
          status: z.nativeEnum(OrganizationStatus).optional(),
          countryIds: z.array(z.string()).optional(),
          metadata: z.record(z.any()).optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.session?.user?.roles?.some((role) =>
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes pour modifier les paramètres.',
        });
      }

      const currentUser = ctx.session.user;

      // Vérifier l'accès pour les non-super-admins
      if (
        !currentUser.roles?.includes('SUPER_ADMIN') &&
        currentUser.assignedOrganizationId !== input.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous ne pouvez modifier que votre organisation.',
        });
      }

      const { countryIds, metadata, ...rest } = input.data;

      const organization = await ctx.db.organization.update({
        where: { id: input.id },
        data: {
          ...rest,
          ...(metadata && { metadata: JSON.stringify(metadata) }),
          ...(countryIds && {
            countries: {
              set: countryIds.map((id) => ({ id })),
            },
          }),
        },
        include: {
          countries: true,
          services: true,
          agents: true,
          _count: {
            select: {
              services: true,
              agents: true,
            },
          },
        },
      });

      // Revalidate paths
      revalidatePath(ROUTES.dashboard.settings);

      return {
        ...organization,
        metadata: organization.metadata
          ? JSON.parse(organization.metadata as string)
          : null,
      };
    }),

  /**
   * Supprimer une organisation
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!ctx.session?.user?.roles?.includes('SUPER_ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les super administrateurs peuvent supprimer des organisations.',
        });
      }

      // Vérifier si l'organisation existe et a des dépendances
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              services: true,
              agents: true,
            },
          },
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organisation non trouvée.',
        });
      }

      // Vérifier s'il y a des dépendances
      if (organization._count.services > 0 || organization._count.agents > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Impossible de supprimer cette organisation car elle contient des services ou des agents.',
        });
      }

      await ctx.db.organization.delete({
        where: { id: input.id },
      });

      // Revalidate paths
      revalidatePath(ROUTES.sa.organizations);

      return { success: true };
    }),

  /**
   * Obtenir les statistiques des organisations
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Vérifier les permissions
    if (
      !ctx.session?.user?.roles?.some((role) => ['SUPER_ADMIN', 'ADMIN'].includes(role))
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Accès refusé. Permissions insuffisantes.',
      });
    }

    const currentUser = ctx.session.user;
    let where = {};

    // Filtrer par organisation pour les non-super-admins
    if (!currentUser.roles?.includes('SUPER_ADMIN')) {
      if (currentUser.assignedOrganizationId) {
        where = { id: currentUser.assignedOrganizationId };
      } else {
        return {
          totalOrganizations: 0,
          activeOrganizations: 0,
          inactiveOrganizations: 0,
          consulateOrganizations: 0,
          embassyOrganizations: 0,
        };
      }
    }

    const [
      totalOrganizations,
      activeOrganizations,
      inactiveOrganizations,
      consulateOrganizations,
      embassyOrganizations,
    ] = await Promise.all([
      ctx.db.organization.count({ where }),
      ctx.db.organization.count({ where: { ...where, status: 'ACTIVE' } }),
      ctx.db.organization.count({ where: { ...where, status: 'INACTIVE' } }),
      ctx.db.organization.count({ where: { ...where, type: 'CONSULATE' } }),
      ctx.db.organization.count({ where: { ...where, type: 'EMBASSY' } }),
    ]);

    return {
      totalOrganizations,
      activeOrganizations,
      inactiveOrganizations,
      consulateOrganizations,
      embassyOrganizations,
    };
  }),

  /**
   * Obtenir une organisation par pays
   */
  getByCountry: protectedProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.organization.findFirst({
        where: {
          countries: {
            some: {
              code: input.countryCode,
            },
          },
        },
        include: {
          countries: true,
        },
      });
    }),

  /**
   * Obtenir les informations d'une organisation pour un pays spécifique
   */
  getCountryInfos: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        countryCode: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.organization.findUnique({
        where: { id: input.organizationId },
      });

      if (!data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organisation non trouvée.',
        });
      }

      const { metadata, ...rest } = data;

      const formattedMetadata = JSON.parse(
        typeof metadata === 'string' ? metadata : '{}',
      ) as Record<string, Record<string, unknown>>;

      const countrySettings = formattedMetadata[input.countryCode] || {};

      return {
        ...rest,
        settings: countrySettings,
      };
    }),
});

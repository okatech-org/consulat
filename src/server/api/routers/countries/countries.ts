import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { countrySchema } from '@/schemas/country';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

export const countriesRouter = createTRPCRouter({
  /**
   * Récupérer la liste de tous les pays avec leurs statistiques
   */
  getList: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          status: z.array(z.enum(['ACTIVE', 'INACTIVE'])).optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.user?.roles?.some((role) =>
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès refusé. Permissions insuffisantes.',
        });
      }

      const { search, status, page = 1, limit = 10 } = input || {};
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(status && status.length > 0 && { status: { in: status } }),
      };

      const [items, total] = await Promise.all([
        ctx.db.country.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            metadata: true,
            _count: {
              select: {
                organizations: true,
                users: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        }),
        ctx.db.country.count({ where }),
      ]);

      return {
        items: items.map((item) => ({
          ...item,
          metadata: item.metadata,
        })),
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * Récupérer un pays par son ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (
        !ctx.user?.roles?.some((role) =>
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role),
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès refusé. Permissions insuffisantes.',
        });
      }

      const country = await ctx.db.country.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              organizations: true,
              users: true,
            },
          },
        },
      });

      if (!country) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pays non trouvé.',
        });
      }

      return {
        ...country,
        metadata: country.metadata,
      };
    }),

  /**
   * Récupérer les pays actifs (pour les formulaires)
   */
  getActive: publicProcedure
    .input(z.object({ organizationId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = {
        status: 'ACTIVE' as const,
        ...(input?.organizationId && {
          organizations: { some: { id: input.organizationId } },
        }),
      };

      return ctx.db.country.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    }),

  /**
   * Créer un nouveau pays
   */
  create: protectedProcedure
    .input(countrySchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!ctx.user?.roles?.includes('SUPER_ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les super administrateurs peuvent créer des pays.',
        });
      }

      // Vérifier si le code pays existe déjà
      const existingCountry = await ctx.db.country.findUnique({
        where: { code: input.code.toUpperCase() },
      });

      if (existingCountry) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un pays avec ce code existe déjà.',
        });
      }

      const country = await ctx.db.country.create({
        data: {
          name: input.name,
          code: input.code.toUpperCase(),
          status: input.status || 'ACTIVE',
          flag: input.flag ?? undefined,
          ...(input.metadata && { metadata: JSON.stringify(input.metadata) }),
        },
        include: {
          _count: {
            select: {
              organizations: true,
              users: true,
            },
          },
        },
      });

      // Revalidate paths
      revalidatePath(ROUTES.sa.countries);

      return {
        ...country,
        metadata: country.metadata,
      };
    }),

  /**
   * Mettre à jour un pays
   */
  update: protectedProcedure
    .input(countrySchema.required({ id: true }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!ctx.user?.roles?.includes('SUPER_ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les super administrateurs peuvent modifier des pays.',
        });
      }

      const { id, metadata, ...rest } = input;

      // Vérifier si le pays existe
      const existingCountry = await ctx.db.country.findUnique({
        where: { id: id ?? undefined },
      });

      if (!existingCountry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pays non trouvé.',
        });
      }

      const country = await ctx.db.country.update({
        where: { id: id ?? undefined },
        data: {
          ...rest,
          flag: rest.flag ?? undefined,
          ...(metadata && { metadata: JSON.stringify(metadata) }),
        },
        include: {
          _count: {
            select: {
              organizations: true,
              users: true,
            },
          },
        },
      });

      // Revalidate paths
      revalidatePath(ROUTES.sa.countries);

      return {
        ...country,
        metadata: country.metadata,
      };
    }),

  /**
   * Supprimer un pays
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!ctx.user?.roles?.includes('SUPER_ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les super administrateurs peuvent supprimer des pays.',
        });
      }

      // Vérifier si le pays existe
      const existingCountry = await ctx.db.country.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              organizations: true,
              users: true,
            },
          },
        },
      });

      if (!existingCountry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pays non trouvé.',
        });
      }

      // Vérifier s'il y a des dépendances
      if (existingCountry._count.organizations > 0 || existingCountry._count.users > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Impossible de supprimer ce pays car il est utilisé par des organisations ou des utilisateurs.',
        });
      }

      await ctx.db.country.delete({
        where: { id: input.id },
      });

      // Revalidate paths
      revalidatePath(ROUTES.sa.countries);

      return { success: true };
    }),

  /**
   * Obtenir les statistiques des pays
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Vérifier les permissions
    if (
      !ctx.user?.roles?.some((role) => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role))
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Accès refusé. Permissions insuffisantes.',
      });
    }

    const [totalCountries, activeCountries, inactiveCountries] = await Promise.all([
      ctx.db.country.count(),
      ctx.db.country.count({ where: { status: 'ACTIVE' } }),
      ctx.db.country.count({ where: { status: 'INACTIVE' } }),
    ]);

    return {
      totalCountries,
      activeCountries,
      inactiveCountries,
    };
  }),
});

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import type { UserListItem, UserDetails } from './types';

export const userRouter = createTRPCRouter({
  getDocumentsCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.userDocument.count({
      where: {
        userId: ctx.user.id,
      },
    });
    return count;
  }),

  getActiveRequestsCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.serviceRequest.count({
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
    });
    return count;
  }),

  // Admin procedures
  getList: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        roles: z.array(z.nativeEnum(UserRole)).optional(),
        countryCode: z.array(z.string()).optional(),
        organizationId: z.array(z.string()).optional(),
        hasProfile: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }),
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

      const {
        page,
        limit,
        search,
        roles,
        countryCode,
        organizationId,
        hasProfile,
        sortBy = 'createdAt',
        sortOrder,
      } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(roles && roles.length > 0 && { roles: { hasSome: roles } }),
        ...(countryCode &&
          countryCode.length > 0 && { countryCode: { in: countryCode } }),
        ...(organizationId &&
          organizationId.length > 0 && {
            OR: [
              { assignedOrganizationId: { in: organizationId } },
              { organizationId: { in: organizationId } },
            ],
          }),
        ...(hasProfile !== undefined && {
          profileId: hasProfile ? { not: null } : null,
        }),
      };

      const [items, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            roles: true,
            createdAt: true,
            country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            assignedOrganization: {
              select: {
                id: true,
                name: true,
              },
            },
            profile: {
              select: {
                id: true,
                status: true,
                cardNumber: true,
              },
            },
            _count: {
              select: {
                submittedRequests: true,
                assignedRequests: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        items: items.map((item) => ({
          ...item,
          role: item.roles[0] || 'USER',
        })) as UserListItem[],
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

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

      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          emailVerified: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          assignedOrganization: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
          managedOrganization: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
              cardNumber: true,
              cardIssuedAt: true,
              cardExpiresAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          submittedRequests: {
            select: {
              id: true,
              status: true,
              serviceCategory: true,
              priority: true,
              createdAt: true,
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          assignedRequests: {
            select: {
              id: true,
              status: true,
              serviceCategory: true,
              priority: true,
              createdAt: true,
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: {
              submittedRequests: true,
              assignedRequests: true,
              managedAgents: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      return {
        ...user,
        role: user.roles[0] || 'USER',
      } as UserDetails;
    }),
});

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { hasPermission } from '@/lib/permissions/utils';
import {
  createIntelligenceNoteSchema,
  updateIntelligenceNoteSchema,
  deleteIntelligenceNoteSchema,
  getIntelligenceNotesSchema,
  getIntelligenceNoteHistorySchema,
  getProfilesWithIntelligenceSchema,
  getIntelligenceDashboardStatsSchema,
  getIntelligenceMapDataSchema,
} from '@/schemas/intelligence';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@prisma/client';

export const intelligenceRouter = createTRPCRouter({
  // Dashboard stats pour INTEL_AGENT
  getDashboardStats: protectedProcedure
    .input(getIntelligenceDashboardStatsSchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      const now = new Date();
      const periodStart = new Date();

      switch (input.period) {
        case 'day':
          periodStart.setDate(now.getDate() - 1);
          break;
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
      }

      const [
        totalProfiles,
        profilesWithNotes,
        notesThisPeriod,
        notesByType,
        recentNotes,
      ] = await Promise.all([
        ctx.db.profile.count(),
        ctx.db.profile.count({
          where: {
            intelligenceNotes: {
              some: {},
            },
          },
        }),
        ctx.db.intelligenceNote.count({
          where: {
            createdAt: {
              gte: periodStart,
            },
          },
        }),
        ctx.db.intelligenceNote.groupBy({
          by: ['type'],
          _count: {
            type: true,
          },
        }),
        ctx.db.intelligenceNote.findMany({
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                name: true,
              },
            },
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
      ]);

      return {
        totalProfiles,
        profilesWithNotes,
        notesThisPeriod,
        notesByType: notesByType.reduce(
          (acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          },
          {} as Record<IntelligenceNoteType, number>,
        ),
        recentNotes,
      };
    }),

  // Carte des profils avec données de renseignement
  getProfilesMap: protectedProcedure
    .input(getIntelligenceMapDataSchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      const where = {
        ...(input.filters?.hasNotes !== undefined && {
          intelligenceNotes: input.filters.hasNotes ? { some: {} } : { none: {} },
        }),
        ...(input.filters?.priority && {
          intelligenceNotes: {
            some: {
              priority: input.filters.priority,
            },
          },
        }),
        ...(input.filters?.type && {
          intelligenceNotes: {
            some: {
              type: input.filters.type,
            },
          },
        }),
      };

      const profiles = await ctx.db.profile.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthCountry: true,
          address: true,
          intelligenceNotes: {
            select: {
              type: true,
              priority: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Dernière note pour la priorité
          },
        },
      });

      return profiles;
    }),

  getProfiles: protectedProcedure
    .input(getProfilesWithIntelligenceSchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      const where = {
        ...(input.filters?.search && {
          OR: [
            {
              firstName: { contains: input.filters.search, mode: 'insensitive' as const },
            },
            {
              lastName: { contains: input.filters.search, mode: 'insensitive' as const },
            },
          ],
        }),
        ...(input.filters?.nationality && { nationality: input.filters.nationality }),
        ...(input.filters?.birthCountry && { birthCountry: input.filters.birthCountry }),
        ...(input.filters?.hasNotes !== undefined && {
          intelligenceNotes: input.filters.hasNotes ? { some: {} } : { none: {} },
        }),
      };

      const [profiles, total] = await Promise.all([
        ctx.db.profile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            intelligenceNotes: {
              select: {
                id: true,
                type: true,
                priority: true,
                title: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 3, // Limiter à 3 notes récentes
            },
            _count: {
              select: {
                intelligenceNotes: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.profile.count({ where }),
      ]);

      return {
        profiles,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  getProfileDetails: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      const profile = await ctx.db.profile.findUnique({
        where: { id: input.profileId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
          address: true,
          identityPicture: true,
          passport: true,
          birthCertificate: true,
          residencePermit: true,
          addressProof: true,
          residentContact: true,
          homeLandContact: true,
          parentAuthorities: {
            include: {
              parentUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          intelligenceNotes: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!profile) {
        throw new Error('Profil non trouvé');
      }

      return profile;
    }),

  getIntelligenceNotes: protectedProcedure
    .input(getIntelligenceNotesSchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'intelligenceNotes', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      const notes = await ctx.db.intelligenceNote.findMany({
        where: {
          profileId: input.profileId,
          ...(input.filters && {
            ...(input.filters.type && { type: input.filters.type }),
            ...(input.filters.priority && { priority: input.filters.priority }),
            ...(input.filters.authorId && { authorId: input.filters.authorId }),
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              history: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return notes;
    }),

  createNote: protectedProcedure
    .input(createIntelligenceNoteSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'intelligenceNotes', 'create')) {
        throw new Error('Permissions insuffisantes');
      }

      // Créer la note
      const note = await ctx.db.intelligenceNote.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Créer l'entrée d'historique
      await ctx.db.intelligenceNoteHistory.create({
        data: {
          intelligenceNoteId: note.id,
          action: 'created',
          newContent: note.content,
          changedById: ctx.session.user.id,
        },
      });

      return note;
    }),

  updateNote: protectedProcedure
    .input(updateIntelligenceNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Récupérer la note existante
      const existingNote = await ctx.db.intelligenceNote.findUnique({
        where: { id },
      });

      if (!existingNote) {
        throw new Error('Note de renseignement non trouvée');
      }

      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'intelligenceNotes', 'update', existingNote)) {
        throw new Error('Permissions insuffisantes');
      }

      // Mettre à jour la note
      const updatedNote = await ctx.db.intelligenceNote.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Créer l'entrée d'historique
      await ctx.db.intelligenceNoteHistory.create({
        data: {
          intelligenceNoteId: id,
          action: 'updated',
          previousContent: existingNote.content,
          newContent: updatedNote.content,
          changedById: ctx.session.user.id,
        },
      });

      return updatedNote;
    }),

  deleteNote: protectedProcedure
    .input(deleteIntelligenceNoteSchema)
    .mutation(async ({ ctx, input }) => {
      // Récupérer la note existante
      const existingNote = await ctx.db.intelligenceNote.findUnique({
        where: { id: input.noteId },
      });

      if (!existingNote) {
        throw new Error('Note de renseignement non trouvée');
      }

      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'intelligenceNotes', 'delete', existingNote)) {
        throw new Error('Permissions insuffisantes');
      }

      // Créer l'entrée d'historique avant suppression
      await ctx.db.intelligenceNoteHistory.create({
        data: {
          intelligenceNoteId: input.noteId,
          action: 'deleted',
          previousContent: existingNote.content,
          changedById: ctx.session.user.id,
        },
      });

      // Supprimer la note
      await ctx.db.intelligenceNote.delete({
        where: { id: input.noteId },
      });

      return { success: true };
    }),

  getIntelligenceNoteHistory: protectedProcedure
    .input(getIntelligenceNoteHistorySchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'intelligenceNotes', 'viewHistory')) {
        throw new Error('Permissions insuffisantes');
      }

      const history = await ctx.db.intelligenceNoteHistory.findMany({
        where: {
          intelligenceNoteId: input.noteId,
        },
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          changedAt: 'desc',
        },
      });

      return history;
    }),

  // Endpoints pour les types et priorités
  getIntelligenceNoteTypes: protectedProcedure.query(() => {
    return Object.values(IntelligenceNoteType);
  }),

  getIntelligenceNotePriorities: protectedProcedure.query(() => {
    return Object.values(IntelligenceNotePriority);
  }),
});

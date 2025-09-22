'use server';

import { db } from '@/server/db';
import { tryCatch } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
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
  type CreateIntelligenceNoteInput,
  type UpdateIntelligenceNoteInput,
  type DeleteIntelligenceNoteInput,
  type GetIntelligenceNotesInput,
  type GetIntelligenceNoteHistoryInput,
  type GetProfilesWithIntelligenceInput,
  type GetIntelligenceDashboardStatsInput,
  type GetIntelligenceMapDataInput,
} from '@/schemas/intelligence';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@prisma/client';

export async function createIntelligenceNote(data: CreateIntelligenceNoteInput) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'intelligenceNotes', 'create')) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = createIntelligenceNoteSchema.parse(data);

    // Créer la note
    const note = await db.intelligenceNote.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
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
    await db.intelligenceNoteHistory.create({
      data: {
        intelligenceNoteId: note.id,
        action: 'created',
        newContent: note.content,
        changedById: session.user.id,
      },
    });

    return note;
  });

  if (error) {
    console.error('Erreur lors de la création de la note de renseignement:', error);
    throw error;
  }

  return result;
}

export async function updateIntelligenceNote(
  id: string,
  data: UpdateIntelligenceNoteInput,
) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Récupérer la note existante
    const existingNote = await db.intelligenceNote.findUnique({
      where: { id },
    });

    if (!existingNote) {
      throw new Error('Note de renseignement non trouvée');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'intelligenceNotes', 'update', existingNote)) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = updateIntelligenceNoteSchema.parse({ ...data, id });

    // Mettre à jour la note
    const updatedNote = await db.intelligenceNote.update({
      where: { id },
      data: validatedData,
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
    await db.intelligenceNoteHistory.create({
      data: {
        intelligenceNoteId: id,
        action: 'updated',
        previousContent: existingNote.content,
        newContent: updatedNote.content,
        changedById: session.user.id,
      },
    });

    return updatedNote;
  });

  if (error) {
    console.error('Erreur lors de la mise à jour de la note de renseignement:', error);
    throw error;
  }

  return result;
}

export async function deleteIntelligenceNote(data: DeleteIntelligenceNoteInput) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Récupérer la note existante
    const existingNote = await db.intelligenceNote.findUnique({
      where: { id: data.noteId },
    });

    if (!existingNote) {
      throw new Error('Note de renseignement non trouvée');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'intelligenceNotes', 'delete', existingNote)) {
      throw new Error('Permissions insuffisantes');
    }

    // Créer l'entrée d'historique avant suppression
    await db.intelligenceNoteHistory.create({
      data: {
        intelligenceNoteId: data.noteId,
        action: 'deleted',
        previousContent: existingNote.content,
        changedById: session.user.id,
      },
    });

    // Supprimer la note
    await db.intelligenceNote.delete({
      where: { id: data.noteId },
    });

    return { success: true };
  });

  if (error) {
    console.error('Erreur lors de la suppression de la note de renseignement:', error);
    throw error;
  }

  return result;
}

export async function getIntelligenceNotes(data: GetIntelligenceNotesInput) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'intelligenceNotes', 'view')) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = getIntelligenceNotesSchema.parse(data);

    const where = {
      ...(validatedData.profileId ? { profileId: validatedData.profileId } : {}),
      ...(validatedData.filters && {
        ...(validatedData.filters.type && { type: validatedData.filters.type }),
        ...(validatedData.filters.priority && {
          priority: validatedData.filters.priority,
        }),
        ...(validatedData.filters.authorId && {
          authorId: validatedData.filters.authorId,
        }),
        ...(validatedData.filters.search && {
          OR: [
            {
              title: {
                contains: validatedData.filters.search,
                mode: 'insensitive' as const,
              },
            },
            {
              content: {
                contains: validatedData.filters.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
      }),
    } as const;

    const notes = await db.intelligenceNote.findMany({
      where,
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
  });

  if (error) {
    console.error('Erreur lors de la récupération des notes de renseignement:', error);
    throw error;
  }

  return result;
}

export async function getIntelligenceNoteHistory(data: GetIntelligenceNoteHistoryInput) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'intelligenceNotes', 'viewHistory')) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = getIntelligenceNoteHistorySchema.parse(data);

    const history = await db.intelligenceNoteHistory.findMany({
      where: {
        intelligenceNoteId: validatedData.noteId,
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
  });

  if (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    throw error;
  }

  return result;
}

export async function getProfilesWithIntelligence(
  data: GetProfilesWithIntelligenceInput,
) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'profiles', 'view')) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = getProfilesWithIntelligenceSchema.parse(data);

    const where = {
      ...(validatedData.filters?.search && {
        OR: [
          {
            firstName: {
              contains: validatedData.filters.search,
              mode: 'insensitive' as const,
            },
          },
          {
            lastName: {
              contains: validatedData.filters.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...(validatedData.filters?.nationality && {
        nationality: validatedData.filters.nationality,
      }),
      ...(validatedData.filters?.birthCountry && {
        birthCountry: validatedData.filters.birthCountry,
      }),
      ...(validatedData.filters?.hasNotes !== undefined && {
        intelligenceNotes: validatedData.filters.hasNotes ? { some: {} } : { none: {} },
      }),
    };

    const [profiles, total] = await Promise.all([
      db.profile.findMany({
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
        skip: (validatedData.page - 1) * validatedData.limit,
        take: validatedData.limit,
      }),
      db.profile.count({ where }),
    ]);

    return {
      profiles,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total,
        totalPages: Math.ceil(total / validatedData.limit),
      },
    };
  });

  if (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    throw error;
  }

  return result;
}

export async function getIntelligenceDashboardStats(
  data: GetIntelligenceDashboardStatsInput,
) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'profiles', 'view')) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = getIntelligenceDashboardStatsSchema.parse(data);

    const now = new Date();
    const periodStart = new Date();

    switch (validatedData.period) {
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

    const [totalProfiles, profilesWithNotes, notesThisPeriod, notesByType, recentNotes] =
      await Promise.all([
        db.profile.count(),
        db.profile.count({
          where: {
            intelligenceNotes: {
              some: {},
            },
          },
        }),
        db.intelligenceNote.count({
          where: {
            createdAt: {
              gte: periodStart,
            },
          },
        }),
        db.intelligenceNote.groupBy({
          by: ['type'],
          _count: {
            type: true,
          },
        }),
        db.intelligenceNote.findMany({
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
  });

  if (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }

  return result;
}

export async function getIntelligenceMapData(data: GetIntelligenceMapDataInput) {
  const { error, data: result } = await tryCatch(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error('Non authentifié');
    }

    // Vérifier les permissions
    if (!hasPermission(session.user, 'profiles', 'view')) {
      throw new Error('Permissions insuffisantes');
    }

    // Valider les données
    const validatedData = getIntelligenceMapDataSchema.parse(data);

    // Debug: récupérer TOUS les profils sans filtre pour voir ce qu'on a
    const where = {}; // Pas de filtre pour l'instant

    const profiles = await db.profile.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthCountry: true,
        nationality: true,
        address: {
          select: {
            id: true,
            firstLine: true,
            secondLine: true,
            city: true,
            zipCode: true,
            country: true,
          },
        },
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

    // Debug simplifié
    const profilesWithRealAddress = profiles.filter(
      (p) =>
        p.address &&
        p.address.city &&
        p.address.city.trim() !== '' &&
        p.address.country &&
        p.address.country.trim() !== '',
    );
    console.log(
      `📊 Action Intelligence: ${profiles.length} profils total → ${profilesWithRealAddress.length} avec adresses valides`,
    );

    return profiles;
  });

  if (error) {
    console.error('Erreur lors de la récupération des données de la carte:', error);
    throw error;
  }

  return result;
}

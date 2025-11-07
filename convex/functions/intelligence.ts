import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import {
  intelligenceNoteTypeValidator,
  intelligenceNotePriorityValidator,
} from '../lib/validators';
import type { Id } from '../_generated/dataModel';

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new intelligence note
 */
export const createNote = mutation({
  args: {
    profileId: v.id('profiles'),
    type: intelligenceNoteTypeValidator,
    priority: intelligenceNotePriorityValidator,
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    authorId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create the intelligence note
    const noteId = await ctx.db.insert('intelligenceNotes', {
      profileId: args.profileId,
      authorId: args.authorId,
      type: args.type,
      priority: args.priority,
      title: args.title,
      content: args.content,
      tags: args.tags,
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    // Create history entry
    await ctx.db.insert('intelligenceNoteHistory', {
      intelligenceNoteId: noteId,
      action: 'created',
      newContent: args.content,
      changedById: args.authorId,
      changedAt: now,
    });

    return noteId;
  },
});

/**
 * Update an existing intelligence note
 */
export const updateNote = mutation({
  args: {
    noteId: v.id('intelligenceNotes'),
    type: v.optional(intelligenceNoteTypeValidator),
    priority: v.optional(intelligenceNotePriorityValidator),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    changedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { noteId, changedById, ...updates } = args;

    // Get the existing note
    const existingNote = await ctx.db.get(noteId);
    if (!existingNote) {
      throw new Error('Intelligence note not found');
    }

    const now = Date.now();

    // Update the note
    await ctx.db.patch(noteId, {
      ...updates,
      updatedAt: now,
    });

    // Create history entry
    await ctx.db.insert('intelligenceNoteHistory', {
      intelligenceNoteId: noteId,
      action: 'updated',
      previousContent: existingNote.content,
      newContent: updates.content || existingNote.content,
      changedById: changedById,
      changedAt: now,
    });

    return noteId;
  },
});

/**
 * Delete an intelligence note
 */
export const deleteNote = mutation({
  args: {
    noteId: v.id('intelligenceNotes'),
    deletedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const existingNote = await ctx.db.get(args.noteId);
    if (!existingNote) {
      throw new Error('Intelligence note not found');
    }

    const now = Date.now();

    // Create history entry before deletion
    await ctx.db.insert('intelligenceNoteHistory', {
      intelligenceNoteId: args.noteId,
      action: 'deleted',
      previousContent: existingNote.content,
      changedById: args.deletedById,
      changedAt: now,
    });

    // Delete the note
    await ctx.db.delete(args.noteId);

    return { success: true };
  },
});

// ============================================================================
// Queries
// ============================================================================

/**
 * Get intelligence notes with optional filters
 */
export const getIntelligenceNotes = query({
  args: {
    filters: v.optional(
      v.object({
        profileId: v.optional(v.id('profiles')),
        type: v.optional(intelligenceNoteTypeValidator),
        priority: v.optional(intelligenceNotePriorityValidator),
        authorId: v.optional(v.id('users')),
        search: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Apply filters
    let notes;
    if (args.filters?.profileId) {
      notes = await ctx.db
        .query('intelligenceNotes')
        .withIndex('by_profile', (q) => q.eq('profileId', args.filters!.profileId!))
        .collect();
    } else {
      // Default order by created date
      notes = await ctx.db
        .query('intelligenceNotes')
        .withIndex('by_created_at')
        .collect();
    }

    // Apply additional filters
    if (args.filters?.type) {
      notes = notes.filter((note) => note.type === args.filters!.type);
    }

    if (args.filters?.priority) {
      notes = notes.filter((note) => note.priority === args.filters!.priority);
    }

    if (args.filters?.authorId) {
      notes = notes.filter((note) => note.authorId === args.filters!.authorId);
    }

    if (args.filters?.search) {
      const searchTerm = args.filters.search.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm),
      );
    }

    // Sort by createdAt descending
    notes.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with author and profile data
    const enrichedNotes = await Promise.all(
      notes.map(async (note) => {
        const author = await ctx.db.get(note.authorId);
        const profile = await ctx.db.get(note.profileId);

        return {
          ...note,
          author:
            author && 'email' in author && 'firstName' in author
              ? {
                  id: author._id,
                  name:
                    `${(author as any).firstName || ''} ${(author as any).lastName || ''}`.trim() ||
                    null,
                  email: (author as any).email || null,
                }
              : undefined,
          profile:
            profile && 'personal' in profile
              ? {
                  id: profile._id,
                  firstName: (profile as any).personal.firstName || null,
                  lastName: (profile as any).personal.lastName || null,
                }
              : undefined,
          profileId: note.profileId,
        };
      }),
    );

    return enrichedNotes;
  },
});

/**
 * Get intelligence note history
 */
export const getNoteHistory = query({
  args: {
    noteId: v.id('intelligenceNotes'),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query('intelligenceNoteHistory')
      .withIndex('by_note', (q) => q.eq('intelligenceNoteId', args.noteId))
      .collect();

    // Enrich with user data
    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        const changedBy = await ctx.db.get(entry.changedById);
        return {
          ...entry,
          changedBy: changedBy
            ? {
                id: changedBy._id,
                name:
                  `${changedBy.firstName || ''} ${changedBy.lastName || ''}`.trim() ||
                  null,
                email: changedBy.email || null,
              }
            : undefined,
        };
      }),
    );

    // Sort by changedAt descending
    enrichedHistory.sort((a, b) => b.changedAt - a.changedAt);

    return enrichedHistory;
  },
});

/**
 * Get profiles with intelligence notes for the profiles page
 */
export const getProfiles = query({
  args: {
    page: v.number(),
    limit: v.number(),
    filters: v.optional(
      v.object({
        search: v.optional(v.string()),
        hasNotes: v.optional(v.boolean()),
        nationality: v.optional(v.string()),
        birthCountry: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let profiles = await ctx.db.query('profiles').collect();

    // Apply filters
    if (args.filters?.search) {
      const searchTerm = args.filters.search.toLowerCase();
      profiles = profiles.filter(
        (profile) =>
          profile.personal.firstName?.toLowerCase().includes(searchTerm) ||
          profile.personal.lastName?.toLowerCase().includes(searchTerm),
      );
    }

    if (args.filters?.nationality) {
      profiles = profiles.filter(
        (profile) => profile.personal.nationality === args.filters!.nationality,
      );
    }

    if (args.filters?.birthCountry) {
      profiles = profiles.filter(
        (profile) => profile.personal.birthCountry === args.filters!.birthCountry,
      );
    }

    // Enrich with intelligence notes and user data
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const intelligenceNotes = await ctx.db
          .query('intelligenceNotes')
          .withIndex('by_profile', (q) => q.eq('profileId', profile._id))
          .collect();

        const user = await ctx.db.get(profile.userId);

        return {
          ...profile,
          id: profile._id,
          intelligenceNotes: intelligenceNotes.slice(0, 3).map((note) => ({
            id: note._id,
            type: note.type,
            priority: note.priority,
            title: note.title,
            createdAt: note.createdAt,
          })),
          _count: {
            intelligenceNotes: intelligenceNotes.length,
          },
          user:
            user && 'email' in user && 'firstName' in user
              ? {
                  id: user._id,
                  name:
                    `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() ||
                    null,
                  email: (user as any).email || null,
                }
              : undefined,
        };
      }),
    );

    // Filter by hasNotes if specified
    let filteredProfiles = enrichedProfiles;
    if (args.filters?.hasNotes !== undefined) {
      filteredProfiles = enrichedProfiles.filter((profile) =>
        args.filters!.hasNotes
          ? profile._count.intelligenceNotes > 0
          : profile._count.intelligenceNotes === 0,
      );
    }

    // Sort by createdAt (profiles don't have updatedAt)
    filteredProfiles.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

    // Pagination
    const total = filteredProfiles.length;
    const skip = (args.page - 1) * args.limit;
    const paginatedProfiles = filteredProfiles.slice(skip, skip + args.limit);

    return {
      profiles: paginatedProfiles,
      pagination: {
        page: args.page,
        limit: args.limit,
        total,
        totalPages: Math.ceil(total / args.limit),
      },
    };
  },
});

/**
 * Get profiles for map visualization
 */
export const getProfilesMap = query({
  args: {
    filters: v.optional(
      v.object({
        search: v.optional(v.string()),
        hasNotes: v.optional(v.boolean()),
        priority: v.optional(intelligenceNotePriorityValidator),
        region: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let profiles = await ctx.db.query('profiles').collect();

    // Filter profiles with valid addresses only
    profiles = profiles.filter(
      (profile) =>
        profile.contacts.address &&
        profile.contacts.address.city &&
        profile.contacts.address.country,
    );

    // Apply filters
    if (args.filters?.search) {
      const searchTerm = args.filters.search.toLowerCase();
      profiles = profiles.filter(
        (profile) =>
          profile.personal.firstName?.toLowerCase().includes(searchTerm) ||
          profile.personal.lastName?.toLowerCase().includes(searchTerm),
      );
    }

    // Enrich with intelligence notes
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const intelligenceNotes = await ctx.db
          .query('intelligenceNotes')
          .withIndex('by_profile', (q) => q.eq('profileId', profile._id))
          .collect();

        return {
          id: profile._id,
          firstName: profile.personal.firstName || '',
          lastName: profile.personal.lastName || '',
          birthCountry: profile.personal.birthCountry || null,
          nationality: profile.personal.nationality || null,
          address: profile.contacts.address || null,
          intelligenceNotes: intelligenceNotes.map((note) => ({
            type: note.type,
            priority: note.priority,
            createdAt: note.createdAt,
          })),
        };
      }),
    );

    // Filter by hasNotes if specified
    let filteredProfiles = enrichedProfiles;
    if (args.filters?.hasNotes !== undefined) {
      filteredProfiles = enrichedProfiles.filter((profile) =>
        args.filters!.hasNotes
          ? profile.intelligenceNotes.length > 0
          : profile.intelligenceNotes.length === 0,
      );
    }

    // Filter by priority if specified
    if (args.filters?.priority) {
      filteredProfiles = filteredProfiles.filter((profile) =>
        profile.intelligenceNotes.some(
          (note) => note.priority === args.filters!.priority,
        ),
      );
    }

    return filteredProfiles;
  },
});

/**
 * Get profile details with intelligence data
 */
export const getProfileDetails = query({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    // Get the profile
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get intelligence notes for this profile
    const intelligenceNotes = await ctx.db
      .query('intelligenceNotes')
      .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
      .collect();

    // Sort notes by createdAt descending
    intelligenceNotes.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich notes with author data
    const enrichedNotes = await Promise.all(
      intelligenceNotes.map(async (note) => {
        const author = await ctx.db.get(note.authorId);
        return {
          ...note,
          id: note._id,
          author:
            author && 'email' in author && 'firstName' in author
              ? {
                  id: author._id,
                  name:
                    `${(author as any).firstName || ''} ${(author as any).lastName || ''}`.trim() ||
                    null,
                  email: (author as any).email || null,
                }
              : undefined,
        };
      }),
    );

    // Get user data
    const user = await ctx.db.get(profile.userId);

    return {
      ...profile,
      id: profile._id,
      firstName: profile.personal?.firstName,
      lastName: profile.personal?.lastName,
      birthDate: profile.personal?.birthDate,
      birthPlace: profile.personal?.birthPlace,
      email: profile.contacts?.email,
      phoneNumber: profile.contacts?.phone,
      address: profile.contacts?.address,
      nationality: profile.personal?.nationality,
      identityPicture: profile.documents?.identityPicture,
      intelligenceNotes: enrichedNotes,
      _count: {
        intelligenceNotes: intelligenceNotes.length,
      },
      user:
        user && 'email' in user && 'firstName' in user
          ? {
              id: user._id,
              name:
                `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() ||
                null,
              email: (user as any).email || null,
            }
          : undefined,
    };
  },
});

/**
 * Get dashboard statistics for intelligence
 */
export const getDashboardStats = query({
  args: {
    period: v.union(
      v.literal('day'),
      v.literal('week'),
      v.literal('month'),
      v.literal('year'),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let periodStart = now;

    // Calculate period start time
    switch (args.period) {
      case 'day':
        periodStart = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        periodStart = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        periodStart = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        periodStart = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }

    // Get all profiles
    const allProfiles = await ctx.db.query('profiles').collect();
    const totalProfiles = allProfiles.length;

    // Get all intelligence notes
    const allNotes = await ctx.db.query('intelligenceNotes').collect();

    // Count profiles with notes
    const profilesWithNotesSet = new Set<Id<'profiles'>>();
    allNotes.forEach((note) => profilesWithNotesSet.add(note.profileId));
    const profilesWithNotes = profilesWithNotesSet.size;

    // Count notes in the period
    const notesThisPeriod = allNotes.filter(
      (note) => note.createdAt >= periodStart,
    ).length;

    // Count notes by type
    const notesByType: Record<string, number> = {};
    allNotes.forEach((note) => {
      notesByType[note.type] = (notesByType[note.type] || 0) + 1;
    });

    // Get recent notes
    const recentNotes = allNotes
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((note) => ({
        id: note._id,
        title: note.title,
        type: note.type,
        priority: note.priority,
        createdAt: note.createdAt,
      }));

    // Enrich recent notes with author and profile data
    const enrichedRecentNotes = await Promise.all(
      recentNotes.map(async (note) => {
        const fullNote = allNotes.find((n) => n._id === note.id);
        if (!fullNote) return note;

        const author = await ctx.db.get(fullNote.authorId);
        const profile = await ctx.db.get(fullNote.profileId);

        return {
          ...note,
          author:
            author && 'email' in author && 'firstName' in author
              ? {
                  name:
                    `${(author as any).firstName || ''} ${(author as any).lastName || ''}`.trim() ||
                    null,
                }
              : undefined,
          profile:
            profile && 'personal' in profile
              ? {
                  firstName: (profile as any).personal.firstName,
                  lastName: (profile as any).personal.lastName,
                }
              : undefined,
        };
      }),
    );

    return {
      totalProfiles,
      profilesWithNotes,
      notesThisPeriod,
      notesByType,
      recentNotes: enrichedRecentNotes,
    };
  },
});

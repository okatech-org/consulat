import { z } from 'zod';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@/convex/lib/constants';

export const createIntelligenceNoteSchema = z.object({
  profileId: z.string().min(1, "L'ID du profil est requis"),
  type: z.nativeEnum(IntelligenceNoteType, {
    errorMap: () => ({ message: 'Type de note invalide' }),
  }),
  priority: z
    .nativeEnum(IntelligenceNotePriority)
    .default(IntelligenceNotePriority.MEDIUM),
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  content: z
    .string()
    .min(1, 'Le contenu est requis')
    .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères'),
  tags: z.array(z.string()).optional(),
  expiresAt: z.date().optional(),
});

export const updateIntelligenceNoteSchema = createIntelligenceNoteSchema
  .partial()
  .extend({
    id: z.string().min(1, "L'ID de la note est requis"),
  });

export const getIntelligenceNotesSchema = z.object({
  profileId: z.string().min(1, "L'ID du profil est requis").optional(),
  filters: z
    .object({
      type: z.nativeEnum(IntelligenceNoteType).optional(),
      priority: z.nativeEnum(IntelligenceNotePriority).optional(),
      authorId: z.string().optional(),
      search: z.string().optional(),
    })
    .optional(),
});

export const getIntelligenceNoteHistorySchema = z.object({
  noteId: z.string().min(1, "L'ID de la note est requis"),
});

export const deleteIntelligenceNoteSchema = z.object({
  noteId: z.string().min(1, "L'ID de la note est requis"),
});

export const getProfilesWithIntelligenceSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  filters: z
    .object({
      search: z.string().optional(),
      hasNotes: z.boolean().optional(),
      nationality: z.string().optional(),
      birthCountry: z.string().optional(),
    })
    .optional(),
});

export const getIntelligenceDashboardStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

export const getIntelligenceMapDataSchema = z.object({
  filters: z
    .object({
      region: z.string().optional(),
      hasNotes: z.boolean().optional(),
      priority: z.nativeEnum(IntelligenceNotePriority).optional(),
      type: z.nativeEnum(IntelligenceNoteType).optional(),
    })
    .optional(),
});

// Types inférés
export type CreateIntelligenceNoteInput = z.infer<typeof createIntelligenceNoteSchema>;
export type UpdateIntelligenceNoteInput = z.infer<typeof updateIntelligenceNoteSchema>;
export type GetIntelligenceNotesInput = z.infer<typeof getIntelligenceNotesSchema>;
export type GetIntelligenceNoteHistoryInput = z.infer<
  typeof getIntelligenceNoteHistorySchema
>;
export type DeleteIntelligenceNoteInput = z.infer<typeof deleteIntelligenceNoteSchema>;
export type GetProfilesWithIntelligenceInput = z.infer<
  typeof getProfilesWithIntelligenceSchema
>;
export type GetIntelligenceDashboardStatsInput = z.infer<
  typeof getIntelligenceDashboardStatsSchema
>;
export type GetIntelligenceMapDataInput = z.infer<typeof getIntelligenceMapDataSchema>;

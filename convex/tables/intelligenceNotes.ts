import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  intelligenceNoteTypeValidator,
  intelligenceNotePriorityValidator,
} from '../lib/validators';

// Table IntelligenceNotes - Notes de renseignement
export const intelligenceNotes = defineTable({
  profileId: v.id('profiles'),
  authorId: v.id('users'),
  type: intelligenceNoteTypeValidator,
  priority: intelligenceNotePriorityValidator,
  title: v.string(),
  content: v.string(),
  tags: v.optional(v.array(v.string())),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_profile', ['profileId'])
  .index('by_author', ['authorId'])
  .index('by_type', ['type'])
  .index('by_priority', ['priority'])
  .index('by_created_at', ['createdAt']);

export const intelligenceNoteHistory = defineTable({
  intelligenceNoteId: v.id('intelligenceNotes'),
  action: v.union(v.literal('created'), v.literal('updated'), v.literal('deleted')),
  previousContent: v.optional(v.string()),
  newContent: v.optional(v.string()),
  changedById: v.id('users'),
  changedAt: v.number(),
})
  .index('by_note', ['intelligenceNoteId'])
  .index('by_changed_by', ['changedById'])
  .index('by_changed_at', ['changedAt']);

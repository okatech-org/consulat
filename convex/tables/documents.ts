import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  documentStatusValidator,
  documentTypeValidator,
  ownerTypeValidator,
  validationStatusValidator,
} from '../lib/validators';

export const documents = defineTable({
  type: documentTypeValidator,
  status: documentStatusValidator,

  // Stockage (flexible pour Convex storage ou URL)
  storageId: v.optional(v.string()), // Convex storage ID
  fileUrl: v.optional(v.string()), // URL externe
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.optional(v.number()),
  checksum: v.optional(v.string()),

  // Versioning
  version: v.number(),
  previousVersionId: v.optional(v.id('documents')),

  // Propriétaire (polymorphique)
  ownerId: v.string(), // ID de l'entité propriétaire
  ownerType: ownerTypeValidator,

  // Validité
  issuedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),

  // Validation
  validations: v.array(
    v.object({
      validatorId: v.id('users'),
      status: validationStatusValidator,
      comments: v.optional(v.string()),
      timestamp: v.number(),
    }),
  ),

  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_owner', ['ownerId', 'ownerType'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_storage', ['storageId']);

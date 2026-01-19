import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  documentStatusValidator,
  documentTypeValidator,
  ownerIdValidator,
  ownerTypeValidator,
  validationStatusValidator,
} from '../lib/validators';

export const documents = defineTable({
  type: documentTypeValidator,
  status: documentStatusValidator,

  storageId: v.optional(v.id('_storage')),
  fileUrl: v.optional(v.string()),
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.optional(v.number()),
  checksum: v.optional(v.string()),

  version: v.number(),
  previousVersionId: v.optional(v.id('documents')),

  ownerId: ownerIdValidator,
  ownerType: ownerTypeValidator,

  issuedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),

  validations: v.array(
    v.object({
      validatorId: v.id('users'),
      status: validationStatusValidator,
      comments: v.optional(v.string()),
      timestamp: v.number(),
    }),
  ),

  metadata: v.optional(v.record(v.string(), v.any())),
})
  .index('by_owner', ['ownerId', 'ownerType'])
  .index('by_type', ['type'])
  .index('by_owner_type', ['ownerType'])
  .index('by_status', ['status'])
  .index('by_storage', ['storageId'])
  .index('by_type_and_owner', ['type', 'ownerId']);

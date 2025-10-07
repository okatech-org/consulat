import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { DocumentStatus } from "../../lib/constants";
import type { DocumentType, OwnerType } from "../../lib/constants";

export const createDocument = mutation({
  args: {
    type: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    checksum: v.optional(v.string()),
    storageId: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    ownerId: v.string(),
    ownerType: v.string(),
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      type: args.type as DocumentType,
      status: DocumentStatus.Pending,
      storageId: args.storageId,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      checksum: args.checksum,
      version: 1,
      previousVersionId: undefined,
      ownerId: args.ownerId,
      ownerType: args.ownerType as OwnerType,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      validations: [],
      metadata: args.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return documentId;
  },
});

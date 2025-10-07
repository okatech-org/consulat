import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { DocumentStatus } from '../../lib/constants'
import type { ValidationStatus } from '../../lib/constants'

export const updateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    checksum: v.optional(v.string()),
    storageId: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const existingDocument = await ctx.db.get(args.documentId)
    if (!existingDocument) {
      throw new Error('Document not found')
    }

    const updateData = {
      ...(args.fileName && { fileName: args.fileName }),
      ...(args.fileType && { fileType: args.fileType }),
      ...(args.fileSize !== undefined && { fileSize: args.fileSize }),
      ...(args.checksum && { checksum: args.checksum }),
      ...(args.storageId && { storageId: args.storageId }),
      ...(args.fileUrl && { fileUrl: args.fileUrl }),
      ...(args.issuedAt !== undefined && { issuedAt: args.issuedAt }),
      ...(args.expiresAt !== undefined && { expiresAt: args.expiresAt }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.documentId, updateData)
    return args.documentId
  },
})

export const validateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    validatorId: v.id('users'),
    status: v.string(),
    comments: v.optional(v.string()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    const validation = {
      validatorId: args.validatorId,
      status: args.status as ValidationStatus,
      comments: args.comments,
      timestamp: Date.now(),
    }

    const newStatus =
      args.status === 'approved'
        ? DocumentStatus.Validated
        : args.status === 'rejected'
          ? DocumentStatus.Rejected
          : document.status

    await ctx.db.patch(args.documentId, {
      status: newStatus,
      validations: [...document.validations, validation],
      updatedAt: Date.now(),
    })

    return args.documentId
  },
})

export const createDocumentVersion = mutation({
  args: {
    documentId: v.id('documents'),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    checksum: v.optional(v.string()),
    storageId: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const existingDocument = await ctx.db.get(args.documentId)
    if (!existingDocument) {
      throw new Error('Document not found')
    }

    const newVersionId = await ctx.db.insert('documents', {
      type: existingDocument.type,
      status: DocumentStatus.Pending,
      storageId: args.storageId,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      checksum: args.checksum,
      version: existingDocument.version + 1,
      previousVersionId: args.documentId,
      ownerId: existingDocument.ownerId,
      ownerType: existingDocument.ownerType,
      issuedAt: existingDocument.issuedAt,
      expiresAt: existingDocument.expiresAt,
      validations: [],
      metadata: args.metadata || existingDocument.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return newVersionId
  },
})

export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id('documents'),
    status: v.string(),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: args.status as DocumentStatus,
      updatedAt: Date.now(),
    })

    return args.documentId
  },
})

export const deleteDocument = mutation({
  args: { documentId: v.id('documents') },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId)
    return args.documentId
  },
})

export const markDocumentAsExpiring = mutation({
  args: {
    documentId: v.id('documents'),
    daysBeforeExpiry: v.optional(v.number()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    if (!document.expiresAt) {
      throw new Error('Document has no expiry date')
    }

    const daysBeforeExpiry = args.daysBeforeExpiry || 30
    const expiryThreshold = Date.now() + daysBeforeExpiry * 24 * 60 * 60 * 1000

    if (document.expiresAt <= expiryThreshold) {
      await ctx.db.patch(args.documentId, {
        status: DocumentStatus.Expiring,
        updatedAt: Date.now(),
      })
    }

    return args.documentId
  },
})

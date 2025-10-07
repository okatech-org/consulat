import { v } from 'convex/values'
import { mutation, query } from '../../_generated/server'
import type { Id } from '../../_generated/dataModel'

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const saveFileToDocument = mutation({
  args: {
    documentId: v.id('documents'),
    storageId: v.id('_storage'),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    storageId: v.id('_storage'),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // Mettre à jour le document avec les informations du fichier
    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      updatedAt: Date.now(),
    })

    return { success: true, storageId: args.storageId }
  },
})

export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
  },
})

export const getDocumentFileUrl = query({
  args: { documentId: v.id('documents') },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document || !document.storageId) {
      return null
    }

    return await ctx.storage.getUrl(document.storageId as Id<'_storage'>)
  },
})

export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId as Id<'_storage'>)
    return { success: true }
  },
})

export const deleteDocumentFile = mutation({
  args: { documentId: v.id('documents') },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document || !document.storageId) {
      throw new Error('Document or file not found')
    }

    // Supprimer le fichier du stockage
    await ctx.storage.delete(document.storageId as Id<'_storage'>)

    // Mettre à jour le document pour retirer les références au fichier
    await ctx.db.patch(args.documentId, {
      storageId: undefined,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const getFilesByOwner = query({
  args: {
    ownerId: v.string(),
    ownerType: v.string(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', args.ownerId).eq('ownerType', args.ownerType),
      )
      .filter((q) => q.neq(q.field('storageId'), undefined))
      .collect()

    const filesWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId
          ? await ctx.storage.getUrl(doc.storageId as Id<'_storage'>)
          : null,
      })),
    )

    return filesWithUrls
  },
})

export const getFileMetadata = query({
  args: { storageId: v.id('_storage') },
  returns: v.union(
    v.null(),
    v.object({
      storageId: v.id('_storage'),
      url: v.string(),
      document: v.optional(v.any()),
      exists: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
    if (!url) {
      return null
    }

    // Trouver le document associé à ce fichier
    const document = await ctx.db
      .query('documents')
      .filter((q) => q.eq(q.field('storageId'), args.storageId))
      .first()

    return {
      storageId: args.storageId,
      url,
      document,
      exists: true,
    }
  },
})

export const validateFileType = mutation({
  args: {
    fileType: v.string(),
    allowedTypes: v.array(v.string()),
  },
  returns: v.object({
    isValid: v.boolean(),
    fileType: v.string(),
  }),
  handler: (ctx, args) => {
    const isValid = args.allowedTypes.includes(args.fileType)
    return { isValid, fileType: args.fileType }
  },
})

export const getFileUsageStats = query({
  args: { ownerId: v.optional(v.string()) },
  returns: v.object({
    totalFiles: v.number(),
    totalSize: v.number(),
    fileTypeStats: v.record(v.string(), v.number()),
    averageSize: v.number(),
  }),
  handler: async (ctx, args) => {
    let documents: Array<any> = []

    if (args.ownerId) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_owner', (q) => q.eq('ownerId', args.ownerId!))
        .collect()
    } else {
      documents = await ctx.db.query('documents').collect()
    }
    const filesWithStorage = documents.filter((doc) => doc.storageId)

    const totalSize = filesWithStorage.reduce(
      (sum, doc) => sum + (doc.fileSize || 0),
      0,
    )
    const fileTypeStats = filesWithStorage.reduce(
      (stats, doc) => {
        const type = doc.fileType || 'unknown'
        stats[type] = (stats[type] || 0) + 1
        return stats
      },
      {} as Record<string, number>,
    )

    return {
      totalFiles: filesWithStorage.length,
      totalSize,
      fileTypeStats,
      averageSize:
        filesWithStorage.length > 0 ? totalSize / filesWithStorage.length : 0,
    }
  },
})

import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getDocument = query({
  args: { documentId: v.id('documents') },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId)
  },
})

export const getDocumentsByOwner = query({
  args: {
    ownerId: v.string(),
    ownerType: v.string(),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', args.ownerId).eq('ownerType', args.ownerType),
      )
      .collect()

    let filteredDocuments = documents

    if (args.type) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.type === args.type,
      )
    }

    if (args.status) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.status === args.status,
      )
    }

    return filteredDocuments.sort((a, b) => b._creationTime - a._creationTime)
  },
})

export const getAllDocuments = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    ownerType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.type && args.status) {
      const documents = await ctx.db
        .query('documents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()

      return args.limit ? documents.slice(0, args.limit) : documents
    } else if (args.type) {
      const documents = await ctx.db
        .query('documents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .collect()

      return args.limit ? documents.slice(0, args.limit) : documents
    } else if (args.status) {
      const documents = await ctx.db
        .query('documents')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()

      return args.limit ? documents.slice(0, args.limit) : documents
    }

    const documents = await ctx.db.query('documents').order('desc').collect()

    return args.limit ? documents.slice(0, args.limit) : documents
  },
})

export const getDocumentsByType = query({
  args: { type: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .order('desc')
      .collect()
  },
})

export const getDocumentsByStatus = query({
  args: { status: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect()
  },
})

export const searchDocuments = query({
  args: {
    searchTerm: v.string(),
    ownerType: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let documents: Array<any> = []

    if (args.type) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .collect()
    } else {
      documents = await ctx.db.query('documents').collect()
    }

    if (args.ownerType) {
      documents = documents.filter((doc) => doc.ownerType === args.ownerType)
    }

    return documents.filter(
      (doc) =>
        doc.fileName.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (doc.metadata &&
          JSON.stringify(doc.metadata)
            .toLowerCase()
            .includes(args.searchTerm.toLowerCase())),
    )
  },
})

export const getDocumentVersions = query({
  args: { documentId: v.id('documents') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) return []

    const versions = [document]
    let currentDoc = document

    // Remonter la chaîne des versions précédentes
    while (currentDoc.previousVersionId) {
      const previousVersion = await ctx.db.get(currentDoc.previousVersionId)
      if (previousVersion) {
        versions.unshift(previousVersion)
        currentDoc = previousVersion
      } else {
        break
      }
    }

    return versions
  },
})

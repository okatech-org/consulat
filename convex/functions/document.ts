import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { DocumentStatus } from '../lib/constants';
import { OwnerType, ValidationStatus } from '../lib/constants';
import { Doc, Id } from '../_generated/dataModel';
import {
  documentStatusValidator,
  documentTypeValidator,
  ownerIdValidator,
  ownerTypeValidator,
} from '../lib/validators';

export const createDocument = mutation({
  args: {
    type: documentTypeValidator,
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    checksum: v.optional(v.string()),
    storageId: v.id('_storage'),
    fileUrl: v.optional(v.string()),
    ownerId: ownerIdValidator,
    ownerType: ownerTypeValidator,
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert('documents', {
      type: args.type,
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
      ownerType: args.ownerType,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      validations: [],
      metadata: args.metadata || {},
    });

    return documentId;
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    checksum: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    fileUrl: v.optional(v.string()),
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const existingDocument = await ctx.db.get(args.documentId);
    if (!existingDocument) {
      throw new Error('Document not found');
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
    };

    await ctx.db.patch(args.documentId, updateData);
    return args.documentId;
  },
});

export const validateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    validatorId: v.id('users'),
    status: v.string(),
    comments: v.optional(v.string()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const validation = {
      validatorId: args.validatorId,
      status: args.status as ValidationStatus,
      comments: args.comments,
      timestamp: Date.now(),
    };

    const newStatus =
      args.status === 'approved'
        ? DocumentStatus.Validated
        : args.status === 'rejected'
          ? DocumentStatus.Rejected
          : document.status;

    await ctx.db.patch(args.documentId, {
      status: newStatus,
      validations: [...document.validations, validation],
    });

    return args.documentId;
  },
});

export const createDocumentVersion = mutation({
  args: {
    documentId: v.id('documents'),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    checksum: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    fileUrl: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const existingDocument = await ctx.db.get(args.documentId);
    if (!existingDocument) {
      throw new Error('Document not found');
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
    });

    return newVersionId;
  },
});

export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id('documents'),
    status: v.string(),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: args.status as DocumentStatus,
    });

    return args.documentId;
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id('documents') },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId);
    return args.documentId;
  },
});

export const markDocumentAsExpiring = mutation({
  args: {
    documentId: v.id('documents'),
    daysBeforeExpiry: v.optional(v.number()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.expiresAt) {
      throw new Error('Document has no expiry date');
    }

    const daysBeforeExpiry = args.daysBeforeExpiry || 30;
    const expiryThreshold = Date.now() + daysBeforeExpiry * 24 * 60 * 60 * 1000;

    if (document.expiresAt <= expiryThreshold) {
      await ctx.db.patch(args.documentId, {
        status: DocumentStatus.Expiring,
      });
    }

    return args.documentId;
  },
});

// Queries
export const getDocument = query({
  args: { documentId: v.id('documents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const getDocumentsByOwner = query({
  args: {
    ownerId: ownerIdValidator,
    ownerType: ownerTypeValidator,
    type: v.optional(documentTypeValidator),
    status: v.optional(documentStatusValidator),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', args.ownerId).eq('ownerType', args.ownerType),
      )
      .collect();

    let filteredDocuments = documents;

    if (args.type) {
      filteredDocuments = filteredDocuments.filter((doc) => doc.type === args.type);
    }

    if (args.status) {
      filteredDocuments = filteredDocuments.filter((doc) => doc.status === args.status);
    }

    return filteredDocuments.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getAllDocuments = query({
  args: {
    type: v.optional(documentTypeValidator),
    status: v.optional(documentStatusValidator),
    ownerType: v.optional(ownerTypeValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let documents: Array<Doc<'documents'>>;

    if (args.type && args.status) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect();
    } else if (args.type) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .collect();
    } else if (args.status) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      documents = await ctx.db.query('documents').order('desc').collect();
    }

    return args.limit ? documents.slice(0, args.limit) : documents;
  },
});

export const getDocumentsByType = query({
  args: { type: documentTypeValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .order('desc')
      .collect();
  },
});

export const getDocumentsByStatus = query({
  args: { status: documentStatusValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('documents')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect();
  },
});

export const searchDocuments = query({
  args: {
    searchTerm: v.string(),
    ownerType: v.optional(ownerTypeValidator),
    type: v.optional(documentTypeValidator),
  },
  handler: async (ctx, args) => {
    let documents: Array<Doc<'documents'>> = [];

    if (args.type) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .collect();
    } else {
      documents = await ctx.db.query('documents').collect();
    }

    if (args.ownerType) {
      documents = documents.filter((doc) => doc.ownerType === args.ownerType);
    }

    return documents.filter(
      (doc) =>
        doc.fileName.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (doc.metadata &&
          JSON.stringify(doc.metadata)
            .toLowerCase()
            .includes(args.searchTerm.toLowerCase())),
    );
  },
});

export const getDocumentVersions = query({
  args: { documentId: v.id('documents') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) return [];

    const versions = [document];
    let currentDoc = document;

    while (currentDoc.previousVersionId) {
      const previousVersion = await ctx.db.get(currentDoc.previousVersionId);
      if (previousVersion) {
        versions.unshift(previousVersion);
        currentDoc = previousVersion;
      } else {
        break;
      }
    }

    return versions;
  },
});

// Fonctions spécifiques aux documents utilisateur

export const createUserDocument = mutation({
  args: {
    type: documentTypeValidator,
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    fileType: v.string(),
    fileName: v.optional(v.string()),
    ownerId: ownerIdValidator,
    ownerType: ownerTypeValidator,
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('unauthorized');
    }

    const fileName =
      args.fileName || `document-${Date.now()}.${args.fileType.split('/')[1]}`;

    let fileUrl = args.fileUrl;
    if (!fileUrl && args.storageId) {
      fileUrl = (await ctx.storage.getUrl(args.storageId as Id<'_storage'>)) || undefined;
    }

    const documentId = await ctx.db.insert('documents', {
      type: args.type,
      status: DocumentStatus.Pending,
      storageId: args.storageId,
      fileUrl,
      fileName,
      fileType: args.fileType,
      ownerId: args.ownerId,
      ownerType: args.ownerType,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      validations: [],
      metadata: args.metadata || {},
      version: 1,
    });

    return documentId;
  },
});

export const replaceUserDocumentFile = mutation({
  args: {
    documentId: v.id('documents'),
    fileUrl: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    fileType: v.string(),
    fileName: v.optional(v.string()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const ownerId = document.ownerId;
    if (ownerId !== identity.subject && document.ownerType !== 'user') {
      throw new Error('Unauthorized to modify this document');
    }

    let fileUrl = args.fileUrl;
    if (!fileUrl && args.storageId) {
      fileUrl = (await ctx.storage.getUrl(args.storageId as Id<'_storage'>)) || undefined;
    }

    const updateData: any = {
      fileUrl,
      storageId: args.storageId,
      fileType: args.fileType,
      status: DocumentStatus.Pending,
    };

    if (args.fileName) {
      updateData.fileName = args.fileName;
    }

    await ctx.db.patch(args.documentId, updateData);
    return args.documentId;
  },
});

export const updateUserDocument = mutation({
  args: {
    documentId: v.id('documents'),
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Vérifier que l'utilisateur peut modifier ce document
    const ownerId = document.ownerId;
    if (ownerId !== identity.subject && document.ownerType !== 'user') {
      throw new Error('Unauthorized to modify this document');
    }

    const updateData: any = {};
    if (args.issuedAt !== undefined) updateData.issuedAt = args.issuedAt;
    if (args.expiresAt !== undefined) updateData.expiresAt = args.expiresAt;
    if (args.metadata !== undefined) updateData.metadata = args.metadata;

    // Remettre le statut en attente si les dates sont modifiées
    if (args.issuedAt !== undefined || args.expiresAt !== undefined) {
      updateData.status = DocumentStatus.Pending;
    }

    await ctx.db.patch(args.documentId, updateData);
    return args.documentId;
  },
});

export const deleteUserDocument = mutation({
  args: {
    documentId: v.id('documents'),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('unauthorized');
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('document_not_found');
    }

    // Supprimer le fichier du stockage si présent
    if (document.storageId) {
      await ctx.storage.delete(document.storageId);
    }

    await ctx.db.delete(args.documentId);
    return true;
  },
});

export const getUserDocuments = query({
  args: {
    userId: v.optional(v.id('users')),
    profileId: v.optional(v.id('profiles')),
    type: v.optional(documentTypeValidator),
    status: v.optional(documentStatusValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    let documents: Array<Doc<'documents'>> = [];

    if (args.userId) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_owner', (q) =>
          q.eq('ownerId', args.userId!).eq('ownerType', OwnerType.User),
        )
        .collect();
    } else if (args.profileId) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_owner', (q) =>
          q.eq('ownerId', args.profileId!).eq('ownerType', OwnerType.Profile),
        )
        .collect();
    } else {
      // Récupérer tous les documents de l'utilisateur actuel
      const userDocs = await ctx.db
        .query('documents')
        .withIndex('by_owner', (q) =>
          q
            .eq('ownerId', identity.subject as Id<'users'>)
            .eq('ownerType', OwnerType.User),
        )
        .collect();

      documents.push(...userDocs);
    }

    // Filtrer par type et statut si spécifié
    if (args.type) {
      documents = documents.filter((doc) => doc.type === args.type);
    }

    if (args.status) {
      documents = documents.filter((doc) => doc.status === args.status);
    }

    // Enrichir avec les URLs des fichiers
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : doc.fileUrl,
      })),
    );

    return documentsWithUrls;
  },
});

export const getUserDocumentsPaginated = query({
  args: {
    type: v.optional(documentTypeValidator),
    status: v.optional(documentStatusValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Récupérer tous les documents de l'utilisateur actuel
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', identity.subject as Id<'users'>).eq('ownerType', OwnerType.User),
      )
      .order('desc')
      .collect();

    let filteredDocuments = documents;

    // Filtrer par type et statut si spécifié
    if (args.type) {
      filteredDocuments = filteredDocuments.filter((doc) => doc.type === args.type);
    }

    if (args.status) {
      filteredDocuments = filteredDocuments.filter((doc) => doc.status === args.status);
    }

    // Enrichir avec les URLs des fichiers
    const documentsWithUrls = await Promise.all(
      filteredDocuments.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : doc.fileUrl,
      })),
    );

    return documentsWithUrls;
  },
});

export const validateUserDocument = mutation({
  args: {
    documentId: v.id('documents'),
    validatorId: v.id('users'),
    status: v.string(),
    comments: v.optional(v.string()),
  },
  returns: v.id('documents'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Vérifier que l'utilisateur peut valider ce document
    if (!hasAdminRole(identity)) {
      throw new Error('Unauthorized to validate documents');
    }

    const validation = {
      validatorId: args.validatorId,
      status: args.status as ValidationStatus,
      comments: args.comments,
      timestamp: Date.now(),
    };

    const newStatus =
      args.status === 'approved'
        ? DocumentStatus.Validated
        : args.status === 'rejected'
          ? DocumentStatus.Rejected
          : document.status;

    await ctx.db.patch(args.documentId, {
      status: newStatus,
      validations: [...document.validations, validation],
    });

    return args.documentId;
  },
});

// Helper function to check admin role
function hasAdminRole(identity: any): boolean {
  const adminRoles = ['admin', 'agent', 'super_admin', 'manager'];
  return identity.roles?.some((role: string) => adminRoles.includes(role)) || false;
}

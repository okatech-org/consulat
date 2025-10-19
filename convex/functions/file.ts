import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { DocumentStatus } from '../lib/constants';
import type { Doc, Id } from '../_generated/dataModel';
import {
  formatBytes,
  getAllowedTypesForCategory,
  getFileCategory,
  getSizeLimitForCategory,
  validateFileSize,
  validateFileType as validateFileTypeFn,
} from '../lib/fileTypes';
import type { FileCategory, FileValidationResult } from '../lib/fileTypes';
import {
  documentTypeValidator,
  documentStatusValidator,
  ownerIdValidator,
  ownerTypeValidator,
} from '../lib/validators';

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
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
    });

    return { success: true, storageId: args.storageId };
  },
});

export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId as Id<'_storage'>);
    return { success: true };
  },
});

export const deleteDocumentFile = mutation({
  args: { documentId: v.id('documents') },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document || !document.storageId) {
      throw new Error('Document or file not found');
    }

    await ctx.storage.delete(document.storageId as Id<'_storage'>);

    await ctx.db.patch(args.documentId, {
      storageId: undefined,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
    });

    return { success: true };
  },
});

// Document File Management Mutations
export const createDocumentWithFile = mutation({
  args: {
    type: documentTypeValidator,
    status: documentStatusValidator,
    ownerId: ownerIdValidator,
    ownerType: ownerTypeValidator,
    storageId: v.id('_storage'),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  returns: v.object({
    documentId: v.id('documents'),
  }),
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert('documents', {
      type: args.type,
      status: args.status,
      ownerId: args.ownerId,
      ownerType: args.ownerType,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      metadata: args.metadata,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      version: 1,
      validations: [],
    });

    return { documentId };
  },
});

export const updateDocumentFile = mutation({
  args: {
    documentId: v.id('documents'),
    storageId: v.id('_storage'),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.storageId) {
      await ctx.storage.delete(document.storageId);
    }

    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
    });

    return { success: true };
  },
});

export const archiveDocument = mutation({
  args: { documentId: v.id('documents') },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.storageId) {
      await ctx.storage.delete(document.storageId as Id<'_storage'>);
    }

    await ctx.db.patch(args.documentId, {
      status: DocumentStatus.Expired,
      storageId: undefined,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
    });

    return { success: true };
  },
});

export const duplicateDocumentFile = mutation({
  args: {
    sourceDocumentId: v.id('documents'),
    newOwnerId: v.string(),
    newOwnerType: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sourceDocument = await ctx.db.get(args.sourceDocumentId);
    if (!sourceDocument || !sourceDocument.storageId) {
      throw new Error('Source document or file not found');
    }

    throw new Error('File duplication requires HTTP action implementation');
  },
});

// Validation Mutations
export const validateFile = mutation({
  args: {
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.optional(v.string()),
  },
  returns: v.object({
    isValid: v.boolean(),
    errors: v.array(v.string()),
    results: v.array(
      v.object({
        isValid: v.boolean(),
        error: v.optional(v.string()),
      }),
    ),
    category: v.optional(v.string()),
    sizeLimit: v.optional(v.number()),
    formattedSizeLimit: v.optional(v.string()),
  }),
  handler: (ctx, args) => {
    const results: Array<FileValidationResult> = [];

    const allowedTypes = args.category
      ? getAllowedTypesForCategory(args.category as FileCategory)
      : [
          ...getAllowedTypesForCategory('IMAGES'),
          ...getAllowedTypesForCategory('DOCUMENTS'),
          ...getAllowedTypesForCategory('ARCHIVES'),
          ...getAllowedTypesForCategory('VIDEOS'),
          ...getAllowedTypesForCategory('AUDIOS'),
        ];

    const typeValidation = validateFileTypeFn(args.fileType, allowedTypes);
    results.push(typeValidation);

    if (!typeValidation.isValid) {
      return {
        isValid: false,
        errors: results
          .map((r) => r.error)
          .filter((error): error is string => Boolean(error)),
        results,
      };
    }

    const category = getFileCategory(args.fileType);
    const sizeLimit = getSizeLimitForCategory(category);
    const sizeValidation = validateFileSize(args.fileSize, sizeLimit);
    results.push(sizeValidation);

    const nameValidation = validateFileName(args.fileName);
    results.push(nameValidation);

    const isValid = results.every((r) => r.isValid);

    return {
      isValid,
      errors: results
        .map((r) => r.error)
        .filter((error): error is string => Boolean(error)),
      results,
      category,
      sizeLimit,
      formattedSizeLimit: formatBytes(sizeLimit),
    };
  },
});

export const validateMultipleFiles = mutation({
  args: {
    files: v.array(
      v.object({
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
      }),
    ),
    category: v.optional(v.string()),
    maxFiles: v.optional(v.number()),
    totalSizeLimit: v.optional(v.number()),
  },
  returns: v.object({
    isValid: v.boolean(),
    errors: v.array(v.string()),
    results: v.array(
      v.object({
        file: v.object({
          fileName: v.string(),
          fileType: v.string(),
          fileSize: v.number(),
        }),
        validation: v.object({
          isValid: v.boolean(),
          error: v.optional(v.string()),
        }),
      }),
    ),
    totalSize: v.number(),
    formattedTotalSize: v.string(),
    fileCount: v.number(),
  }),
  handler: (ctx, args) => {
    const results: Array<{
      file: {
        fileName: string;
        fileType: string;
        fileSize: number;
      };
      validation: FileValidationResult;
    }> = [];

    let totalSize = 0;
    const errors: Array<string> = [];

    if (args.maxFiles && args.files.length > args.maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${args.maxFiles}`);
    }

    for (const file of args.files) {
      const typeValidation = validateFileTypeFn(
        file.fileType,
        args.category
          ? getAllowedTypesForCategory(args.category as FileCategory)
          : [
              ...getAllowedTypesForCategory('IMAGES'),
              ...getAllowedTypesForCategory('DOCUMENTS'),
              ...getAllowedTypesForCategory('ARCHIVES'),
              ...getAllowedTypesForCategory('VIDEOS'),
              ...getAllowedTypesForCategory('AUDIOS'),
            ],
      );

      const validation = {
        isValid: typeValidation.isValid,
        errors: typeValidation.error ? [typeValidation.error] : [],
        results: [typeValidation],
      };

      results.push({
        file,
        validation: validation.results[0],
      });

      if (!validation.isValid) {
        errors.push(...validation.errors);
      }

      totalSize += file.fileSize;
    }

    if (args.totalSizeLimit && totalSize > args.totalSizeLimit) {
      errors.push(
        `Total file size ${formatBytes(totalSize)} exceeds limit of ${formatBytes(args.totalSizeLimit)}`,
      );
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      results,
      totalSize,
      formattedTotalSize: formatBytes(totalSize),
      fileCount: args.files.length,
    };
  },
});

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
    const isValid = args.allowedTypes.includes(args.fileType);
    return { isValid, fileType: args.fileType };
  },
});

// Queries
export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as Id<'_storage'>);
  },
});

export const getDocumentFileUrl = query({
  args: { documentId: v.id('documents') },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document || !document.storageId) {
      return null;
    }

    return await ctx.storage.getUrl(document.storageId as Id<'_storage'>);
  },
});

export const getFilesByOwner = query({
  args: {
    ownerId: ownerIdValidator,
    ownerType: ownerTypeValidator,
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', args.ownerId).eq('ownerType', args.ownerType),
      )
      .filter((q) => q.neq(q.field('storageId'), undefined))
      .collect();

    const filesWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId
          ? await ctx.storage.getUrl(doc.storageId as Id<'_storage'>)
          : null,
      })),
    );

    return filesWithUrls;
  },
});

export const getFileMetadata = query({
  args: { storageId: v.id('_storage') },
  returns: v.union(
    v.null(),
    v.object({
      storageId: v.id('_storage'),
      url: v.string(),
      document: v.optional(v.id('documents')),
      exists: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>);
    if (!url) {
      return null;
    }

    const document = await ctx.db
      .query('documents')
      .filter((q) => q.eq(q.field('storageId'), args.storageId))
      .first();

    return {
      storageId: args.storageId,
      url,
      document: document?._id,
      exists: true,
    };
  },
});

export const getFileUsageStats = query({
  args: { ownerId: v.optional(ownerIdValidator) },
  returns: v.object({
    totalFiles: v.number(),
    totalSize: v.number(),
    fileTypeStats: v.record(v.string(), v.number()),
    averageSize: v.number(),
  }),
  handler: async (ctx, args) => {
    let documents: Array<Doc<'documents'>> = [];

    if (args.ownerId) {
      documents = await ctx.db
        .query('documents')
        .withIndex('by_owner', (q) => q.eq('ownerId', args.ownerId!))
        .collect();
    } else {
      documents = await ctx.db.query('documents').collect();
    }
    const filesWithStorage = documents.filter((doc) => doc.storageId);

    const totalSize = filesWithStorage.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
    const fileTypeStats = filesWithStorage.reduce(
      (stats, doc) => {
        const type = doc.fileType || 'unknown';
        stats[type] = (stats[type] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    return {
      totalFiles: filesWithStorage.length,
      totalSize,
      fileTypeStats,
      averageSize: filesWithStorage.length > 0 ? totalSize / filesWithStorage.length : 0,
    };
  },
});

export const getDocumentWithFileUrl = query({
  args: { documentId: v.id('documents') },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }

    const fileUrl = document.storageId
      ? await ctx.storage.getUrl(document.storageId as Id<'_storage'>)
      : null;

    return {
      ...document,
      fileUrl,
    };
  },
});

export const getDocumentsWithFiles = query({
  args: {
    ownerId: ownerIdValidator,
    ownerType: ownerTypeValidator,
    type: v.optional(documentTypeValidator),
    status: v.optional(documentStatusValidator),
    includeExpired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', args.ownerId).eq('ownerType', args.ownerType),
      )
      .collect();

    if (args.type) {
      documents = documents.filter((doc) => doc.type === args.type);
    }

    if (args.status) {
      documents = documents.filter((doc) => doc.status === args.status);
    }

    if (!args.includeExpired) {
      const now = Date.now();
      documents = documents.filter((doc) => {
        if (doc.expiresAt) {
          return doc.expiresAt > now;
        }
        return true;
      });
    }

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId
          ? await ctx.storage.getUrl(doc.storageId as Id<'_storage'>)
          : null,
      })),
    );

    return documentsWithUrls;
  },
});

export const validateDocumentFile = query({
  args: { documentId: v.id('documents') },
  returns: v.object({
    isValid: v.boolean(),
    error: v.optional(v.string()),
    isExpired: v.optional(v.boolean()),
    isNotYetValid: v.optional(v.boolean()),
    fileUrl: v.optional(v.union(v.null(), v.string())),
    document: v.optional(v.id('documents')),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return {
        isValid: false,
        error: 'Document not found',
        isExpired: undefined,
        isNotYetValid: undefined,
        fileUrl: undefined,
        document: undefined,
      };
    }

    if (!document.storageId) {
      return {
        isValid: false,
        error: 'No file attached',
        isExpired: undefined,
        isNotYetValid: undefined,
        fileUrl: undefined,
        document: undefined,
      };
    }

    const fileUrl = await ctx.storage.getUrl(document.storageId);
    if (!fileUrl) {
      return {
        isValid: false,
        error: 'File not found in storage',
        isExpired: undefined,
        isNotYetValid: undefined,
        fileUrl: undefined,
        document: undefined,
      };
    }

    const now = Date.now();
    const isExpired = document.expiresAt ? document.expiresAt < now : false;
    const isNotYetValid = document.issuedAt ? document.issuedAt > now : false;

    return {
      isValid: !isExpired && !isNotYetValid,
      isExpired,
      isNotYetValid,
      fileUrl,
      document: document._id,
      error: undefined,
    };
  },
});

export const getExpiredDocuments = query({
  args: { ownerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let documents = await ctx.db.query('documents').collect();

    if (args.ownerId) {
      documents = documents.filter((doc) => doc.ownerId === args.ownerId);
    }

    const now = Date.now();
    const expiredDocuments = documents.filter((doc) => {
      return doc.expiresAt && doc.expiresAt < now;
    });

    const documentsWithUrls = await Promise.all(
      expiredDocuments.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId
          ? await ctx.storage.getUrl(doc.storageId as Id<'_storage'>)
          : null,
      })),
    );

    return documentsWithUrls;
  },
});

export const getDocumentFilePreview = query({
  args: { documentId: v.id('documents') },
  returns: v.union(
    v.null(),
    v.object({
      documentId: v.id('documents'),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.optional(v.number()),
      fileUrl: v.string(),
      previewType: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document || !document.storageId) {
      return null;
    }

    const fileUrl = await ctx.storage.getUrl(document.storageId as Id<'_storage'>);
    if (!fileUrl) {
      return null;
    }

    return {
      documentId: args.documentId,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      fileUrl,
      previewType: getPreviewType(document.fileType || ''),
    };
  },
});

export const getFileTypeInfo = query({
  args: { fileType: v.string() },
  returns: v.object({
    fileType: v.string(),
    category: v.string(),
    sizeLimit: v.number(),
    formattedSizeLimit: v.string(),
    allowedTypes: v.array(v.string()),
    isAllowed: v.boolean(),
  }),
  handler: (ctx, args) => {
    const category = getFileCategory(args.fileType);
    const sizeLimit = getSizeLimitForCategory(category);
    const allowedTypes = getAllowedTypesForCategory(category);

    return {
      fileType: args.fileType,
      category,
      sizeLimit,
      formattedSizeLimit: formatBytes(sizeLimit),
      allowedTypes,
      isAllowed: allowedTypes.includes(args.fileType),
    };
  },
});

export const getUploadLimits = query({
  args: { category: v.optional(v.string()) },
  returns: v.union(
    v.object({
      category: v.string(),
      allowedTypes: v.array(v.string()),
      sizeLimit: v.number(),
      formattedSizeLimit: v.string(),
    }),
    v.object({
      categories: v.record(
        v.string(),
        v.object({
          allowedTypes: v.array(v.string()),
          sizeLimit: v.number(),
          formattedSizeLimit: v.string(),
        }),
      ),
    }),
  ),
  handler: (ctx, args) => {
    if (args.category) {
      const categoryKey = args.category.toUpperCase() as FileCategory;
      const allowedTypes = getAllowedTypesForCategory(categoryKey);
      const sizeLimit = getSizeLimitForCategory(categoryKey);

      return {
        category: categoryKey,
        allowedTypes,
        sizeLimit,
        formattedSizeLimit: formatBytes(sizeLimit),
      };
    }

    return {
      categories: {
        IMAGES: {
          allowedTypes: getAllowedTypesForCategory('IMAGES'),
          sizeLimit: getSizeLimitForCategory('IMAGES'),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory('IMAGES')),
        },
        DOCUMENTS: {
          allowedTypes: getAllowedTypesForCategory('DOCUMENTS'),
          sizeLimit: getSizeLimitForCategory('DOCUMENTS'),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory('DOCUMENTS')),
        },
        VIDEOS: {
          allowedTypes: getAllowedTypesForCategory('VIDEOS'),
          sizeLimit: getSizeLimitForCategory('VIDEOS'),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory('VIDEOS')),
        },
        AUDIOS: {
          allowedTypes: getAllowedTypesForCategory('AUDIOS'),
          sizeLimit: getSizeLimitForCategory('AUDIOS'),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory('AUDIOS')),
        },
        ARCHIVES: {
          allowedTypes: getAllowedTypesForCategory('ARCHIVES'),
          sizeLimit: getSizeLimitForCategory('ARCHIVES'),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory('ARCHIVES')),
        },
      },
    };
  },
});

// Helper Functions
function validateFileName(fileName: string): FileValidationResult {
  if (fileName.length === 0) {
    return {
      isValid: false,
      error: 'File name cannot be empty',
    };
  }

  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'File name is too long (maximum 255 characters)',
    };
  }

  const forbiddenChars = /[<>:"/\\|?*]/;
  if (forbiddenChars.test(fileName)) {
    return {
      isValid: false,
      error: 'File name contains forbidden characters',
    };
  }

  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const nameWithoutExt = fileName.split('.')[0].toUpperCase();

  if (reservedNames.includes(nameWithoutExt)) {
    return {
      isValid: false,
      error: 'File name is reserved',
    };
  }

  return { isValid: true };
}

function getPreviewType(fileType: string): string {
  const type = fileType.toLowerCase();

  if (type.startsWith('image/')) {
    return 'image';
  } else if (type.includes('pdf')) {
    return 'pdf';
  } else if (type.includes('text/')) {
    return 'text';
  } else if (type.includes('video/')) {
    return 'video';
  } else if (type.includes('audio/')) {
    return 'audio';
  } else {
    return 'file';
  }
}

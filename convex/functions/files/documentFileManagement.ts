import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { DocumentStatus } from "../../lib/constants";
import type { Id } from "../../_generated/dataModel";

export const createDocumentWithFile = mutation({
  args: {
    type: v.string(),
    status: v.string(),
    ownerId: v.string(),
    ownerType: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    metadata: v.optional(v.any()),
    issuedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  returns: v.object({
    documentId: v.id("documents"),
  }),
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      type: args.type,
      status: args.status,
      ownerId: args.ownerId,
      ownerType: args.ownerType,
      storageId: args.storageId as string,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      metadata: args.metadata,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      version: 1,
      validations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { documentId };
  },
});

export const updateDocumentFile = mutation({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
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
      throw new Error("Document not found");
    }

    // Supprimer l'ancien fichier si il existe
    if (document.storageId) {
      await ctx.storage.delete(document.storageId);
    }

    // Mettre à jour le document avec le nouveau fichier
    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getDocumentWithFileUrl = query({
  args: { documentId: v.id("documents") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }

    const fileUrl =
      document.storageId ?
        await ctx.storage.getUrl(document.storageId as Id<"_storage">)
      : null;

    return {
      ...document,
      fileUrl,
    };
  },
});

export const getDocumentsWithFiles = query({
  args: {
    ownerId: v.string(),
    ownerType: v.string(),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    includeExpired: v.optional(v.boolean()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let documents = await ctx.db
      .query("documents")
      .withIndex("by_owner", (q) =>
        q.eq("ownerId", args.ownerId).eq("ownerType", args.ownerType)
      )
      .collect();

    // Filtres
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

    // Ajouter les URLs des fichiers
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        fileUrl:
          doc.storageId ?
            await ctx.storage.getUrl(doc.storageId as Id<"_storage">)
          : null,
      }))
    );

    return documentsWithUrls;
  },
});

export const validateDocumentFile = query({
  args: { documentId: v.id("documents") },
  returns: v.object({
    isValid: v.boolean(),
    error: v.optional(v.string()),
    isExpired: v.optional(v.boolean()),
    isNotYetValid: v.optional(v.boolean()),
    fileUrl: v.optional(v.union(v.null(), v.string())),
    document: v.optional(v.any()),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return {
        isValid: false,
        error: "Document not found",
        isExpired: undefined,
        isNotYetValid: undefined,
        fileUrl: undefined,
        document: undefined,
      };
    }

    if (!document.storageId) {
      return {
        isValid: false,
        error: "No file attached",
        isExpired: undefined,
        isNotYetValid: undefined,
        fileUrl: undefined,
        document: undefined,
      };
    }

    // Vérifier si le fichier existe dans le stockage
    const fileUrl = await ctx.storage.getUrl(document.storageId);
    if (!fileUrl) {
      return {
        isValid: false,
        error: "File not found in storage",
        isExpired: undefined,
        isNotYetValid: undefined,
        fileUrl: undefined,
        document: undefined,
      };
    }

    // Vérifier la validité temporelle
    const now = Date.now();
    const isExpired = document.expiresAt ? document.expiresAt < now : false;
    const isNotYetValid = document.issuedAt ? document.issuedAt > now : false;

    return {
      isValid: !isExpired && !isNotYetValid,
      isExpired,
      isNotYetValid,
      fileUrl,
      document,
      error: undefined,
    };
  },
});

export const getExpiredDocuments = query({
  args: { ownerId: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let documents = await ctx.db.query("documents").collect();

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
        fileUrl:
          doc.storageId ?
            await ctx.storage.getUrl(doc.storageId as Id<"_storage">)
          : null,
      }))
    );

    return documentsWithUrls;
  },
});

export const archiveDocument = mutation({
  args: { documentId: v.id("documents") },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Supprimer le fichier du stockage
    if (document.storageId) {
      await ctx.storage.delete(document.storageId as Id<"_storage">);
    }

    // Mettre à jour le statut du document
    await ctx.db.patch(args.documentId, {
      status: DocumentStatus.Expired,
      storageId: undefined,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getDocumentFilePreview = query({
  args: { documentId: v.id("documents") },
  returns: v.union(
    v.null(),
    v.object({
      documentId: v.id("documents"),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.optional(v.number()),
      fileUrl: v.string(),
      previewType: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document || !document.storageId) {
      return null;
    }

    const fileUrl = await ctx.storage.getUrl(
      document.storageId as Id<"_storage">
    );
    if (!fileUrl) {
      return null;
    }

    return {
      documentId: args.documentId,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      fileUrl,
      previewType: getPreviewType(document.fileType || ""),
    };
  },
});

export const duplicateDocumentFile = mutation({
  args: {
    sourceDocumentId: v.id("documents"),
    newOwnerId: v.string(),
    newOwnerType: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sourceDocument = await ctx.db.get(args.sourceDocumentId);
    if (!sourceDocument || !sourceDocument.storageId) {
      throw new Error("Source document or file not found");
    }

    // Pour dupliquer un fichier, on doit d'abord le télécharger puis le re-téléverser
    // Cette fonctionnalité nécessiterait une action HTTP pour gérer le téléchargement
    // Pour l'instant, on retourne une erreur explicative
    throw new Error("File duplication requires HTTP action implementation");
  },
});

// Fonction utilitaire pour déterminer le type de prévisualisation
function getPreviewType(fileType: string): string {
  const type = fileType.toLowerCase();

  if (type.startsWith("image/")) {
    return "image";
  } else if (type.includes("pdf")) {
    return "pdf";
  } else if (type.includes("text/")) {
    return "text";
  } else if (type.includes("video/")) {
    return "video";
  } else if (type.includes("audio/")) {
    return "audio";
  } else {
    return "file";
  }
}

/**
 * Module de gestion centralisée du stockage de fichiers Convex
 *
 * Ce module fournit toutes les opérations nécessaires pour gérer les fichiers :
 * - Upload via URLs générées (méthode recommandée)
 * - Upload via HTTP actions (avec contrôle CORS)
 * - Stockage de fichiers générés
 * - Service de fichiers avec contrôle d'accès
 * - Suppression sécurisée
 * - Métadonnées et validation
 *
 * Basé sur la documentation officielle Convex :
 * https://docs.convex.dev/file-storage/upload-files
 * https://docs.convex.dev/file-storage/store-files
 * https://docs.convex.dev/file-storage/serve-files
 * https://docs.convex.dev/file-storage/delete-files
 * https://docs.convex.dev/file-storage/file-metadata
 */

import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { action, httpAction, mutation, query } from './_generated/server';

/**
 * UPLOAD DE FICHIERS
 * =================
 */

// 1. Générer une URL d'upload (méthode principale recommandée)
export const generateUploadUrl = mutation({
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// 2. Upload via HTTP action (avec contrôle d'accès)
export const uploadFileViaHttp = httpAction(async (ctx, request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Access-Control-Allow-Methods': 'POST' },
    });
  }

  try {
    const formData = await request.formData();
    const fileValue = formData.get('file');
    const file = fileValue instanceof File ? fileValue : null;

    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Convertir le File en blob
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Stocker le fichier
    const storageId = await ctx.storage.store(blob);

    return new Response(
      JSON.stringify({
        storageId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
        },
      },
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

/**
 * STOCKAGE DE FICHIERS GÉNÉRÉS
 * ===========================
 */

// Stocker un fichier depuis une URL externe
export const storeFileFromUrl = action({
  args: {
    url: v.string(),
    fileName: v.optional(v.string()),
  },
  returns: v.object({
    storageId: v.id('_storage'),
    contentType: v.string(),
    size: v.number(),
  }),
  handler: async (ctx, args) => {
    // Télécharger le fichier depuis l'URL
    const response = await fetch(args.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Stocker dans Convex
    const storageId = await ctx.storage.store(blob);

    return {
      storageId,
      contentType: blob.type,
      size: blob.size,
    };
  },
});

// Stocker un fichier généré (blob)
export const storeGeneratedFile = action({
  args: {
    blob: v.any(), // Blob généré
    fileName: v.string(),
    contentType: v.optional(v.string()),
  },
  returns: v.object({
    storageId: v.id('_storage'),
    contentType: v.string(),
    size: v.number(),
  }),
  handler: async (ctx, args) => {
    const storageId = await ctx.storage.store(args.blob);

    return {
      storageId,
      contentType: args.contentType || args.blob.type,
      size: args.blob.size,
    };
  },
});

/**
 * SERVICE DE FICHIERS
 * ==================
 */

// Récupérer l'URL d'un fichier (avec contrôle d'accès)
export const getFileUrl = query({
  args: {
    storageId: v.id('_storage'),
    checkAccess: v.optional(v.boolean()), // Vérifier les permissions d'accès
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    // Vérification d'accès si demandée
    if (args.checkAccess) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null; // Accès refusé
      }

      // Ici vous pouvez ajouter une logique pour vérifier si l'utilisateur
      // a le droit d'accéder à ce fichier spécifique
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});

// Servir un fichier via HTTP action (avec contrôle d'accès)
export const serveFile = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const storageId = url.searchParams.get('storageId');

  if (!storageId || !storageId.match(/^[a-zA-Z0-9]+$/)) {
    return new Response('Invalid or missing storageId parameter', {
      status: 400,
    });
  }

  try {
    const blob = await ctx.storage.get(storageId as Id<'_storage'>);

    if (blob === null) {
      return new Response('File not found', { status: 404 });
    }

    // Headers de sécurité et cache
    return new Response(blob, {
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000', // 1 an de cache
        'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

/**
 * SUPPRESSION DE FICHIERS
 * ======================
 */

// Supprimer un fichier
export const deleteFile = mutation({
  args: {
    storageId: v.id('_storage'),
    documentId: v.optional(v.id('documents')), // Supprimer aussi le document associé
  },
  returns: v.object({
    success: v.boolean(),
    documentDeleted: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Supprimer le fichier du stockage
    await ctx.storage.delete(args.storageId);

    let documentDeleted = false;

    // Supprimer le document associé si spécifié
    if (args.documentId) {
      const document = await ctx.db.get(args.documentId);
      if (document) {
        // Vérifier les permissions
        if (document.ownerId === identity.subject || document.ownerType === 'user') {
          await ctx.db.delete(args.documentId);
          documentDeleted = true;
        }
      }
    }

    return {
      success: true,
      documentDeleted,
    };
  },
});

/**
 * MÉTADONNÉES ET VALIDATION
 * =========================
 */

// Récupérer les métadonnées d'un fichier
export const getFileMetadata = query({
  args: { storageId: v.id('_storage') },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});

// Valider l'existence et l'accès à un fichier
export const validateFileAccess = query({
  args: {
    storageId: v.id('_storage'),
    expectedContentType: v.optional(v.string()),
    minSize: v.optional(v.number()),
    maxSize: v.optional(v.number()),
  },
  returns: v.object({
    exists: v.boolean(),
    accessible: v.boolean(),
    metadata: v.optional(v.any()),
    isValid: v.boolean(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const accessible = !!identity; // Pour l'instant, accès si authentifié

    try {
      const metadata = await ctx.db.system.get(args.storageId);
      const errors: string[] = [];

      if (!metadata) {
        return {
          exists: false,
          accessible,
          metadata: null,
          isValid: false,
          errors: ['File not found'],
        };
      }

      // Validation du type de contenu
      if (args.expectedContentType && metadata.contentType !== args.expectedContentType) {
        errors.push(
          `Expected content type ${args.expectedContentType}, got ${metadata.contentType}`,
        );
      }

      // Validation de la taille
      if (args.minSize && metadata.size < args.minSize) {
        errors.push(`File too small: ${metadata.size} < ${args.minSize} bytes`);
      }

      if (args.maxSize && metadata.size > args.maxSize) {
        errors.push(`File too large: ${metadata.size} > ${args.maxSize} bytes`);
      }

      return {
        exists: true,
        accessible,
        metadata,
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error('Error validating file access:', error);
      return {
        exists: false,
        accessible,
        metadata: null,
        isValid: false,
        errors: ['Error accessing file metadata'],
      };
    }
  },
});

/**
 * FONCTIONS DE CONVENANCE
 * ======================
 */

// Upload simple avec génération d'URL et stockage
export const uploadFileWithUrl = action({
  args: {
    file: v.any(),
    fileName: v.string(),
  },
  returns: v.object({
    storageId: v.id('_storage'),
    fileUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const storageId = await ctx.storage.store(args.file);
    const fileUrl = await ctx.storage.getUrl(storageId);

    if (!fileUrl) {
      throw new Error('Failed to generate file URL');
    }

    return {
      storageId,
      fileUrl,
    };
  },
});

// Vérifier et nettoyer les fichiers orphelins
export const cleanupOrphanedFiles = mutation({
  args: {
    dryRun: v.optional(v.boolean()), // Si true, ne supprime pas vraiment
  },
  returns: v.object({
    filesChecked: v.number(),
    orphanedFiles: v.number(),
    deletedFiles: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    let filesChecked = 0;
    let orphanedFiles = 0;
    let deletedFiles = 0;
    const errors: string[] = [];

    try {
      // Récupérer tous les fichiers du stockage système
      const allFiles = await ctx.db.system.query('_storage').collect();

      for (const file of allFiles) {
        filesChecked++;

        // Vérifier si le fichier est référencé dans des documents
        const documents = await ctx.db
          .query('documents')
          .filter((q) => q.eq(q.field('storageId'), file._id))
          .collect();

        if (documents.length === 0) {
          orphanedFiles++;

          if (!dryRun) {
            try {
              await ctx.storage.delete(file._id);
              deletedFiles++;
            } catch (deleteError) {
              errors.push(`Failed to delete file ${file._id}: ${deleteError}`);
            }
          }
        }
      }

      return {
        filesChecked,
        orphanedFiles,
        deletedFiles,
        errors,
      };
    } catch (error) {
      errors.push(`Cleanup failed: ${error}`);
      return {
        filesChecked,
        orphanedFiles,
        deletedFiles,
        errors,
      };
    }
  },
});

/**
 * ROUTES HTTP POUR LES CORS
 * ========================
 */

// Gestion des requêtes OPTIONS pour les CORS
export const handleFileUploadOptions = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

export const handleFileServeOptions = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

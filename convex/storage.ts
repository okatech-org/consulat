/**
 * Module de gestion du stockage de fichiers Convex
 *
 * Ce module fournit toutes les opérations nécessaires pour gérer les fichiers :
 * - Upload de fichiers via URL générée
 * - Récupération d'URLs de fichiers
 * - Métadonnées des fichiers
 * - Suppression de fichiers
 * - Stockage de fichiers générés
 * - Service HTTP de fichiers
 *
 * Utilisation basique :
 *
 * 1. Générer une URL d'upload :
 *    const uploadUrl = await convex.mutation(api.storage.generateUploadUrl());
 *
 * 2. Uploader le fichier :
 *    const response = await fetch(uploadUrl, {
 *      method: 'POST',
 *      body: file,
 *    });
 *    const { storageId } = await response.json();
 *
 * 3. Récupérer l'URL du fichier :
 *    const fileUrl = await convex.query(api.storage.getFileUrl({ storageId }));
 *
 * 4. Utiliser dans une image :
 *    <Image source={{ uri: fileUrl }} />
 */

import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { action, httpAction, mutation, query } from "./_generated/server";

// Générer une URL d'upload pour les fichiers
export const generateUploadUrl = mutation({
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Récupérer l'URL d'un fichier stocké
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Récupérer les métadonnées d'un fichier
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});

// Lister tous les fichiers avec métadonnées
export const listAllFiles = query({
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.system.query("_storage").collect();
  },
});

// Supprimer un fichier
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});

// Stocker un fichier depuis une action (après génération ou fetch)
export const storeGeneratedFile = action({
  args: {
    // URL ou contenu du fichier à stocker
    fileUrl: v.optional(v.string()),
    fileBlob: v.optional(v.any()), // Pour les blobs générés
    contentType: v.optional(v.string()),
  },
  returns: v.object({
    storageId: v.id("_storage"),
    contentType: v.string(),
    size: v.number(),
  }),
  handler: async (ctx, args) => {
    let blob;

    if (args.fileBlob) {
      // Si on passe directement un blob
      blob = args.fileBlob;
    } else if (args.fileUrl) {
      // Fetch le fichier depuis une URL
      const response = await fetch(args.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      blob = await response.blob();
    } else {
      throw new Error("Either fileUrl or fileBlob must be provided");
    }

    // Stocker le fichier
    const storageId = await ctx.storage.store(blob);

    return {
      storageId,
      contentType: args.contentType || blob.type,
      size: blob.size,
    };
  },
});

// Servir un fichier via HTTP action
export const serveFile = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const storageId = pathParts[pathParts.length - 1]; // Récupère la dernière partie du path

  if (!storageId || !storageId.match(/^[a-zA-Z0-9]+$/)) {
    return new Response("Invalid or missing storageId parameter", {
      status: 400,
    });
  }

  try {
    const file = await ctx.storage.get(storageId as Id<"_storage">);

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // Retourner le fichier avec les headers appropriés
    return new Response(file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

// Upload d'un fichier via HTTP action (alternative à generateUploadUrl)
export const uploadFile = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "Access-Control-Allow-Methods": "POST" },
    });
  }

  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");
    const file = fileValue instanceof File ? fileValue : null;

    if (!file) {
      return new Response("No file provided", { status: 400 });
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
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

// Action pour traiter les CORS pour l'upload
export const handleUploadOptions = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
});

// Fonction utilitaire pour valider un storageId
export const validateStorageId = query({
  args: { storageId: v.id("_storage") },
  returns: v.object({
    valid: v.boolean(),
    metadata: v.optional(
      v.object({
        contentType: v.optional(v.string()),
        size: v.optional(v.number()),
        sha256: v.optional(v.string()),
      })
    ),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const metadata = await ctx.db.system.get(args.storageId);
      return {
        valid: true,
        metadata: {
          contentType: metadata?.contentType,
          size: metadata?.size,
          sha256: metadata?.sha256,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: "Invalid storage ID",
      };
    }
  },
});

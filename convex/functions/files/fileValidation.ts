import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { api } from "../../_generated/api";
import {
  formatBytes,
  getAllowedTypesForCategory,
  getFileCategory,
  getSizeLimitForCategory,
  validateFileSize,
  validateFileType,
} from "../../lib/fileTypes";
import type { FileValidationResult } from "../../lib/fileTypes";

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
    results: v.array(v.any()),
    category: v.optional(v.string()),
    sizeLimit: v.optional(v.number()),
    formattedSizeLimit: v.optional(v.string()),
  }),
  handler: (ctx, args) => {
    const results: Array<FileValidationResult> = [];

    // Validation du type de fichier
    const allowedTypes =
      args.category ?
        getAllowedTypesForCategory(args.category as any)
      : Object.values([
          ...getAllowedTypesForCategory("IMAGES"),
          ...getAllowedTypesForCategory("DOCUMENTS"),
          ...getAllowedTypesForCategory("ARCHIVES"),
          ...getAllowedTypesForCategory("VIDEOS"),
          ...getAllowedTypesForCategory("AUDIOS"),
        ]);

    const typeValidation = validateFileType(args.fileType, allowedTypes);
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

    // Validation de la taille
    const category = getFileCategory(args.fileType);
    const sizeLimit = getSizeLimitForCategory(category);
    const sizeValidation = validateFileSize(args.fileSize, sizeLimit);
    results.push(sizeValidation);

    // Validation du nom de fichier
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
        })
      ),
    })
  ),
  handler: (ctx, args) => {
    if (args.category) {
      const categoryKey = args.category.toUpperCase() as any;
      const allowedTypes = getAllowedTypesForCategory(categoryKey);
      const sizeLimit = getSizeLimitForCategory(categoryKey);

      return {
        category: categoryKey,
        allowedTypes,
        sizeLimit,
        formattedSizeLimit: formatBytes(sizeLimit),
      };
    }

    // Retourner tous les types et limites
    return {
      categories: {
        IMAGES: {
          allowedTypes: getAllowedTypesForCategory("IMAGES"),
          sizeLimit: getSizeLimitForCategory("IMAGES"),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory("IMAGES")),
        },
        DOCUMENTS: {
          allowedTypes: getAllowedTypesForCategory("DOCUMENTS"),
          sizeLimit: getSizeLimitForCategory("DOCUMENTS"),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory("DOCUMENTS")),
        },
        VIDEOS: {
          allowedTypes: getAllowedTypesForCategory("VIDEOS"),
          sizeLimit: getSizeLimitForCategory("VIDEOS"),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory("VIDEOS")),
        },
        AUDIOS: {
          allowedTypes: getAllowedTypesForCategory("AUDIOS"),
          sizeLimit: getSizeLimitForCategory("AUDIOS"),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory("AUDIOS")),
        },
        ARCHIVES: {
          allowedTypes: getAllowedTypesForCategory("ARCHIVES"),
          sizeLimit: getSizeLimitForCategory("ARCHIVES"),
          formattedSizeLimit: formatBytes(getSizeLimitForCategory("ARCHIVES")),
        },
      },
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
      })
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
        validation: v.any(),
      })
    ),
    totalSize: v.number(),
    formattedTotalSize: v.string(),
    fileCount: v.number(),
  }),
  handler: (ctx, args) => {
    const results: Array<{
      file: any;
      validation: FileValidationResult;
    }> = [];

    let totalSize = 0;
    const errors: Array<string> = [];

    // Validation du nombre de fichiers
    if (args.maxFiles && args.files.length > args.maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${args.maxFiles}`);
    }

    // Validation de chaque fichier
    for (const file of args.files) {
      // Note: runMutation ne peut pas appeler des mutations du même module
      // On valide directement ici
      const typeValidation = validateFileType(
        file.fileType,
        args.category ?
          getAllowedTypesForCategory(args.category as any)
        : [
            ...getAllowedTypesForCategory("IMAGES"),
            ...getAllowedTypesForCategory("DOCUMENTS"),
            ...getAllowedTypesForCategory("ARCHIVES"),
            ...getAllowedTypesForCategory("VIDEOS"),
            ...getAllowedTypesForCategory("AUDIOS"),
          ]
      );

      const validation = {
        isValid: typeValidation.isValid,
        errors: typeValidation.error ? [typeValidation.error] : [],
        results: [typeValidation],
      };

      results.push({
        file,
        validation: validation.results[0], // Premier résultat (type)
      });

      if (!validation.isValid) {
        errors.push(...validation.errors);
      }

      totalSize += file.fileSize;
    }

    // Validation de la taille totale
    if (args.totalSizeLimit && totalSize > args.totalSizeLimit) {
      errors.push(
        `Total file size ${formatBytes(totalSize)} exceeds limit of ${formatBytes(args.totalSizeLimit)}`
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

function validateFileName(fileName: string): FileValidationResult {
  // Vérifier la longueur du nom
  if (fileName.length === 0) {
    return {
      isValid: false,
      error: "File name cannot be empty",
    };
  }

  if (fileName.length > 255) {
    return {
      isValid: false,
      error: "File name is too long (maximum 255 characters)",
    };
  }

  // Vérifier les caractères interdits
  const forbiddenChars = /[<>:"/\\|?*]/;
  if (forbiddenChars.test(fileName)) {
    return {
      isValid: false,
      error: "File name contains forbidden characters",
    };
  }

  // Vérifier les noms réservés
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];
  const nameWithoutExt = fileName.split(".")[0].toUpperCase();

  if (reservedNames.includes(nameWithoutExt)) {
    return {
      isValid: false,
      error: "File name is reserved",
    };
  }

  return { isValid: true };
}

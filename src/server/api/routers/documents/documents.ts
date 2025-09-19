import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { DocumentType } from '@prisma/client';
import { getUserDocumentsList } from '@/actions/documents';

// Type optimisé pour le dashboard des documents
export type DashboardDocument = {
  id: string;
  type: DocumentType;
  fileUrl: string;
  fileType: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown> | null;
};

// Sélection optimisée pour la liste des documents
const DashboardDocumentSelect = {
  select: {
    id: true,
    type: true,
    status: true,
    fileUrl: true,
    fileType: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
  },
} as const;

export const documentsRouter = createTRPCRouter({
  // Nouvelle procédure optimisée pour le dashboard
  getUserDocumentsDashboard: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          type: z.nativeEnum(DocumentType).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const type = input?.type;

      try {
        const documents = await ctx.db.userDocument.findMany({
          where: {
            userId: ctx.auth.userId,
            ...(type && { type }),
          },
          ...DashboardDocumentSelect,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        if (documents.length > limit) {
          const nextItem = documents.pop();
          nextCursor = nextItem!.id;
        }

        const totalCount = await ctx.db.userDocument.count({
          where: {
            userId: ctx.auth.userId,
            ...(type && { type }),
          },
        });

        return {
          documents: documents as DashboardDocument[],
          nextCursor,
          totalCount,
          hasMore: documents.length === limit + 1,
        };
      } catch (error) {
        console.error('Error fetching dashboard documents:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des documents',
        });
      }
    }),

  // Récupérer les documents de l'utilisateur (ancienne version)
  getUserDocuments: protectedProcedure.query(async () => {
    try {
      const documents = await getUserDocumentsList();
      return documents;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des documents',
      });
    }
  }),

  // Récupérer un document par ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.userDocument.findUnique({
        where: { id: input.id },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document non trouvé',
        });
      }

      // Vérifier l'autorisation
      if (document.userId !== ctx.auth.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Non autorisé à accéder à ce document',
        });
      }

      return document;
    }),

  // Créer un document (metadata après upload)
  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        key: z.string(),
        name: z.string(),
        type: z.nativeEnum(DocumentType),
        size: z.number(),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.userDocument.create({
        data: {
          type: input.type,
          fileUrl: input.url,
          fileType: 'application/octet-stream', // À améliorer selon le type de fichier
          metadata: {
            ...input.metadata,
            name: input.name,
            size: input.size,
            fileKey: input.key,
          },
          userId: ctx.auth.userId,
        },
      });

      return document;
    }),

  // Mettre à jour les métadonnées d'un document
  updateMetadata: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        metadata: z.record(z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, metadata } = input;

      // Vérifier que le document existe et appartient à l'utilisateur
      const document = await ctx.db.userDocument.findUnique({
        where: { id },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document non trouvé',
        });
      }

      if (document.userId !== ctx.auth.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Non autorisé à modifier ce document',
        });
      }

      // Mettre à jour les métadonnées
      const updatedDocument = await ctx.db.userDocument.update({
        where: { id },
        data: {
          metadata,
        },
      });

      return updatedDocument;
    }),

  // Supprimer un document
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Vérifier que le document existe et appartient à l'utilisateur
      const document = await ctx.db.userDocument.findUnique({
        where: { id },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document non trouvé',
        });
      }

      if (document.userId !== ctx.auth.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Non autorisé à supprimer ce document',
        });
      }

      // Supprimer le document
      await ctx.db.userDocument.delete({
        where: { id },
      });

      // TODO: Supprimer le fichier physique via UploadThing

      return { success: true };
    }),
});

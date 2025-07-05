import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { DocumentType } from '@prisma/client';
import { getUserDocumentsList } from '@/actions/documents';

export const documentsRouter = createTRPCRouter({
  // Récupérer les documents de l'utilisateur
  getUserDocuments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const documents = await getUserDocumentsList();
      return documents;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération des documents',
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
      if (document.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Non autorisé à accéder à ce document',
        });
      }

      return document;
    }),

  // Créer un document (metadata après upload)
  create: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      key: z.string(),
      name: z.string(),
      type: z.nativeEnum(DocumentType),
      size: z.number(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.userDocument.create({
        data: {
          name: input.name,
          type: input.type,
          size: input.size,
          fileUrl: input.url,
          fileKey: input.key,
          fileType: 'application/octet-stream', // À améliorer selon le type de fichier
          metadata: input.metadata,
          userId: ctx.session.user.id,
        },
      });

      return document;
    }),

  // Mettre à jour les métadonnées d'un document
  updateMetadata: protectedProcedure
    .input(z.object({
      id: z.string(),
      metadata: z.record(z.any()),
    }))
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

      if (document.userId !== ctx.session.user.id) {
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

      if (document.userId !== ctx.session.user.id) {
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

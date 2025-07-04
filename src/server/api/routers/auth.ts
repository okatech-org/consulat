import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { vonageService } from '@/server/services/vonage';
import { TRPCError } from '@trpc/server';
import type { Channels } from '@vonage/verify2';

// Déterminer le type et le canal selon l'identifiant
function getIdentifierType(identifier: string): {
  type: 'SMS' | 'EMAIL';
  channel: Channels;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  if (emailRegex.test(identifier)) {
    return { type: 'EMAIL', channel: 'email' as Channels };
  } else if (phoneRegex.test(identifier)) {
    return { type: 'SMS', channel: 'sms' as Channels };
  } else {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        "Format d'identifiant invalide. Utilisez un email ou un téléphone au format international.",
    });
  }
}

export const authRouter = createTRPCRouter({
  // Envoyer un code de vérification unifié
  sendVerificationCode: publicProcedure
    .input(z.object({ identifier: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, channel } = getIdentifierType(input.identifier);

        // Envoyer le code via Vonage
        const result = await vonageService.sendVerificationCode(
          input.identifier,
          channel,
        );

        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || "Erreur lors de l'envoi du code",
          });
        }

        // Stocker le requestId de Vonage
        await ctx.db.oTPCode.upsert({
          where: {
            identifier_type: {
              identifier: input.identifier,
              type: type,
            },
          },
          create: {
            identifier: input.identifier,
            code: result.requestId!, // Stocker le requestId de Vonage
            type: type,
            expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          },
          update: {
            code: result.requestId!, // Stocker le requestId de Vonage
            attempts: 0,
            verified: false,
            expires: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        return { success: true };
      } catch (error) {
        console.error('Erreur sendVerificationCode:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : "Erreur lors de l'envoi du code",
        });
      }
    }),

  resendCode: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
        type: z.enum(['SMS', 'EMAIL']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Vérifier qu'un code existe
        const existingCode = await ctx.db.oTPCode.findUnique({
          where: {
            identifier_type: {
              identifier: input.identifier,
              type: input.type,
            },
          },
        });

        if (!existingCode) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aucune demande de vérification en cours',
          });
        }

        const { channel } = getIdentifierType(input.identifier);

        // Envoyer un nouveau code via Vonage
        const result = await vonageService.sendVerificationCode(
          input.identifier,
          channel,
        );

        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || "Erreur lors de l'envoi du code",
          });
        }

        // Mettre à jour avec le nouveau requestId
        await ctx.db.oTPCode.update({
          where: { id: existingCode.id },
          data: {
            code: result.requestId!,
            attempts: 0,
            verified: false,
            expires: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        return { success: true };
      } catch (error) {
        console.error('Erreur resendCode:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Erreur lors du renvoi du code',
        });
      }
    }),

  // Récupérer les pays actifs pour l'inscription
  getActiveCountries: publicProcedure.query(async ({ ctx }) => {
    try {
      const countries = await ctx.db.country.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          code: true,
          flag: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return countries;
    } catch (error) {
      console.error('Erreur getActiveCountries:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors du chargement des pays',
      });
    }
  }),
});

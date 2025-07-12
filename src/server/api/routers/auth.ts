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

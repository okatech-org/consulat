import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

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

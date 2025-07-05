import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { getUserSession } from '@/lib/getters';

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    // Récupérer d'abord l'utilisateur de base pour obtenir son rôle
    const baseUser = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { id: true, role: true },
    });

    if (!baseUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer les données complètes selon le rôle
    const user = await getUserSession(ctx.session.user.id, baseUser.role);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});

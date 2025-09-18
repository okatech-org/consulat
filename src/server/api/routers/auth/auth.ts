import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const CreateUserSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  countryCode: z.string().min(1, 'Code pays requis'),
  clerkId: z.string().min(1, 'Clerk ID requis'),
});

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

  // Créer un utilisateur après inscription Clerk
  createUser: publicProcedure.input(CreateUserSchema).mutation(async ({ ctx, input }) => {
    try {
      // Vérifier que le pays existe
      const country = await ctx.db.country.findFirst({
        where: {
          code: input.countryCode,
          status: 'ACTIVE',
        },
      });

      if (!country) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Pays non supporté',
        });
      }

      // Créer l'utilisateur et son profil en transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Créer l'utilisateur
        const newUser = await tx.user.create({
          data: {
            clerkId: input.clerkId,
            email: input.email || null,
            phoneNumber: input.phoneNumber || null,
            name: `${input.firstName} ${input.lastName}`,
            roles: [UserRole.USER],
            countryCode: input.countryCode,
            emailVerified: input.email ? new Date() : null,
            phoneNumberVerified: input.phoneNumber ? true : false,
          },
        });

        // Créer le profil associé
        const profile = await tx.profile.create({
          data: {
            userId: newUser.id,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email || null,
            phoneNumber: input.phoneNumber || null,
            residenceCountyCode: input.countryCode,
            category: 'ADULT',
          },
        });

        // Mettre à jour l'utilisateur avec l'ID du profil
        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { profileId: profile.id },
        });

        // Mettre à jour les métadonnées publiques dans Clerk
        if (updatedUser.clerkId) {
          try {
            await clerkClient.users.updateUserMetadata(updatedUser.clerkId, {
              publicMetadata: {
                profileId: profile.id,
                roles: [UserRole.USER],
                countryCode: input.countryCode,
              },
            });
          } catch (error) {
            console.error(
              'Erreur mise à jour des métadonnées publiques dans Clerk:',
              error,
            );
          }
        }

        return {
          userId: updatedUser.id,
          profileId: profile.id,
        };
      });

      return result;
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "Erreur lors de la création de l'utilisateur",
      });
    }
  }),
});

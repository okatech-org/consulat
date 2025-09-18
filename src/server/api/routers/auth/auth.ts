import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';
import { getCountryCodeFromInternationPhoneNumber } from '@/lib/autocomplete-datas';
import { tryCatch } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

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

  handleNewUser: publicProcedure
    .input(
      z.object({
        clerkId: z.string().min(1, 'Clerk ID requis'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const t = await getTranslations('auth.login.errors');

      // Vérifier si l'utilisateur existe déjà
      const { error: userCheckError, data: existingUser } = await tryCatch(
        ctx.db.user.findFirst({
          where: { clerkId: input.clerkId },
        }),
      );

      if (userCheckError) {
        console.error('Erreur vérification utilisateur existant:', userCheckError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: t('user_verification_failed'),
        });
      }

      if (existingUser) {
        return;
      }

      // Récupérer les données utilisateur depuis Clerk
      const { error: clerkError, data: clerkUser } = await tryCatch(
        clerkClient.users.getUser(input.clerkId),
      );

      if (clerkError || !clerkUser) {
        console.error('Erreur récupération utilisateur Clerk:', clerkError);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: t('user_not_found_clerk'),
        });
      }

      // Extraire et valider les données
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber;

      if (!email && !phoneNumber) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: t('user_missing_contact'),
        });
      }

      const countryCode = getCountryCodeFromInternationPhoneNumber(phoneNumber || '');

      if (!countryCode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: t('country_code_not_found'),
        });
      }

      // Créer l'utilisateur et son profil en transaction
      const { error: createError, data: result } = await tryCatch(
        ctx.db.$transaction(async (tx) => {
          // Créer l'utilisateur
          const newUser = await tx.user.create({
            data: {
              clerkId: input.clerkId,
              email: email,
              phoneNumber: phoneNumber,
              name: `${clerkUser.firstName} ${clerkUser.lastName}`,
              roles: [UserRole.USER],
              countryCode: countryCode,
              emailVerified: email ? new Date() : null,
              phoneNumberVerified: phoneNumber ? true : false,
            },
          });

          // Créer le profil associé
          const profile = await tx.profile.create({
            data: {
              userId: newUser.id,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              email: email,
              phoneNumber: phoneNumber,
              residenceCountyCode: countryCode,
              category: 'ADULT',
            },
          });

          // Mettre à jour l'utilisateur avec l'ID du profil
          const updatedUser = await tx.user.update({
            where: { id: newUser.id },
            data: { profileId: profile.id },
          });

          return {
            user: updatedUser,
            profile: profile,
          };
        }),
      );

      if (createError || !result) {
        console.error('Erreur création utilisateur:', createError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: t('user_creation_failed'),
        });
      }

      // Mettre à jour les métadonnées publiques dans Clerk
      const { error: metadataError } = await tryCatch(
        clerkClient.users.updateUserMetadata(input.clerkId, {
          publicMetadata: {
            profileId: result.profile.id,
            roles: [UserRole.USER],
            countryCode: countryCode,
            userId: result.user.id,
          },
        }),
      );

      if (metadataError) {
        console.error('Erreur mise à jour métadonnées Clerk:', metadataError);
        // Ne pas faire échouer la création pour une erreur de métadonnées
      }

      return {
        userId: result.user.id,
        profileId: result.profile.id,
        message: t('user_creation_success'),
      };
    }),
});

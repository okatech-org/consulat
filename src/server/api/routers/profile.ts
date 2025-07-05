import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { 
  FullProfileUpdateSchema,
  ProfileSectionSchema,
  CreateProfileSchema 
} from '@/schemas/registration';
import { 
  createUserProfile,
  updateProfile as updateProfileAction,
  submitProfileForValidation as submitProfileAction,
  getRegistrationServiceForUser 
} from '@/actions/profile';
import { getUserFullProfile, getProfileRegistrationRequest, getUserFullProfileById } from '@/lib/user/getters';

export const profileRouter = createTRPCRouter({
  // Récupérer le profil de l'utilisateur actuel
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getUserFullProfile(ctx.session.user.id);

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile non trouvé',
      });
    }

    return profile;
  }),

  // Récupérer un profil par ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await getUserFullProfileById(input.id);

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile non trouvé',
        });
      }

      return profile;
    }),

  // Récupérer la demande d'enregistrement d'un profil
  getRegistrationRequest: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await getProfileRegistrationRequest(input.profileId);
      return request;
    }),

  // Créer un profil utilisateur
  create: protectedProcedure
    .input(CreateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const profile = await createUserProfile(input, ctx.session.user.id);
        return profile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la création du profil',
        });
      }
    }),

  // Mettre à jour un profil
  update: protectedProcedure
    .input(z.object({
      profileId: z.string(),
      data: FullProfileUpdateSchema.partial(),
      requestId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { profileId, data, requestId } = input;

      try {
        const updatedProfile = await updateProfileAction(profileId, data, requestId);
        return updatedProfile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
        });
      }
    }),

  // Mettre à jour une section du profil
  updateSection: protectedProcedure
    .input(z.object({
      profileId: z.string(),
      section: z.enum(['basicInfo', 'contactInfo', 'familyInfo', 'professionalInfo', 'documents']),
      data: ProfileSectionSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { profileId, section, data } = input;

      // Vérifier que le profil appartient à l'utilisateur
      const profile = await ctx.db.profile.findFirst({
        where: {
          id: profileId,
          userId: ctx.session.user.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile non trouvé ou non autorisé',
        });
      }

      // Extraire les données de la section
      const sectionData = data[section];
      if (!sectionData) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Données de section manquantes',
        });
      }

      try {
        const updatedProfile = await updateProfileAction(profileId, sectionData);
        return updatedProfile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la section',
        });
      }
    }),

  // Soumettre un profil pour validation
  submit: protectedProcedure
    .input(z.object({
      profileId: z.string(),
      isChild: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { profileId, isChild } = input;

      try {
        const submittedProfile = await submitProfileAction(profileId, isChild);
        return submittedProfile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Erreur lors de la soumission du profil',
        });
      }
    }),

  // Récupérer le service d'enregistrement pour l'utilisateur
  getRegistrationService: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.countryCode) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Code pays manquant',
      });
    }

    const service = await getRegistrationServiceForUser(ctx.session.user.countryCode);
    return service;
  }),
});

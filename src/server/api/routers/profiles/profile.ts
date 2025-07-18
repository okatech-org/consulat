import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import {
  FullProfileUpdateSchema,
  ProfileSectionSchema,
  CreateProfileSchema,
  BasicInfoSchema,
} from '@/schemas/registration';
import { FullProfileInclude, DashboardProfileSelect } from '@/types/profile';
import {
  createUserProfile,
  updateProfile as updateProfileAction,
  submitProfileForValidation as submitProfileAction,
} from '@/actions/profile';
import { getProfileRegistrationRequest } from '@/lib/user/getters';
import type { RouterOutputs } from '@/trpc/react';
import { getUserSession } from '@/lib/getters';
import { NotificationType, ParentalRole, RequestStatus } from '@prisma/client';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { LinkInfoSchema } from '@/schemas/child-registration';
import {
  FullParentalAuthorityInclude,
  DashboardChildProfileSelect,
} from '@/types/parental-authority';
import type { CountryCode } from '@/lib/autocomplete-datas';
import type { OrganizationMetadataSettings } from '@/schemas/organization';
import { db } from '@/server/db';

export const profileRouter = createTRPCRouter({
  // Récupérer le profil optimisé pour le dashboard
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await ctx.db.profile.findFirst({
        where: { userId: ctx.session.user.id },
        ...DashboardProfileSelect,
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile non trouvé',
        });
      }

      return profile;
    } catch (error) {
      console.error('Error fetching dashboard profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération du profil',
      });
    }
  }),

  getCurrentOrganizationContactData: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.profile.findFirst({
      where: { userId: ctx.session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedOrganization: true,
        residenceCountyCode: true,
      },
    });

    const metadata: Record<
      CountryCode,
      {
        settings: OrganizationMetadataSettings;
      }
    > = JSON.parse((profile?.assignedOrganization?.metadata as string) ?? '{}');

    const userCountryCode = profile?.residenceCountyCode;

    const userMetadata = metadata[userCountryCode as CountryCode];

    return userMetadata?.settings;
  }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await ctx.db.profile.findFirst({
        where: { userId: ctx.session.user.id },
        ...FullProfileInclude,
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile non trouvé',
        });
      }

      return profile;
    } catch (error) {
      console.error('Error fetching current profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération du profil',
      });
    }
  }),

  // Récupérer un profil par ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const profile = await ctx.db.profile.findUnique({
          where: { id: input.id },
          ...FullProfileInclude,
        });

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profile non trouvé',
          });
        }

        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Error fetching profile by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du profil',
        });
      }
    }),

  // Rechercher un profil par email ou téléphone
  getByQuery: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
        profileId: z.string().optional(),
        providedProfile: z.any().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.providedProfile) {
        return input.providedProfile;
      }

      try {
        const user = await ctx.db.user.findFirst({
          where: {
            ...(input.userId && { id: input.userId }),
            ...(input.email && { email: input.email }),
            ...(input.phoneNumber && { phoneNumber: input.phoneNumber }),
            ...(input.profileId && { profileId: input.profileId }),
          },
          include: {
            profile: {
              ...FullProfileInclude,
            },
          },
        });

        if (!user?.profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profil non trouvé',
          });
        }

        return user.profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Error finding profile by contact:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la recherche du profil',
        });
      }
    }),

  // Récupérer la demande d'enregistrement d'un profil
  getRegistrationRequest: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ input }) => {
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
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la création du profil',
        });
      }
    }),

  // Mettre à jour un profil
  update: protectedProcedure
    .input(
      z.object({
        profileId: z.string(),
        data: FullProfileUpdateSchema.partial(),
        requestId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { profileId, data, requestId } = input;

      try {
        const updatedProfile = await updateProfileAction(profileId, data, requestId);
        return updatedProfile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la mise à jour du profil',
        });
      }
    }),

  // Mettre à jour une section du profil
  updateSection: protectedProcedure
    .input(
      z.object({
        profileId: z.string(),
        section: z.enum([
          'basicInfo',
          'contactInfo',
          'familyInfo',
          'professionalInfo',
          'documents',
        ]),
        data: ProfileSectionSchema,
      }),
    )
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
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la mise à jour de la section',
        });
      }
    }),

  // Soumettre un profil pour validation
  submit: protectedProcedure
    .input(
      z.object({
        profileId: z.string(),
        isChild: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const { profileId, isChild } = input;

      try {
        const submittedProfile = await submitProfileAction(profileId, isChild);
        return submittedProfile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Erreur lors de la soumission du profil',
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

    try {
      const service = await db.consularService.findFirst({
        where: {
          countryCode: ctx.session.user.countryCode,
          category: 'REGISTRATION',
        },
      });

      return service;
    } catch (error) {
      console.error('Error fetching registration service:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "Erreur lors de la récupération du service d'enregistrement",
      });
    }
  }),

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

  /**
   * Récupérer les profils enfants d'un utilisateur (parent)
   */
  getByParent: protectedProcedure
    .input(
      z
        .object({
          parentId: z.string().optional(),
          includeInactive: z.boolean().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId || ctx.session.user.id;

      // Vérifier que l'utilisateur peut voir ces profils
      if (
        parentId !== ctx.session.user.id &&
        !ctx.session.user.roles?.includes('ADMIN')
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Non autorisé à voir ces profils enfants',
        });
      }

      try {
        const parentalAuthorities = await ctx.db.parentalAuthority.findMany({
          where: {
            parentUserId: parentId,
            ...(input?.includeInactive ? {} : { isActive: true }),
          },
          include: FullParentalAuthorityInclude,
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          parentalAuthorities,
          total: parentalAuthorities.length,
        };
      } catch (error) {
        console.error('Error fetching child profiles:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des profils enfants',
        });
      }
    }),

  /**
   * Récupérer la liste des profils publics
   */
  getList: publicProcedure.query(async ({ ctx }) => {
    try {
      const profiles = await ctx.db.profile.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          residenceCountyCode: true,
          identityPicture: {
            select: {
              fileUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        where: {
          firstName: {
            not: null,
          },
          lastName: {
            not: null,
          },
          status: {
            in: ['VALIDATED', 'COMPLETED'], // Seulement les profils validés
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return profiles;
    } catch (error) {
      console.error('Error fetching public profiles:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération des profils publics',
      });
    }
  }),

  /**
   * Envoyer un message à un propriétaire de profil
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        message: z
          .string()
          .min(10, 'Le message doit contenir au moins 10 caractères')
          .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
        recipientEmail: z.string().email(),
        from: z.string().min(1, "L'expéditeur est obligatoire"),
        contact: z.string().min(1, 'Le contact est obligatoire'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, message, recipientEmail, from, contact } = input;

        const notificationContent = `${from} vous a envoyé un message. \n\n${message} \n\nVous pouvez le contacter via : ${contact}`;

        // Créer le message dans la base de données
        const createdMessage = await ctx.db.message.create({
          data: {
            content: notificationContent,
            receiverId: userId,
            senderId: ctx.session.user.id,
          },
        });

        const notificationTitle = 'Vous avez reçu un message de contact';

        // Créer une notification
        try {
          await notify({
            userId: userId,
            type: NotificationType.REQUEST_NEW,
            title: notificationTitle,
            message: notificationContent,
            channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
            email: recipientEmail,
            metadata: {
              messageId: createdMessage.id,
              senderId: ctx.session.user.id,
              senderName: from,
            },
          });
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Ne pas faire échouer la mutation si la notification échoue
        }

        return {
          message: createdMessage,
          success: true,
        };
      } catch (error) {
        console.error('Error sending profile message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Erreur lors de l'envoi du message",
        });
      }
    }),

  /**
   * Créer un nouveau profil enfant avec autorité parentale
   */
  createChildProfile: protectedProcedure
    .input(LinkInfoSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.$transaction(async (tx) => {
          // 1. Créer le profil enfant
          const profile = await tx.profile.create({
            data: {
              residenceCountyCode: ctx.session.user.countryCode || '',
              category: 'MINOR',
              status: RequestStatus.DRAFT,
            },
          });

          // 2. Créer l'autorité parentale pour l'utilisateur actuel
          await tx.parentalAuthority.create({
            data: {
              profileId: profile.id,
              parentUserId: ctx.session.user.id,
              role: input.parentRole,
              isActive: true,
            },
          });

          // 3. Gérer l'autre parent si spécifié
          if (input.hasOtherParent && input.otherParentEmail && input.otherParentRole) {
            const searchCriteria = [];

            if (input.otherParentEmail) {
              searchCriteria.push({ email: input.otherParentEmail });
            }

            if (input.otherParentPhone) {
              searchCriteria.push({ phoneNumber: input.otherParentPhone });
            }

            if (searchCriteria.length > 0) {
              const otherParent = await tx.user.findFirst({
                where: { OR: searchCriteria },
              });

              if (otherParent) {
                await tx.parentalAuthority.create({
                  data: {
                    profileId: profile.id,
                    parentUserId: otherParent.id,
                    role: input.otherParentRole,
                    isActive: true,
                  },
                });
              }
            }
          }

          return profile;
        });

        revalidatePath(ROUTES.user.children);

        return {
          id: result.id,
          message: 'Profil enfant créé avec succès',
        };
      } catch (error) {
        console.error('Error creating child profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création du profil enfant',
        });
      }
    }),

  /**
   * Supprimer un profil enfant (seulement si DRAFT)
   */
  deleteChildProfile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Vérifier l'autorité parentale
        const hasAuthority = await ctx.db.parentalAuthority.findFirst({
          where: {
            profileId: input.id,
            parentUserId: ctx.session.user.id,
            isActive: true,
          },
        });

        if (!hasAuthority && !ctx.session.user.roles?.includes('ADMIN')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Non autorisé à supprimer ce profil',
          });
        }

        // Vérifier que le profil est en mode DRAFT
        const profile = await ctx.db.profile.findUnique({
          where: { id: input.id },
          select: {
            status: true,
            parentAuthorities: true,
            requestsFor: true,
            residentContact: true,
            homeLandContact: true,
            identityPicture: { select: { id: true } },
            passport: { select: { id: true } },
            birthCertificate: { select: { id: true } },
            residencePermit: { select: { id: true } },
            addressProof: { select: { id: true } },
          },
        });

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profil non trouvé',
          });
        }

        if (profile.status !== RequestStatus.DRAFT) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Seuls les profils en brouillon peuvent être supprimés',
          });
        }

        // Supprimer avec transaction
        await ctx.db.$transaction(async (tx) => {
          // 1. Supprimer les autorités parentales
          await tx.parentalAuthority.deleteMany({
            where: { profileId: input.id },
          });

          // 2. Supprimer les demandes de service
          if (profile.requestsFor) {
            await tx.serviceRequest.deleteMany({
              where: { requestedForId: input.id },
            });
          }

          // 3. Supprimer les contacts d'urgence
          if (profile.residentContact) {
            await tx.emergencyContact.delete({
              where: { residentProfileId: input.id },
            });
          }
          if (profile.homeLandContact) {
            await tx.emergencyContact.delete({
              where: { homeLandProfileId: input.id },
            });
          }

          // 4. Supprimer les documents
          const documentIds = [
            profile.identityPicture?.id,
            profile.passport?.id,
            profile.birthCertificate?.id,
            profile.residencePermit?.id,
            profile.addressProof?.id,
          ].filter((id): id is string => id !== undefined && id !== null);

          if (documentIds.length > 0) {
            await tx.userDocument.deleteMany({
              where: { id: { in: documentIds } },
            });
          }

          // 5. Supprimer le profil
          await tx.profile.delete({
            where: { id: input.id },
          });
        });

        revalidatePath(ROUTES.user.children);

        return {
          success: true,
          message: 'Profil enfant supprimé avec succès',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Error deleting child profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la suppression du profil',
        });
      }
    }),

  /**
   * Soumettre un profil enfant pour validation
   */
  submitChildProfileForValidation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Vérifier l'autorité parentale
        const hasAuthority = await ctx.db.parentalAuthority.findFirst({
          where: {
            profileId: input.id,
            parentUserId: ctx.session.user.id,
            isActive: true,
          },
        });

        if (!hasAuthority && !ctx.session.user.roles?.includes('ADMIN')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Non autorisé à soumettre ce profil',
          });
        }

        // Récupérer le profil complet pour validation
        const profile = await ctx.db.profile.findUnique({
          where: { id: input.id },
          ...FullProfileInclude,
        });

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profil non trouvé',
          });
        }

        // Validation des champs requis pour un enfant
        const requiredFields = [
          'firstName',
          'lastName',
          'birthDate',
          'birthPlace',
          'nationality',
        ];
        const missingFields = requiredFields.filter(
          (field) => !profile[field as keyof typeof profile],
        );

        if (missingFields.length > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Champs requis manquants: ${missingFields.join(', ')}`,
          });
        }

        // Validation des documents requis (acte de naissance au minimum)
        if (!profile.birthCertificate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "L'acte de naissance est requis",
          });
        }

        // Trouver le service d'enregistrement
        const registrationService = await ctx.db.consularService.findFirst({
          where: {
            countryCode: ctx.session.user.countryCode,
            category: 'REGISTRATION',
          },
        });

        if (!registrationService) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "Service d'enregistrement non trouvé",
          });
        }

        // Créer la demande de service et mettre à jour le profil
        const result = await ctx.db.$transaction(async (tx) => {
          const serviceRequest = await tx.serviceRequest.create({
            data: {
              serviceCategory: 'REGISTRATION',
              organizationId: registrationService.organizationId || '',
              countryCode: ctx.session.user.countryCode!,
              submittedById: ctx.session.user.id,
              serviceId: registrationService.id,
              requestedForId: input.id,
            },
          });

          const updatedProfile = await tx.profile.update({
            where: { id: input.id },
            data: {
              status: RequestStatus.SUBMITTED,
              submittedAt: new Date(),
              validationRequestId: serviceRequest.id,
            },
            ...FullProfileInclude,
          });

          return { profile: updatedProfile, serviceRequest };
        });

        revalidatePath(ROUTES.user.child_profile(input.id));
        revalidatePath(ROUTES.user.children);

        return {
          profile: result.profile,
          serviceRequestId: result.serviceRequest.id,
          message: 'Profil soumis pour validation avec succès',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Error submitting child profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la soumission du profil',
        });
      }
    }),

  /**
   * Mettre à jour les informations de base d'un profil enfant
   */
  updateBasicInfo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: BasicInfoSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Vérifier l'autorité parentale
        const hasAuthority = await ctx.db.parentalAuthority.findFirst({
          where: {
            profileId: input.id,
            parentUserId: ctx.session.user.id,
            isActive: true,
          },
        });

        if (!hasAuthority && !ctx.session.user.roles?.includes('ADMIN')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Non autorisé à modifier ce profil',
          });
        }

        // Formater les dates si présentes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { ...input.data };
        if (updateData.birthDate) {
          updateData.birthDate = new Date(updateData.birthDate);
        }
        if (updateData.passportIssueDate) {
          updateData.passportIssueDate = new Date(updateData.passportIssueDate);
        }
        if (updateData.passportExpiryDate) {
          updateData.passportExpiryDate = new Date(updateData.passportExpiryDate);
        }

        const updatedProfile = await ctx.db.profile.update({
          where: { id: input.id },
          data: updateData,
          ...FullProfileInclude,
        });

        revalidatePath(ROUTES.user.child_profile(input.id));

        return {
          profile: updatedProfile,
          message: 'Profil mis à jour avec succès',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Error updating child profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour du profil',
        });
      }
    }),

  /**
   * Mettre à jour l'autorité parentale
   */
  updateParentalAuthority: protectedProcedure
    .input(
      z.object({
        profileId: z.string(),
        parentUserId: z.string(),
        role: z.nativeEnum(ParentalRole).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Vérifier que l'utilisateur peut modifier cette autorité
        const existingAuthority = await ctx.db.parentalAuthority.findFirst({
          where: {
            profileId: input.profileId,
            parentUserId: input.parentUserId,
          },
        });

        if (!existingAuthority) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Autorité parentale non trouvée',
          });
        }

        // Seul un parent ou un admin peut modifier
        const canModify =
          ctx.session.user.id === input.parentUserId ||
          ctx.session.user.roles?.includes('ADMIN');

        if (!canModify) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Non autorisé à modifier cette autorité parentale',
          });
        }

        const updatedAuthority = await ctx.db.parentalAuthority.update({
          where: {
            id: existingAuthority.id,
          },
          data: {
            ...(input.role && { role: input.role }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
          },
          include: FullParentalAuthorityInclude,
        });

        revalidatePath(ROUTES.user.children);

        return {
          authority: updatedAuthority,
          message: 'Autorité parentale mise à jour',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error('Error updating parental authority:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Erreur lors de la mise à jour de l'autorité parentale",
        });
      }
    }),

  /**
   * Obtenir les statistiques des profils enfants pour un parent
   */
  getChildProfileStats: protectedProcedure
    .input(z.object({ parentId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId || ctx.session.user.id;

      try {
        const [total, byStatus] = await Promise.all([
          // Total des profils enfants
          ctx.db.parentalAuthority.count({
            where: {
              parentUserId: parentId,
              isActive: true,
            },
          }),

          // Répartition par statut
          ctx.db.parentalAuthority.findMany({
            where: {
              parentUserId: parentId,
              isActive: true,
            },
            include: {
              profile: {
                select: { status: true },
              },
            },
          }),
        ]);

        const statusCounts = byStatus.reduce(
          (acc, auth) => {
            const status = auth.profile.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        return {
          totalChildren: total,
          draftProfiles: statusCounts.DRAFT || 0,
          submittedProfiles: statusCounts.SUBMITTED || 0,
          validatedProfiles: statusCounts.VALIDATED || 0,
          completedProfiles: statusCounts.COMPLETED || 0,
          statusBreakdown: statusCounts,
        };
      } catch (error) {
        console.error('Error fetching child profiles stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des statistiques',
        });
      }
    }),

  /**
   * Récupérer les profils enfants optimisés pour le dashboard
   */
  getChildrenForDashboard: protectedProcedure
    .input(z.object({ parentId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId || ctx.session.user.id;

      // Vérifier que l'utilisateur peut voir ces profils
      if (
        parentId !== ctx.session.user.id &&
        !ctx.session.user.roles?.includes('ADMIN')
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Non autorisé à voir ces profils enfants',
        });
      }

      try {
        const parentalAuthorities = await ctx.db.parentalAuthority.findMany({
          where: {
            parentUserId: parentId,
            isActive: true,
          },
          select: DashboardChildProfileSelect,
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          parentalAuthorities,
          total: parentalAuthorities.length,
        };
      } catch (error) {
        console.error('Error fetching children for dashboard:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des profils enfants pour le dashboard',
        });
      }
    }),
});

export type FullProfile = RouterOutputs['profile']['getCurrent'];
export type RegistrationRequest = RouterOutputs['profile']['getRegistrationRequest'];

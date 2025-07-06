import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { ParentalRole, RequestStatus } from '@prisma/client';
import { LinkInfoSchema, ChildCompleteFormSchema } from '@/schemas/child-registration';
import { BasicInfoSchema, FullProfileUpdateSchema } from '@/schemas/registration';
import { FullParentalAuthorityInclude } from '@/types/parental-authority';
import { FullProfileInclude } from '@/types/profile';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

export const childProfilesRouter = createTRPCRouter({
  /**
   * Récupérer les profils enfants d'un utilisateur (parent)
   */
  getByParent: protectedProcedure
    .input(
      z.object({
        parentId: z.string().optional(),
        includeInactive: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId || ctx.session.user.id;
      
      // Vérifier que l'utilisateur peut voir ces profils
      if (parentId !== ctx.session.user.id && !ctx.session.user.roles?.includes('ADMIN')) {
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
   * Récupérer un profil enfant spécifique
   */
  getById: protectedProcedure
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
            message: 'Profil enfant non trouvé',
          });
        }

        // Vérifier que l'utilisateur peut voir ce profil
        const hasParentalAuthority = profile.parentAuthorities?.some(
          auth => auth.parentUserId === ctx.session.user.id && auth.isActive
        );

        if (!hasParentalAuthority && !ctx.session.user.roles?.includes('ADMIN')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Non autorisé à voir ce profil',
          });
        }

        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error fetching child profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du profil',
        });
      }
    }),

  /**
   * Créer un nouveau profil enfant avec autorité parentale
   */
  create: protectedProcedure
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
   * Mettre à jour les informations de base d'un profil enfant
   */
  updateBasicInfo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: BasicInfoSchema.partial(),
      })
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
      })
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
        const canModify = ctx.session.user.id === input.parentUserId || 
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
          message: 'Erreur lors de la mise à jour de l\'autorité parentale',
        });
      }
    }),

  /**
   * Supprimer un profil enfant (seulement si DRAFT)
   */
  delete: protectedProcedure
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
  submitForValidation: protectedProcedure
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
        const requiredFields = ['firstName', 'lastName', 'birthDate', 'birthPlace', 'nationality'];
        const missingFields = requiredFields.filter(field => !profile[field as keyof typeof profile]);

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
            message: 'L\'acte de naissance est requis',
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
            message: 'Service d\'enregistrement non trouvé',
          });
        }

        // Créer la demande de service et mettre à jour le profil
        const result = await ctx.db.$transaction(async (tx) => {
          const serviceRequest = await tx.serviceRequest.create({
            data: {
              serviceCategory: 'REGISTRATION',
              organizationId: registrationService.organizationId,
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
   * Obtenir les statistiques des profils enfants pour un parent
   */
  getStats: protectedProcedure
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

        const statusCounts = byStatus.reduce((acc, auth) => {
          const status = auth.profile.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

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
}); 
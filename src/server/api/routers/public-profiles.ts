import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { NotificationType } from '@prisma/client';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';

export const publicProfilesRouter = createTRPCRouter({
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
   * Récupérer un profil public par ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
                 const profile = await ctx.db.profile.findUnique({
           where: { id: input.id },
           select: {
             id: true,
             firstName: true,
             lastName: true,
             birthDate: true,
             birthPlace: true,
             nationality: true,
             residenceCountyCode: true,
             status: true, // Nécessaire pour vérifier si le profil est public
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
             // Informations additionnelles pour les utilisateurs connectés
             ...(ctx.session?.user ? {
               email: true,
               phoneNumber: true,
               address: {
                 select: {
                   firstLine: true,
                   secondLine: true,
                   city: true,
                   zipCode: true,
                   country: true,
                 },
               },
             } : {}),
           },
         });

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Profil non trouvé',
          });
        }

        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('Error fetching public profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du profil',
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
        message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
        recipientEmail: z.string().email(),
        from: z.string().min(1, 'L\'expéditeur est obligatoire'),
        contact: z.string().min(1, 'Le contact est obligatoire'),
      })
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
          message: 'Erreur lors de l\'envoi du message',
        });
      }
    }),
}); 
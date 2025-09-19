import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { sendFeedbackEmail } from '@/lib/services/notifications/providers/emails';
import { env } from '@/env';
import { FeedbackCategory } from '@/schemas/feedback';
import { TRPCError } from '@trpc/server';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel, NotificationType } from '@/types/notifications';

const feedbackCreateSchema = z.object({
  subject: z.string().min(3),
  message: z.string().min(10),
  category: FeedbackCategory,
  rating: z.number().min(1).max(5).optional(),
  email: z.string().email().optional(),
  serviceId: z.string().optional(),
  requestId: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const feedbackResponseSchema = z.object({
  feedbackId: z.string(),
  response: z.string().min(10, {
    message: 'La réponse doit contenir au moins 10 caractères',
  }),
  notifyUser: z.boolean().default(true),
  channels: z.array(z.enum(['EMAIL', 'SMS'])).default(['EMAIL']),
});

const feedbackStatusUpdateSchema = z.object({
  feedbackId: z.string(),
  status: z.enum(['PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED']),
});

const feedbackListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  category: FeedbackCategory.optional(),
  organizationId: z.string().optional(),
});

export const feedbackRouter = createTRPCRouter({
  // Créer un feedback (public ou authentifié)
  create: publicProcedure.input(feedbackCreateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id;
    const userEmail = ctx.user?.email || input.email;

    try {
      // Créer le feedback dans la base de données
      const feedback = await ctx.db.feedback.create({
        data: {
          subject: input.subject,
          message: input.message,
          category: input.category,
          rating: input.rating,
          email: userEmail,
          phoneNumber: input.phoneNumber,
          userId,
          serviceId: input.serviceId,
          requestId: input.requestId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          request: {
            select: {
              id: true,
              serviceCategory: true,
            },
          },
        },
      });

      // Envoyer un email au contact technique si configuré
      if (env.TECHNICAL_CONTACT_EMAIL) {
        try {
          await sendFeedbackEmail({
            to: env.TECHNICAL_CONTACT_EMAIL,
            feedbackData: {
              subject: input.subject,
              message: input.message,
              category: input.category,
              rating: input.rating,
              email: userEmail,
              phoneNumber: input.phoneNumber,
              userId,
              createdAt: feedback.createdAt,
            },
          });
        } catch (error) {
          console.error('Failed to send feedback email:', error);
        }
      }

      return feedback;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la création du feedback',
      });
    }
  }),

  // Récupérer mes feedbacks
  getMyFeedbacks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const feedbacks = await ctx.db.feedback.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          request: {
            select: {
              id: true,
              serviceCategory: true,
            },
          },
          respondedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return feedbacks;
    } catch (error) {
      console.error('Error fetching user feedbacks:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération des feedbacks',
      });
    }
  }),

  // Liste des feedbacks pour l'administration (SUPER_ADMIN seulement)
  getAdminList: protectedProcedure
    .input(feedbackListSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit, status, category, organizationId } = input;
        const skip = (page - 1) * limit;

        const where = {
          ...(status && { status }),
          ...(category && { category }),
          ...(organizationId && { organizationId }),
        };

        const [feedbacks, total] = await Promise.all([
          ctx.db.feedback.findMany({
            where,
            skip,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
              request: {
                select: {
                  id: true,
                  serviceCategory: true,
                },
              },
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
              respondedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.db.feedback.count({ where }),
        ]);

        return {
          feedbacks,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error('Error fetching admin feedbacks:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des feedbacks',
        });
      }
    }),

  // Répondre à un feedback
  respondToFeedback: protectedProcedure
    .input(feedbackResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { feedbackId, response, notifyUser, channels } = input;

        // Récupérer le feedback et vérifier qu'il existe
        const feedback = await ctx.db.feedback.findUnique({
          where: { id: feedbackId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        });

        if (!feedback) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Feedback non trouvé',
          });
        }

        // Mettre à jour le feedback avec la réponse
        const updatedFeedback = await ctx.db.feedback.update({
          where: { id: feedbackId },
          data: {
            response,
            respondedBy: {
              connect: { id: ctx.auth.userId },
            },
            respondedAt: new Date(),
            status: 'RESOLVED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            respondedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Notifier l'utilisateur si demandé
        if (notifyUser && (feedback.user || feedback.email || feedback.phoneNumber)) {
          const notificationChannels: NotificationChannel[] = [];

          if (channels.includes('EMAIL') && (feedback.user?.email || feedback.email)) {
            notificationChannels.push(NotificationChannel.EMAIL);
          }

          if (
            channels.includes('SMS') &&
            (feedback.user?.phoneNumber || feedback.phoneNumber)
          ) {
            notificationChannels.push(NotificationChannel.SMS);
          }

          if (notificationChannels.length > 0) {
            try {
              await notify({
                userId: feedback.user?.id || 'anonymous',
                type: NotificationType.FEEDBACK,
                title: `Réponse à votre retour utilisateur au sujet de : ${feedback.subject}`,
                message: response,
                channels: notificationChannels,
                email: feedback.user?.email || feedback.email || undefined,
                phoneNumber:
                  feedback.user?.phoneNumber || feedback.phoneNumber || undefined,
                priority: 'normal',
              });
            } catch (notificationError) {
              console.error(
                'Error sending feedback response notification:',
                notificationError,
              );
              // Ne pas faire échouer la réponse si la notification échoue
            }
          }
        }

        return updatedFeedback;
      } catch (error) {
        console.error('Error responding to feedback:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la réponse au feedback',
        });
      }
    }),

  // Changer le statut d'un feedback
  updateStatus: protectedProcedure
    .input(feedbackStatusUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { feedbackId, status } = input;

        const updatedFeedback = await ctx.db.feedback.update({
          where: { id: feedbackId },
          data: { status },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return updatedFeedback;
      } catch (error) {
        console.error('Error updating feedback status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour du statut',
        });
      }
    }),

  // Obtenir les statistiques des feedbacks (pour les admins)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [total, byCategory, byStatus, recentFeedbacks, ratingsData] =
        await Promise.all([
          // Total des feedbacks
          ctx.db.feedback.count(),

          // Par catégorie
          ctx.db.feedback.groupBy({
            by: ['category'],
            _count: true,
          }),

          // Par statut
          ctx.db.feedback.groupBy({
            by: ['status'],
            _count: true,
          }),

          // Feedbacks récents
          ctx.db.feedback.findMany({
            take: 5,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),

          // Données de rating
          ctx.db.feedback.aggregate({
            _avg: {
              rating: true,
            },
            _count: {
              rating: true,
            },
            where: {
              rating: {
                not: null,
              },
            },
          }),
        ]);

      return {
        total,
        byCategory: byCategory.reduce(
          (acc, item) => {
            acc[item.category] = item._count;
            return acc;
          },
          { BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 } as Record<string, number>,
        ),
        byStatus: byStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count;
            return acc;
          },
          { PENDING: 0, IN_REVIEW: 0, RESOLVED: 0, CLOSED: 0 } as Record<string, number>,
        ),
        averageRating: ratingsData._avg.rating || 0,
        totalRatings: ratingsData._count.rating || 0,
        recentFeedbacks,
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur lors de la récupération des statistiques',
      });
    }
  }),
});

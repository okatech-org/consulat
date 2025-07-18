import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { sendFeedbackEmail } from '@/lib/services/notifications/providers/emails';
import { env } from '@/env';
import { FeedbackCategory } from '@/schemas/feedback';

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

export const feedbackRouter = createTRPCRouter({
  // Créer un feedback (public ou authentifié)
  create: publicProcedure.input(feedbackCreateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.user?.id;
    const userEmail = ctx.session?.user?.email || input.email;

    // Pour l'instant, on retourne juste les données validées
    // TODO: Sauvegarder dans la base de données une fois le modèle Prisma généré
    const feedback = {
      id: `feedback-${Date.now()}`,
      subject: input.subject,
      message: input.message,
      category: input.category,
      rating: input.rating,
      email: userEmail,
      phoneNumber: input.phoneNumber,
      userId,
      serviceId: input.serviceId,
      requestId: input.requestId,
      createdAt: new Date(),
    };

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
  }),

  // Récupérer mes feedbacks
  getMyFeedbacks: protectedProcedure.query(async () => {
    // TODO: Implémenter une fois le modèle Prisma généré
    return [];
  }),

  // Obtenir les statistiques des feedbacks
  getStats: protectedProcedure.query(async () => {
    // TODO: Implémenter une fois le modèle Prisma généré
    return {
      total: 0,
      byCategory: {
        BUG: 0,
        FEATURE: 0,
        IMPROVEMENT: 0,
        OTHER: 0,
      },
      byStatus: {
        PENDING: 0,
        IN_REVIEW: 0,
        RESOLVED: 0,
        CLOSED: 0,
      },
      averageRating: 0,
      totalRatings: 0,
      recentFeedbacks: [],
    };
  }),
});

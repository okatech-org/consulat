'use server';

import { feedbackSchema, type FeedbackFormValues } from '@/schemas/feedback';
import { env } from '@/env';
import { sendFeedbackEmail } from '@/lib/services/notifications/providers/emails';
import { getCurrentUser } from '@/lib/auth/utils';
import { db } from '@/server/db';
import { tryCatch } from '@/lib/utils';

export const submitFeedback = async (formData: unknown) => {
  let validatedFields: FeedbackFormValues;

  try {
    validatedFields = feedbackSchema.parse(formData);
  } catch (validationError) {
    console.error('Validation error:', validationError);
    return { success: false, error: 'Données invalides' };
  }

  const { error: userError, data: currentUser } = await tryCatch(getCurrentUser());

  if (userError) {
    console.error('Error getting current user:', userError);
  }

  const userId = currentUser?.id;
  const userEmail = currentUser?.email || validatedFields.email;

  const { error, data: feedback } = await tryCatch(
    db.feedback.create({
      data: {
        subject: validatedFields.subject,
        message: validatedFields.message,
        category: validatedFields.category,
        rating: validatedFields.rating,
        email: userEmail,
        phoneNumber: validatedFields.phoneNumber,
        userId,
        serviceId: validatedFields.serviceId,
        requestId: validatedFields.requestId,
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
    }),
  );

  if (error || !feedback) {
    console.error('Error creating feedback:', error);
    return { success: false, error: 'Erreur lors de la création du feedback' };
  }

  // Send email notification to the technical contact
  if (env.TECHNICAL_CONTACT_EMAIL) {
    const { error: emailError } = await tryCatch(
      sendFeedbackEmail({
        to: env.TECHNICAL_CONTACT_EMAIL,
        feedbackData: {
          subject: validatedFields.subject,
          message: validatedFields.message,
          category: validatedFields.category,
          rating: validatedFields.rating,
          email: userEmail || undefined,
          phoneNumber: validatedFields.phoneNumber || undefined,
          userId: userId || undefined,
          createdAt: feedback.createdAt,
        },
      }),
    );

    if (emailError) {
      console.error('Failed to send feedback email:', emailError);
      // Continue execution even if email fails
    }
  } else {
    console.warn('No TECHNICAL_CONTACT_EMAIL provided in environment variables');
  }

  return { success: true, data: feedback };
};

export const getFeedbacksByUser = async () => {
  const { error: userError, data: currentUser } = await tryCatch(getCurrentUser());

  if (userError || !currentUser?.id) {
    return { success: false, error: 'Utilisateur non autorisé' };
  }

  const { error, data: feedbacks } = await tryCatch(
    db.feedback.findMany({
      where: {
        userId: currentUser.id,
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
    }),
  );

  if (error) {
    console.error('Error getting user feedback:', error);
    return { success: false, error: 'Erreur lors de la récupération des feedbacks' };
  }

  return { success: true, data: feedbacks || [] };
};

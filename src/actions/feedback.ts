'use server';

import { feedbackSchema } from '@/schemas/feedback';
import { env } from '@/env';;
import { sendFeedbackEmail } from '@/lib/services/notifications/providers/emails';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export const submitFeedback = async (formData: unknown) => {
  try {
    // Validate form data
    const validatedFields = feedbackSchema.parse(formData);

    // Get current user if authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    const userEmail = session?.user?.email || validatedFields.email;

    // Since we don't have a Feedback model yet, we'll just return the validated data
    // In production, you should create a Feedback model in Prisma schema
    // This is a temporary implementation
    const feedback = {
      id: `feedback-${Date.now()}`,
      subject: validatedFields.subject,
      message: validatedFields.message,
      category: validatedFields.category,
      rating: validatedFields.rating,
      email: userEmail,
      userId: userId || null,
      createdAt: new Date(),
    };

    // TODO: Create a Feedback model in Prisma and use it here
    // For now, we'll just log the feedback
    console.log('Feedback received:', feedback);

    // Send email notification to the technical contact
    if (env.TECHNICAL_CONTACT_EMAIL) {
      try {
        await sendFeedbackEmail({
          to: env.TECHNICAL_CONTACT_EMAIL,
          feedbackData: {
            subject: validatedFields.subject,
            message: validatedFields.message,
            category: validatedFields.category,
            rating: validatedFields.rating,
            email: userEmail || undefined,
            userId: userId || undefined,
            createdAt: new Date(),
          },
        });
        console.log('Feedback email sent to technical contact');
      } catch (emailError) {
        console.error('Failed to send feedback email:', emailError);
        // Continue execution even if email fails
      }
    } else {
      console.warn('No TECHNICAL_CONTACT_EMAIL provided in environment variables');
    }

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
};

export const getFeedbacksByUser = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // TODO: Use Prisma model once created
    // For now, we'll just return an empty array
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting user feedback:', error);
    return { success: false, error: 'Failed to get feedback' };
  }
};

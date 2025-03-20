'use server';

import { feedbackSchema } from '@/schemas/feedback';
import { auth } from '@/auth';

export const submitFeedback = async (formData: unknown) => {
  try {
    // Validate form data
    const validatedFields = feedbackSchema.parse(formData);

    // Get current user if authenticated
    const session = await auth();
    const userId = session?.user?.id;

    // Since we don't have a Feedback model yet, we'll just return the validated data
    // In production, you should create a Feedback model in Prisma schema
    // This is a temporary implementation
    const feedback = {
      id: `feedback-${Date.now()}`,
      subject: validatedFields.subject,
      message: validatedFields.message,
      category: validatedFields.category,
      rating: validatedFields.rating,
      email: validatedFields.email || session?.user?.email,
      userId: userId || null,
      createdAt: new Date(),
    };

    // TODO: Create a Feedback model in Prisma and use it here
    // For now, we'll just log the feedback
    console.log('Feedback received:', feedback);

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
};

export const getFeedbacksByUser = async () => {
  try {
    const session = await auth();

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

import { z } from 'zod';

export const FeedbackCategory = z.enum(['BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER']);

export const feedbackSchema = z.object({
  subject: z.string().min(3, {
    message: 'Le sujet doit contenir au moins 3 caractères',
  }),
  message: z.string().min(10, {
    message: 'Le message doit contenir au moins 10 caractères',
  }),
  rating: z.number().min(1).max(5).optional(),
  category: FeedbackCategory,
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

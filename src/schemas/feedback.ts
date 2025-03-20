import { z } from 'zod';

export const feedbackSchema = z.object({
  subject: z.string().min(3, {
    message: 'Le sujet doit contenir au moins 3 caractères',
  }),
  message: z.string().min(10, {
    message: 'Le message doit contenir au moins 10 caractères',
  }),
  rating: z.number().min(1).max(5).optional(),
  category: z.enum(['bug', 'feature', 'improvement', 'other']),
  email: z.string().email().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

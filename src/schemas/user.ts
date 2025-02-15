import * as z from 'zod';
import { ServiceCategory } from '@prisma/client';
import { EmailSchema, NameSchema, PhoneValueSchema } from '@/schemas/inputs';

export const LoginSchema = z
  .object({
    identifier: z.string().min(1, 'messages.errors.identifier_required'),
    type: z.enum(['EMAIL', 'PHONE']),
    otp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'EMAIL') {
      if (!z.string().email().safeParse(data.identifier).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.invalid_email',
          path: ['identifier'],
        });
      }
    } else if (data.type === 'PHONE') {
      // Mise à jour de la validation du téléphone pour accepter le format international
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(data.identifier)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.invalid_phone',
          path: ['identifier'],
        });
      }
    }
  });

export type LoginInput = z.infer<typeof LoginSchema>;

export const AgentSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema.optional(),
  phone: PhoneValueSchema.optional(),
  countryIds: z.array(z.string()).min(1, {
    message: 'Vous devez sélectionner au moins un pays.',
  }),
  serviceCategories: z.array(z.nativeEnum(ServiceCategory)).min(1, {
    // Utiliser directement l'enum
    message: 'Vous devez sélectionner au moins une catégorie de service.',
  }),
  organizationId: z.string(),
});

export type AgentFormData = z.infer<typeof AgentSchema>;

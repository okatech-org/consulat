import * as z from 'zod';
import { ServiceCategory } from '@prisma/client';
import { EmailSchema, NameSchema, PhoneValueSchema } from '@/schemas/inputs';

export const LoginSchema = z
  .object({
    email: EmailSchema.optional(),
    phone: PhoneValueSchema.optional(),
    type: z.enum(['EMAIL', 'PHONE']),
    otp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'EMAIL') {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.field_required',
          path: ['email'],
        });
      }
    }

    if (data.type === 'PHONE') {
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.field_required',
          path: ['phone'],
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
  assignedOrganizationId: z.string(),
});

export type AgentFormData = z.infer<typeof AgentSchema>;

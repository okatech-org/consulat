import * as z from 'zod';
import { ServiceCategory } from '@prisma/client';
import {
  EmailSchema,
  NameSchema,
  PhoneNumberSchema,
  PhoneValueSchema,
} from '@/schemas/inputs';

export const LoginWithPhoneSchema = z.object({
  phoneNumber: PhoneNumberSchema,
  type: z.literal('PHONE'),
  otp: z.string().optional(),
});

export const LoginWithEmailSchema = z.object({
  email: EmailSchema,
  type: z.literal('EMAIL'),
  otp: z.string().optional(),
});

export type LoginInput =
  | z.infer<typeof LoginWithPhoneSchema>
  | z.infer<typeof LoginWithEmailSchema>;

export const AgentSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema.optional(),
  phoneNumber: PhoneNumberSchema.optional(),
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

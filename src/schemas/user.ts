import * as z from 'zod';
import { ServiceCategory, UserRole } from '@/convex/lib/constants';
import {
  DateSchema,
  EmailSchema,
  NameSchema,
  PhoneNumberSchema,
  E164PhoneSchema,
} from '@/schemas/inputs';

export const LoginWithPhoneSchema = z.object({
  phoneNumber: E164PhoneSchema,
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
  roles: z.array(z.enum(UserRole)).default([UserRole.Agent]),
  managedByUserId: z.string().optional(),
  countryCodes: z.array(z.string()).min(1, {
    message: 'Vous devez sélectionner au moins un pays.',
  }),
  serviceIds: z.array(z.string()).default([]),
  assignedOrganizationId: z.string(),
  managedAgentIds: z.array(z.string()).optional(),
});

export type AgentFormData = z.infer<typeof AgentSchema>;

export const UserSettingsSchema = z.object({
  name: NameSchema.optional(),
  id: z.string(),
  email: EmailSchema.optional(),
  phoneNumber: PhoneNumberSchema.optional(),
  image: z.string().optional(),
  roles: z.array(z.enum(UserRole)),
  emailVerified: DateSchema.optional().nullable(),
  phoneVerified: DateSchema.optional().nullable(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const AgentSettingsSchema = UserSettingsSchema.extend({
  linkedCountries: z.array(z.string()),
  specializations: z.array(z.enum(ServiceCategory)),
  maxActiveRequests: z.number().optional(),
  availability: z.array(z.string()),
  completedRequests: z.number().optional(),
  averageProcessingTime: z.number().optional(),
  assignedOrganizationId: z.string(),
});

export type AgentSettings = z.infer<typeof AgentSettingsSchema>;

export const AdminSettingsSchema = UserSettingsSchema.extend({
  organizationId: z.string(),
});

export type AdminSettings = z.infer<typeof AdminSettingsSchema>;

export const RegistrationSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  phoneNumber: E164PhoneSchema,
  otp: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

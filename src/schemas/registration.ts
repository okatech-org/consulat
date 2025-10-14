import * as z from 'zod';
import {
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  WorkStatus,
} from '@/convex/lib/constants';
import {
  AddressSchema,
  CountryCodeSchema,
  DateSchema,
  EmailSchema,
  NameSchema,
  PhoneNumberSchema,
  UserDocumentSchema,
} from './inputs';

export const ConvexPersonalInfoSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  gender: z.enum(Object.values(Gender)),
  acquisitionMode: z.enum(Object.values(NationalityAcquisition)),
  birthDate: DateSchema,
  birthPlace: z.string(),
  birthCountry: z.string(),
  nationality: z.string(),
  passportInfos: z
    .object({
      number: z
        .string()
        .min(8)
        .max(9)
        .regex(/^[A-Z0-9]{8,9}$/),
      issueDate: DateSchema,
      expiryDate: DateSchema,
      issueAuthority: z.string().min(2).max(100),
    })
    .optional(),
  nipCode: z.string().optional(),
});

export const ConvexFamilyInfoSchema = z.object({
  maritalStatus: z.enum(Object.values(MaritalStatus)),
  father: z
    .object({
      firstName: NameSchema.optional(),
      lastName: NameSchema.optional(),
    })
    .optional(),
  mother: z
    .object({
      firstName: NameSchema.optional(),
      lastName: NameSchema.optional(),
    })
    .optional(),
  spouse: z
    .object({
      firstName: NameSchema.optional(),
      lastName: NameSchema.optional(),
    })
    .optional(),
});

export const ConvexContactInfoSchema = z.object({
  email: EmailSchema.optional(),
  phone: PhoneNumberSchema.nullable(),
  address: AddressSchema.optional(),
});

export const ConvexProfessionalInfoSchema = z.object({
  workStatus: z.enum(Object.values(WorkStatus)),
  profession: NameSchema.optional(),
  employer: NameSchema.optional(),
  employerAddress: z.string().optional(),
  activityInGabon: z.string().max(200).optional(),
});

// Types pour les formulaires - adaptés à Convex
export type BasicInfoFormData = z.infer<typeof ConvexPersonalInfoSchema>;

export type FamilyInfoFormData = z.infer<typeof ConvexFamilyInfoSchema>;

export type ContactInfoFormData = z.infer<typeof ConvexContactInfoSchema>;

export type ProfessionalInfoFormData = z.infer<typeof ConvexProfessionalInfoSchema>;

// Garder les anciens schémas pour compatibilité si nécessaire
export const CreateProfileSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  residenceCountyCode: CountryCodeSchema,
  email: EmailSchema.optional(),
  phoneNumber: PhoneNumberSchema,
  emailVerified: DateSchema.optional(),
  phoneVerified: DateSchema.optional(),
});

export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;

// Schémas avec validations pour l'interface existante
export const BasicInfoSchema = ConvexPersonalInfoSchema.extend({
  identityPicture: UserDocumentSchema.optional(),
  cardPin: z.string().optional(),
});

export const FamilyInfoSchema = ConvexFamilyInfoSchema;

export const ContactInfoSchema = ConvexContactInfoSchema;

export const ProfessionalInfoSchema = ConvexProfessionalInfoSchema;

export const DocumentsSchema = z.object({
  passport: UserDocumentSchema.nullable().optional(),
  birthCertificate: UserDocumentSchema.nullable().optional(),
  residencePermit: UserDocumentSchema.nullable().optional(),
  addressProof: UserDocumentSchema.nullable().optional(),
});

export type DocumentsFormData = z.infer<typeof DocumentsSchema>;

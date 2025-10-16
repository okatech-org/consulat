import * as z from 'zod';
import {
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  WorkStatus,
} from '@/convex/lib/constants';
import {
  AddressSchema,
  DateSchema,
  EmailSchema,
  NameSchema,
  PhoneNumberSchema,
  UserDocumentSchema,
} from './inputs';

export const BasicInfoSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  gender: z.enum(Object.values(Gender)),
  acquisitionMode: z.enum(Object.values(NationalityAcquisition)),
  birthDate: DateSchema.optional(),
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
      issueDate: DateSchema.optional(),
      expiryDate: DateSchema.optional(),
      issueAuthority: z.string().min(2).max(100),
    })
    .optional(),
  nipCode: z.string().optional(),
  identityPicture: UserDocumentSchema.optional(),
});

export const FamilyInfoSchema = z.object({
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

export const ContactInfoSchema = z.object({
  email: EmailSchema.optional(),
  phone: PhoneNumberSchema.optional(),
  address: AddressSchema.optional(),
});

export const ProfessionalInfoSchema = z.object({
  workStatus: z.enum(Object.values(WorkStatus)),
  profession: NameSchema.optional(),
  employer: NameSchema.optional(),
  employerAddress: z.string().optional(),
  activityInGabon: z.string().max(200).optional(),
});

export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;

export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>;

export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>;

export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>;

export const DocumentsSchema = z.object({
  passport: UserDocumentSchema.nullable().optional(),
  birthCertificate: UserDocumentSchema.nullable().optional(),
  residencePermit: UserDocumentSchema.nullable().optional(),
  addressProof: UserDocumentSchema.nullable().optional(),
  identityPicture: UserDocumentSchema.nullable().optional(),
});

export type DocumentsFormData = z.infer<typeof DocumentsSchema>;

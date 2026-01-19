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
  EmergencyContactSchema,
  NameSchema,
  PhoneNumberSchema,
  UserDocumentSchema,
} from './inputs';

export const BasicInfoSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  gender: z.enum(Object.values(Gender)),
  acquisitionMode: z.enum(Object.values(NationalityAcquisition)),
  birthDate: DateSchema,
  birthPlace: z.string().min(1, 'messages.errors.field_required'),
  birthCountry: z.string().min(1, 'messages.errors.field_required'),
  nationality: z.string().min(1, 'messages.errors.field_required'),
  passportInfos: z
    .object({
      number: z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val || val === '') return true;
            return val.length >= 8 && val.length <= 9;
          },
          { message: 'messages.errors.number_too_short' },
        )
        .refine(
          (val) => {
            if (!val || val === '') return true;
            return /^[A-Z0-9]{8,9}$/.test(val);
          },
          { message: 'messages.errors.number_invalid_format' },
        ),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      issueAuthority: z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val || val === '') return true;
            return val.length >= 2 && val.length <= 100;
          },
          { message: 'messages.errors.authority_too_short' },
        ),
    })
    .optional(),
  nipCode: z.string().optional(),
  identityPicture: UserDocumentSchema.nullable(),
});

export const FamilyInfoSchema = z.object({
  maritalStatus: z.enum(Object.values(MaritalStatus)),
  father: z.object({
    firstName: NameSchema,
    lastName: NameSchema,
  }),
  mother: z.object({
    firstName: NameSchema,
    lastName: NameSchema,
  }),
  spouse: z
    .object({
      firstName: NameSchema.optional(),
      lastName: NameSchema.optional(),
    })
    .optional(),
});

export const ContactInfoSchema = z.object({
  email: EmailSchema,
  phone: PhoneNumberSchema,
  address: AddressSchema,
  emergencyContacts: z
    .array(EmergencyContactSchema)
    .min(2, 'messages.errors.emergency_contacts_required'),
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
  birthCertificate: UserDocumentSchema.nullable().refine(
    (val) => val !== null && val !== undefined,
    {
      message: 'messages.errors.field_required',
    },
  ),
  residencePermit: UserDocumentSchema.nullable().optional(),
  addressProof: UserDocumentSchema.nullable().refine(
    (val) => val !== null && val !== undefined,
    {
      message: 'messages.errors.field_required',
    },
  ),
});

export type DocumentsFormData = z.infer<typeof DocumentsSchema>;

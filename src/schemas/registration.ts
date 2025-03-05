import * as z from 'zod';
import {
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  WorkStatus,
} from '@prisma/client';
import {
  AddressSchema,
  CountryCodeSchema,
  DateSchema,
  DocumentFileSchema,
  EmailSchema,
  EmergencyContactSchema,
  NameSchema,
  PhoneSchema,
} from './inputs';

export const BasicInfoSchema = z.object({
  gender: z.nativeEnum(Gender, {
    required_error: 'messages.errors.field_required',
  }),
  acquisitionMode: z.nativeEnum(NationalityAcquisition, {
    required_error: 'messages.errors.field_required',
  }),

  firstName: NameSchema,

  lastName: NameSchema,

  birthDate: DateSchema.refine(
    (date) => new Date(date) <= new Date(),
    'messages.errors.birth_date_future',
  ),

  birthPlace: z.string({
    required_error: 'messages.errors.field_required',
  }),

  birthCountry: z.string({
    required_error: 'messages.errors.field_required',
  }),

  nationality: z.string({
    required_error: 'messages.errors.field_required',
  }),

  identityPictureFile: DocumentFileSchema,

  passportNumber: z
    .string({
      required_error: 'messages.errors.field_required',
    })
    .min(8, 'messages.errors.number_too_short')
    .max(9, 'messages.errors.number_too_long')
    .regex(/^[A-Z0-9]{8,9}$/, 'messages.errors.number_invalid_format'),

  passportIssueDate: z.string({
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.issue_date_invalid',
  }),
  passportExpiryDate: z.string({
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.expiry_date_invalid',
  }),
  passportIssueAuthority: z
    .string({
      required_error: 'messages.errors.field_required',
    })
    .min(2, 'messages.errors.field_too_short')
    .max(100, 'messages.errors.field_too_long'),

  cardPin: z.string().optional(),
});

export const BasicInfoPostSchema = z.object({
  gender: z.nativeEnum(Gender, {
    required_error: 'messages.errors.field_required',
  }),
  firstName: NameSchema,
  lastName: NameSchema,
  birthDate: DateSchema,
  birthPlace: z.string({
    required_error: 'messages.errors.field_required',
  }),
  birthCountry: CountryCodeSchema,
  nationality: CountryCodeSchema,

  passportNumber: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  passportIssueAuthority: z.string().optional(),
});

// Constantes de validation
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 100,
} as const;

// Validation pour la section Contact
export const ContactInfoSchema = z.object({
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  address: AddressSchema,
  residentContact: EmergencyContactSchema,
  homeLandContact: EmergencyContactSchema,
});

// Validation pour la section Famille
export const FamilyInfoSchema = z
  .object({
    maritalStatus: z.nativeEnum(MaritalStatus),

    fatherFullName: NameSchema,

    motherFullName: NameSchema,

    spouseFullName: NameSchema.optional(),
  })
  .refine(
    (data) => {
      // Si marié, le nom du conjoint est requis
      if (data.maritalStatus === MaritalStatus.MARRIED) {
        return !!data.spouseFullName;
      }
      return true;
    },
    {
      message: 'messages.errors.spouse_name_required_if_married',
      path: ['spouseFullName'],
    },
  );

// Validation pour la section Professionnelle
export const ProfessionalInfoSchema = z
  .object({
    workStatus: z.nativeEnum(WorkStatus),

    profession: NameSchema,

    employer: NameSchema.optional(),

    employerAddress: AddressSchema.optional(),

    activityInGabon: z.string().max(200, 'messages.errors.activity_too_long').optional(),
  })
  .refine(
    (data) => {
      // Si employé, l'employeur est requis
      if (data.workStatus === WorkStatus.EMPLOYEE) {
        return !!data.employer;
      }
      return true;
    },
    {
      message: 'messages.errors.employer_required_if_employee',
      path: ['employer'],
    },
  );

export const DocumentsSchema = z.object({
  passportFile: DocumentFileSchema,
  birthCertificateFile: DocumentFileSchema,
  residencePermitFile: DocumentFileSchema.optional(),
  addressProofFile: DocumentFileSchema,
});

export const ProfileDataSchema = z.object({
  contactInfo: ContactInfoSchema,
  familyInfo: FamilyInfoSchema,
  basicInfo: BasicInfoSchema,
  professionalInfo: ProfessionalInfoSchema,
  documents: DocumentsSchema,
});

export const ProfileDataPostSchema = z.object({
  contactInfo: ContactInfoSchema,
  familyInfo: FamilyInfoSchema,
  basicInfo: BasicInfoPostSchema,
  professionalInfo: ProfessionalInfoSchema,
});

export const CompleteFormSchema = z.object({
  documents: DocumentsSchema,
  basicInfo: BasicInfoSchema,
  familyInfo: FamilyInfoSchema,
  contactInfo: ContactInfoSchema,
  professionalInfo: ProfessionalInfoSchema,
});

export type ConsularFormData = z.infer<typeof CompleteFormSchema>;
export type ProfileDataPostInput = z.infer<typeof ProfileDataPostSchema>;
export type ProfileDataInput = z.infer<typeof ProfileDataSchema>;
export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;
export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>;
export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>;
export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>;
export type DocumentsFormData = z.infer<typeof DocumentsSchema>;

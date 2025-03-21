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
  EmailSchema,
  EmergencyContactSchema,
  NameSchema,
  PhoneNumberSchema,
  UserDocumentSchema,
} from './inputs';

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

export const BasicInfoSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  gender: z.nativeEnum(Gender, {
    required_error: 'messages.errors.field_required',
  }),
  acquisitionMode: z.nativeEnum(NationalityAcquisition, {
    required_error: 'messages.errors.field_required',
  }),

  birthDate: DateSchema,

  birthPlace: z.string({
    required_error: 'messages.errors.field_required',
  }),

  birthCountry: z.string({
    required_error: 'messages.errors.field_required',
  }),

  nationality: z.string({
    required_error: 'messages.errors.field_required',
  }),

  identityPicture: z.object(
    {
      ...UserDocumentSchema.shape,
    },
    {
      required_error: 'messages.errors.doc_required',
      invalid_type_error: 'messages.errors.invalid_field',
    },
  ),

  passportNumber: z
    .string({
      required_error: 'messages.errors.field_required',
    })
    .min(8, 'messages.errors.number_too_short')
    .max(9, 'messages.errors.number_too_long')
    .regex(/^[A-Z0-9]{8,9}$/, 'messages.errors.number_invalid_format'),

  passportIssueDate: DateSchema.refine(
    (date) => new Date(date) <= new Date(),
    'messages.errors.issue_date_past',
  ),
  passportExpiryDate: DateSchema.refine(
    (date) => new Date(date) > new Date(),
    'messages.errors.expiry_date_past',
  ),
  passportIssueAuthority: z
    .string({
      required_error: 'messages.errors.field_required',
    })
    .min(2, 'messages.errors.field_too_short')
    .max(100, 'messages.errors.field_too_long'),

  cardPin: z.string().optional().nullable(),
});

// Validation pour la section Contact
const BaseContactInfoSchema = z.object({
  email: EmailSchema.optional(),
  phoneNumber: PhoneNumberSchema.nullable(),
  address: AddressSchema,
  residentContact: EmergencyContactSchema,
  homeLandContact: EmergencyContactSchema.optional(),
});

export const ContactInfoSchema = BaseContactInfoSchema.superRefine((data, ctx) => {
  if (!data.email && !data.phoneNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'messages.errors.email_or_phone_required',
      path: ['email', 'phoneNumber'],
    });
  }
});

// Validation pour la section Famille
const BaseFamilyInfoSchema = z.object({
  maritalStatus: z.nativeEnum(MaritalStatus),
  fatherFullName: NameSchema,
  motherFullName: NameSchema,
  spouseFullName: NameSchema.optional(),
});

export const FamilyInfoSchema = BaseFamilyInfoSchema.refine(
  (data) => {
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
const BaseProfessionalInfoSchema = z.object({
  workStatus: z.nativeEnum(WorkStatus),
  profession: NameSchema.optional(),
  employer: NameSchema.optional(),
  employerAddress: z.string().optional(),
  activityInGabon: z.string().max(200, 'messages.errors.activity_too_long').optional(),
});

export const ProfessionalInfoSchema = BaseProfessionalInfoSchema.superRefine(
  (data, ctx) => {
    if (data.workStatus === WorkStatus.EMPLOYEE) {
      if (!data.employer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.employer_required_if_employee',
          path: ['employer'],
        });
      }

      if (!data.employerAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'messages.errors.employer_address_required_if_employee',
          path: ['employerAddress'],
        });
      }
    }
  },
);

export const DocumentsSchema = z.object({
  passport: z
    .object(
      {
        ...UserDocumentSchema.shape,
      },
      {
        invalid_type_error: 'messages.errors.invalid_field',
      },
    )
    .nullable()
    .optional(),
  birthCertificate: z.object(
    {
      ...UserDocumentSchema.shape,
    },
    {
      invalid_type_error: 'messages.errors.invalid_field',
      required_error: 'messages.errors.doc_required',
    },
  ),
  residencePermit: z
    .object(
      {
        ...UserDocumentSchema.shape,
      },
      {
        invalid_type_error: 'messages.errors.invalid_field',
      },
    )
    .nullable()
    .optional(),
  addressProof: z.object(
    {
      ...UserDocumentSchema.shape,
    },
    {
      required_error: 'messages.errors.doc_required',
      invalid_type_error: 'messages.errors.invalid_field',
    },
  ),
});

export const DocumentsSchemaRefined = z
  .object({
    ...DocumentsSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (!data.passport) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'messages.errors.passport_required',
        path: ['passport'],
      });
    }
    if (!data.birthCertificate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'messages.errors.birth_certificate_required',
        path: ['birthCertificate'],
      });
    }

    if (!data.addressProof) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'messages.errors.address_proof_required',
        path: ['addressProof'],
      });
    }
  });

export const FullProfileUpdateSchema = z.object({
  ...DocumentsSchema.shape,
  ...BasicInfoSchema.shape,
  ...BaseContactInfoSchema.shape,
  ...BaseFamilyInfoSchema.shape,
  ...BaseProfessionalInfoSchema.shape,
});

export const ProfileSectionSchema = z.object({
  basicInfo: BasicInfoSchema.partial().optional(),
  contactInfo: BaseContactInfoSchema.partial().optional(),
  familyInfo: BaseFamilyInfoSchema.partial().optional(),
  professionalInfo: BaseProfessionalInfoSchema.partial().optional(),
  documents: DocumentsSchema.partial().optional(),
});

export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;
export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>;
export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>;
export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>;
export type DocumentsFormData = z.infer<typeof DocumentsSchemaRefined>;
export type FullProfileUpdateFormData = z.infer<typeof FullProfileUpdateSchema>;

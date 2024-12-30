import * as z from 'zod'
import { Gender, MaritalStatus, NationalityAcquisition, WorkStatus, FamilyLink } from '@prisma/client'

const FileListSchema = z.any().refine(
  (files) => {
    // Si on est côté serveur, on skip la validation
    if (typeof window === 'undefined') return true
    // Si pas de fichier, on retourne false pour déclencher la validation required
    if (!files) return false
    // Si c'est une FileList, c'est valide
    if (files instanceof FileList) return true
    // Si c'est déjà un File, c'est valide
    if (files instanceof File) return true
    // Sinon invalide
    return false
  },
  'messages.errors.doc_invalid',
)

const DocumentFileSchema = z.union([
  // Soit null/undefined
  z.null(),
  // Soit un fichier valide
  FileListSchema
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return false
        const file = files instanceof FileList ? files[0] : files
        if (!file) return false
        return file.size <= 10 * 1024 * 1024 // 10MB
      },
      { message: 'messages.errors.doc_size_10' }
    )
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return false
        const file = files instanceof FileList ? files[0] : files
        if (!file) return false
        const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        return acceptedTypes.includes(file.type)
      },
      { message: 'messages.errors.doc_type_image_pdf' }
    )
])
  .refine(
    (files) => {
      // Cette validation vérifie si le fichier est requis
      if (typeof window === 'undefined') return true
      return files !== null && files !== undefined
    },
    { message: 'messages.errors.doc_required' }
  )

const PhoneSchema = z.object({
  number: z.string().min(1, 'messages.errors.phone_required'),
  countryCode: z.string().min(1, 'messages.errors.country_code_required'),
})

const DocumentFileSchemaOptional = z.union([
  z.null(),
  FileListSchema
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return true // Optionnel donc null/undefined est valide
        const file = files instanceof FileList ? files[0] : files
        if (!file) return true
        return file.size <= 10 * 1024 * 1024
      },
      { message: 'messages.errors.doc_size_10' }
    )
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return true
        const file = files instanceof FileList ? files[0] : files
        if (!file) return true
        const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        return acceptedTypes.includes(file.type)
      },
      { message: 'messages.errors.doc_type_image_pdf' }
    )
])

export const BasicInfoSchema = z.object({
  gender: z.nativeEnum(Gender, {
    required_error: 'messages.errors.gender_required'
  }),
  acquisitionMode: z.nativeEnum(NationalityAcquisition, {
    required_error: 'messages.errors.gender_required'
  }),

  firstName: z.string({
    required_error: 'messages.errors.first_name_required'
  }).min(2, 'messages.errors.first_name_too_short'),

  lastName: z.string({
    required_error: 'messages.errors.last_name_required'
  }).min(2, 'messages.errors.last_name_too_short'),

  birthDate: z.string({
    required_error: 'messages.errors.birth_date_required'
  }),

  birthPlace: z.string({
    required_error: 'messages.errors.birth_place_required'
  }),

  birthCountry: z.string({
    required_error: 'messages.errors.birth_country_required'
  }),

  nationality: z.string({
    required_error: 'messages.errors.nationality_required'
  }),

  identityPictureFile: DocumentFileSchema,

  passportNumber: z
    .string({
      required_error: 'messages.errors.number_required',
    })
    .min(8, 'messages.errors.number_too_short')
    .max(9, 'messages.errors.number_too_long')
    .regex(
      /^[A-Z0-9]{8,9}$/,
      'messages.errors.number_invalid_format'
    ),

  passportIssueDate: z
    .string({
      required_error: 'messages.errors.issue_date_required',
      invalid_type_error: 'messages.errors.issue_date_invalid',
    }),
  passportExpiryDate: z
    .string({
      required_error: 'messages.errors.expiry_date_required',
      invalid_type_error: 'messages.errors.expiry_date_invalid',
    }),
  passportIssueAuthority: z
    .string({
      required_error: 'messages.errors.authority_required',
    })
    .min(2, 'messages.errors.authority_too_short')
    .max(100, 'messages.errors.authority_too_long'),
})

export const BasicInfoPostSchema = z.object({
  gender: z.nativeEnum(Gender, {
    required_error: 'Le genre est requis',
  }),
  firstName: z.string({
    required_error: 'Le prénom est requis',
  }).min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string({
    required_error: 'Le nom est requis',
  }).min(2, 'Le nom doit contenir au moins 2 caractères'),
  birthDate: z.string({
    required_error: 'La date de naissance est requise',
  }),
  birthPlace: z.string({
    required_error: 'Le lieu de naissance est requis',
  }),
  birthCountry: z.string({
    required_error: 'Le pays de naissance est requis',
  }),
  nationality: z.string({
    required_error: 'La nationalité est requise',
  }),

  passportNumber: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  passportIssueAuthority: z.string().optional(),
})

// Constantes de validation
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 100,
} as const

// Validation pour la section Contact
export const ContactInfoSchema = z.object({
  email: z
    .string()
    .email('messages.errors.invalid_email')
    .max(VALIDATION_RULES.EMAIL_MAX_LENGTH, 'messages.errors.email_too_long')
    .optional(),

  phone: PhoneSchema.optional(),

  address: z.object({
    firstLine: z
      .string()
      .min(1, 'messages.errors.street_required')
      .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH),

    secondLine: z.string().max(VALIDATION_RULES.ADDRESS_MAX_LENGTH).optional(),

    city: z
      .string()
      .min(1, 'messages.errors.city_required'),

    zipCode: z
      .string()
      .min(1, 'messages.errors.zipcode_required'),

    country: z
      .string()
      .min(1, 'messages.errors.country_required'),
  }),

  addressInGabon: z.object({
    address: z
      .string()
      .min(1, 'messages.errors.street_required')
      .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH),
    district: z.string().min(1, 'messages.errors.district.required'),
    city: z
      .string()
      .min(1, 'messages.errors.city_required'),
  }).optional(),
})

// Validation pour la section Famille
export const FamilyInfoSchema = z.object({
  maritalStatus: z.nativeEnum(MaritalStatus),

  fatherFullName: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, 'messages.errors.father_name_too_short')
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, 'messages.errors.father_name_too_long'),

  motherFullName: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, 'messages.errors.mother_name_too_short')
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, 'messages.errors.mother_name_too_long'),

  spouseFullName: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, 'messages.errors.spouse_name_too_short')
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, 'messages.errors.spouse_name_too_long')
    .optional(),

  emergencyContact: z.object({
    fullName: z
      .string()
      .min(VALIDATION_RULES.NAME_MIN_LENGTH, 'messages.errors.name_too_short')
      .max(VALIDATION_RULES.NAME_MAX_LENGTH, 'messages.errors.name_too_long'),

    relationship: z.nativeEnum(FamilyLink, {
      required_error: 'messages.errors.relationship_required',
      invalid_type_error: 'messages.errors.invalid_relationship',
    }),

    phone: z
      .string()
      .regex(VALIDATION_RULES.PHONE_REGEX, 'messages.errors.invalid_phone'),
  }).optional(),
}).refine(
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
  }
);

// Validation pour la section Professionnelle
export const ProfessionalInfoSchema = z.object({
  workStatus: z.nativeEnum(WorkStatus),

  profession: z
    .string()
    .min(2, 'messages.errors.profession_too_short')
    .max(100, 'messages.errors.profession_too_long')
    .optional(),

  employer: z
    .string()
    .min(2, 'messages.errors.employer_too_short')
    .max(100, 'messages.errors.employer_too_long')
    .optional(),

  employerAddress: z
    .string()
    .max(200, 'messages.errors.address_too_long')
    .optional(),

  lastActivityGabon: z
    .string()
    .max(200, 'messages.errors.activity_too_long')
    .optional(),
}).refine(
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
  }
);

export const DocumentsSchema = z.object({
  passportFile: DocumentFileSchema,
  birthCertificateFile: DocumentFileSchema,
  residencePermitFile: DocumentFileSchemaOptional,
  addressProofFile: DocumentFileSchema,
})

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
})

export type ConsularFormData = z.infer<typeof CompleteFormSchema>
export type ProfileDataPostInput = z.infer<typeof ProfileDataPostSchema>;
export type ProfileDataInput = z.infer<typeof ProfileDataSchema>;
export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>
export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>
export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>
export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>
export type DocumentsFormData = z.infer<typeof DocumentsSchema>
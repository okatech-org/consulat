import * as z from 'zod';
import {
  Gender,
  FamilyLink,
  DocumentStatus,
  DocumentType,
  ValidationStatus,
  OwnerType,
  EmergencyContactType,
} from '@/convex/lib/constants';
import {
  type CountryCode,
  type CountryIndicator,
  countryIndicators,
  countryKeys,
} from '@/lib/autocomplete-datas';

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  ADDRESS_MAX_LENGTH: 100,
};

// ... (skipping unchanged parts)

const FileListSchema = z.any().refine((files) => {
  // Si on est côté serveur, on skip la validation
  if (typeof window === 'undefined') return true;
  // Si pas de fichier, on retourne false pour déclencher la validation required
  if (!files) return false;
  // Si c'est une FileList, c'est valide
  if (files instanceof FileList) return true;
  // Si c'est déjà un File, c'est valide
  if (files instanceof File) return true;
  // Sinon invalide
  return false;
}, 'messages.errors.field_required');

export const DocumentFileSchema = z
  .union([
    // Soit null/undefined
    z.null(),
    // Soit un fichier valide
    FileListSchema.refine(
      (files) => {
        if (typeof window === 'undefined') return true;
        if (!files) return false;
        const file = files instanceof FileList ? files[0] : files;
        if (!file) return false;
        return file.size <= 100 * 1024 * 1024; // 10MB
      },
      { message: 'messages.errors.doc_size_10' },
    ).refine(
      (files) => {
        if (typeof window === 'undefined') return true;
        if (!files) return false;
        const file = files instanceof FileList ? files[0] : files;
        if (!file) return false;
        const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        return acceptedTypes.includes(file.type);
      },
      { message: 'messages.errors.doc_type_image_pdf' },
    ),
  ])
  .refine(
    (files) => {
      // Cette validation vérifie si le fichier est requis
      if (typeof window === 'undefined') return true;
      return files !== null && files !== undefined;
    },
    { message: 'messages.errors.field_required' },
  );

export const GenderSchema = z.enum(Gender, {
  error: 'messages.errors.field_required',
});

export const PictureFileSchema = DocumentFileSchema;

export const CountryCodeSchema = z
  .string()
  .min(1, 'messages.errors.field_required')
  .max(3, 'messages.errors.field_too_long')
  .refine((val) => countryKeys.includes(val as CountryCode), {
    message: 'messages.errors.invalid_country',
  });

export const CountryIndicatorSchema = z
  .string({
    error: 'messages.errors.field_required',
  })
  .refine((val) => countryIndicators.includes(val as CountryIndicator), {
    message: 'messages.errors.invalid_country_indicator',
  });

export const EmailSchema = z.email('messages.errors.invalid_email');

export const AddressSchema = z.object({
  street: z
    .string({
      error: 'messages.errors.field_required',
    })
    .min(1, 'messages.errors.field_required')
    .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH),

  complement: z.string().max(VALIDATION_RULES.ADDRESS_MAX_LENGTH).optional(),

  city: z
    .string({
      error: 'messages.errors.field_required',
    })
    .min(1, 'messages.errors.field_required'),

  postalCode: z
    .string({
      error: 'messages.errors.field_required',
    })
    .optional(),

  country: CountryCodeSchema,
});

export const BasicAddressSchema = z.object({
  firstLine: z.string().optional(),
  secondLine: z.string().optional(),

  city: z.string().optional(),

  zipCode: z.string().optional(),

  country: z.string().optional(),
});

// Schéma pour le format Clerk sans tiret (+33612250393)
export const PhoneSchema = z
  .string({ error: 'messages.errors.field_required' })
  .regex(VALIDATION_RULES.PHONE_REGEX, 'messages.errors.invalid_phone');

// Schéma pour le format legacy avec tiret (+33-612250393)
export const PhoneNumberSchema = PhoneSchema;

// Schéma pour react-phone-number-input (format E.164)
export const E164PhoneSchema = z
  .string({ error: 'messages.errors.field_required' })
  .refine(
    (value) => {
      // Format E.164: +33612250393
      const e164Format = /^\+[1-9]\d{1,14}$/;
      return e164Format.test(value);
    },
    { message: 'messages.errors.invalid_phone_number' },
  );

export const PhoneValueSchema = z.object({
  number: z
    .string({ error: 'messages.errors.field_required' })
    .regex(/^[0-9]{9,10}$/, 'messages.errors.invalid_phone_number'),
  countryCode: CountryIndicatorSchema,
});

export const NameSchema = z
  .string({
    error: 'messages.errors.field_required',
  })
  .min(2, 'messages.errors.field_too_short')
  .max(50, 'messages.errors.field_too_long');

export const DateSchema = z
  .string({
    error: 'messages.errors.field_required',
  })
  .min(1, 'messages.errors.field_required');

export const NumberSchema = z.number();

export const TextareaSchema = z
  .string()
  .min(1, 'messages.errors.field_required')
  .max(1000, 'messages.errors.field_too_long');

export const TextSchema = z
  .string()
  .min(1, 'messages.errors.field_required')
  .max(100, 'messages.errors.field_too_long');

export const SelectSchema = z
  .string()
  .min(1, 'messages.errors.field_required')
  .refine((val) => val !== 'default', 'messages.errors.field_required');

export const EmergencyContactSchema = z.object({
  type: z.nativeEnum(EmergencyContactType),
  firstName: NameSchema,
  lastName: NameSchema,
  relationship: z.enum(FamilyLink, {
    error: 'messages.errors.field_required',
  }),
  email: EmailSchema.optional(),
  phoneNumber: PhoneNumberSchema.optional(),
  address: AddressSchema,
});

export type AddressInput = z.infer<typeof AddressSchema>;

export const UserDocumentSchema = z.object({
  type: z.enum(DocumentType),
  status: z.enum(DocumentStatus),
  storageId: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().optional(),
  checksum: z.string().optional(),
  version: z.number(),
  previousVersionId: z.string().optional(),
  ownerId: z.string().optional(),
  ownerType: z.enum(OwnerType).optional(),
  issuedAt: z.number().optional(),
  expiresAt: z.number().optional(),
  validations: z
    .array(
      z.object({
        validatorId: z.string(),
        status: z.enum(ValidationStatus),
        comments: z.string().optional(),
        timestamp: z.number(),
      }),
    )
    .optional()
    .default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type UserDocumentInput = z.infer<typeof UserDocumentSchema>;

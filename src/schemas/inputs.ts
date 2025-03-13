import * as z from 'zod';
import { DocumentStatus, FamilyLink, Gender, DocumentType } from '@prisma/client';
import {
  CountryCode,
  CountryIndicator,
  countryIndicators,
  countryKeys,
} from '@/lib/autocomplete-datas';
import { log } from 'console';

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 100,
} as const;

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
}, 'messages.errors.doc_required');

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
        return file.size <= 10 * 1024 * 1024; // 10MB
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
    { message: 'messages.errors.doc_required' },
  );

export const GenderSchema = z.nativeEnum(Gender, {
  required_error: 'messages.errors.field_required',
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
    required_error: 'messages.errors.field_required',
  })
  .refine((val) => countryIndicators.includes(val as CountryIndicator), {
    message: 'messages.errors.invalid_country_indicator',
  });

export const EmailSchema = z
  .string({
    invalid_type_error: 'messages.errors.invalid_email',
    required_error: 'messages.errors.field_required',
  })
  .email('messages.errors.invalid_email')
  .max(VALIDATION_RULES.EMAIL_MAX_LENGTH, 'messages.errors.email_too_long');

export const AddressSchema = z.object({
  firstLine: z
    .string({
      required_error: 'messages.errors.field_required',
      invalid_type_error: 'messages.errors.invalid_field',
    })
    .min(1, 'messages.errors.field_required')
    .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH),

  secondLine: z
    .string({
      invalid_type_error: 'messages.errors.invalid_field',
    })
    .max(VALIDATION_RULES.ADDRESS_MAX_LENGTH)
    .nullable()
    .optional(),

  city: z
    .string({
      required_error: 'messages.errors.field_required',
      invalid_type_error: 'messages.errors.invalid_field',
    })
    .min(1, 'messages.errors.field_required'),

  zipCode: z
    .string({
      invalid_type_error: 'messages.errors.invalid_field',
    })
    .nullable()
    .optional(),

  country: CountryCodeSchema,
});

export const PhoneSchema = z
  .string({ required_error: 'messages.errors.field_required' })
  .regex(VALIDATION_RULES.PHONE_REGEX, 'messages.errors.invalid_phone');

export const PhoneValueSchema = z.object({
  number: z
    .string({ required_error: 'messages.errors.field_required' })
    .regex(/^[0-9]{9,10}$/, 'messages.errors.invalid_phone_number'),
  countryCode: CountryIndicatorSchema,
});

export const NameSchema = z
  .string({
    required_error: 'messages.errors.field_required',
  })
  .min(2, 'messages.errors.field_too_short')
  .max(50, 'messages.errors.field_too_long');

export const DateSchema = z
  .string({
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_date',
  })
  .min(1, 'messages.errors.field_required')
  .transform((val) => new Date(val))
  .refine((val) => !isNaN(val.getTime()), 'messages.errors.invalid_date');

export const NumberSchema = z.number();

export const TextareaSchema = z
  .string()
  .min(1, 'messages.errors.field_required')
  .max(1000, 'messages.errors.field_too_long');

export const SelectSchema = z
  .string()
  .min(1, 'messages.errors.field_required')
  .refine((val) => val !== 'default', 'messages.errors.field_required');

export const EmergencyContactSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  relationship: z.nativeEnum(FamilyLink, {
    required_error: 'messages.errors.field_required',
  }),
  email: EmailSchema.nullable().optional(),
  phone: PhoneValueSchema.nullable(),
  address: AddressSchema,
});

export type AddressInput = z.infer<typeof AddressSchema>;

export const UserDocumentSchema = z.object({
  id: z.string({
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_field',
  }),
  type: z.nativeEnum(DocumentType, {
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_field',
  }),
  status: z.nativeEnum(DocumentStatus, {
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_field',
  }),
  fileUrl: z.string({
    required_error: 'messages.errors.field_required',
    invalid_type_error: 'messages.errors.invalid_field',
  }),
  issuedAt: DateSchema.nullable().optional(),
  expiresAt: DateSchema.nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  userId: z.string().nullable().optional(),
  serviceRequestId: z.string().nullable().optional(),
  validatedById: z.string().nullable().optional(),
});

export type UserDocumentInput = z.infer<typeof UserDocumentSchema>;

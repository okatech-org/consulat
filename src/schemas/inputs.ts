import * as z from 'zod'
import { Gender } from '@prisma/client'

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 100,
} as const

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

export const DocumentFileSchema = z.union([
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

export const GenderSchema = z.nativeEnum(Gender, {
  required_error: 'messages.errors.gender_required'
})

export const PictureFileSchema = DocumentFileSchema

export const EmailSchema = z
  .string()
  .email('messages.errors.invalid_email')
  .max(VALIDATION_RULES.EMAIL_MAX_LENGTH, 'messages.errors.email_too_long')

export const AddressSchema = z.object({
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
})

export const PhoneSchema = z
  .string()
  .regex(VALIDATION_RULES.PHONE_REGEX, 'messages.errors.invalid_phone')

export const NameSchema = z.string({
  required_error: 'messages.errors.first_name_required'
}).min(2, 'messages.errors.first_name_too_short').max(50, 'messages.errors.first_name_too_long')

export const DateSchema = z.string()
  .min(1, 'messages.errors.required')
  .refine(
    (val) => !isNaN(Date.parse(val)),
    'messages.errors.invalid_date'
  )

export const NumberSchema = z.number()

export const TextareaSchema = z.string()
  .min(1, 'messages.errors.required')
  .max(1000, 'messages.errors.text_too_long')

export const SelectSchema = z.string()
  .min(1, 'messages.errors.required')
  .refine(
    (val) => val !== 'default',
    'messages.errors.required'
  )
  .refine(
    (val) => val !== 'default',
    'messages.errors.required'
  )
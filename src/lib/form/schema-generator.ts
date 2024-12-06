import { ServiceField } from '@/types/consular-service'
import { z } from 'zod'

export function generateFieldSchema(field: ServiceField): z.ZodType {
  // Schéma de base selon le type
  switch (field.type) {
    case 'email':
      return z.string()
        .min(1, 'messages.errors.required')
        .email('messages.errors.invalid_email')

    case 'phone':
      return z.string()
        .min(1, 'messages.errors.required')
        .regex(
          /^\+?[1-9]\d{1,14}$/,
          'messages.errors.invalid_phone'
        )

    case 'date':
      return z.string()
        .min(1, 'messages.errors.required')
        .refine(
          (val) => !isNaN(Date.parse(val)),
          'messages.errors.invalid_date'
        )

    case 'number':
      return z.number({
        required_error: 'messages.errors.required',
        invalid_type_error: 'messages.errors.invalid_number',
      })

    case 'select':
      if (!field.options?.length) {
        throw new Error('Select field must have options')
      }
      return z.enum(
        field.options.map(opt => opt.value) as [string, ...string[]],
        {
          required_error: 'messages.errors.required',
          invalid_type_error: 'messages.errors.invalid_option',
        }
      )

    case 'textarea':
      return z.string()
        .min(1, 'messages.errors.required')
        .max(1000, 'messages.errors.text_too_long')

    default:
      return z.string()
        .min(1, 'messages.errors.required')
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateFormSchema(fields: ServiceField[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodType> = {}

  fields.forEach(field => {
    shape[field.name] = generateFieldSchema(field)
  })

  return z.object(shape)
}
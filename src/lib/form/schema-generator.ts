import { ServiceField } from '@/types/consular-service';
import { z } from 'zod';
import {
  DateSchema,
  DocumentFileSchema,
  EmailSchema,
  NumberSchema,
  PhoneSchema,
  TextareaSchema,
} from '@/schemas/inputs';

export function generateFieldSchema(field: ServiceField): z.ZodType {
  // Schéma de base selon le type
  switch (field.type) {
    case 'file':
      return DocumentFileSchema;
    case 'email':
      return EmailSchema;
    case 'phone':
      return PhoneSchema;
    case 'date':
      return DateSchema;
    case 'number':
      return NumberSchema;
    case 'select':
      if (!field.options?.length) {
        throw new Error('Select field must have options');
      }
      return z.enum(field.options.map((opt) => opt.value) as [string, ...string[]], {
        required_error: 'messages.errors.required',
        invalid_type_error: 'messages.errors.invalid_option',
      });

    case 'textarea':
      return TextareaSchema;

    default:
      return z.string().min(1, 'messages.errors.required');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateFormSchema(fields: ServiceField[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodType> = {};

  fields.forEach((field) => {
    shape[field.name] = generateFieldSchema(field);
  });

  return z.object(shape);
}

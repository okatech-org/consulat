import { z } from 'zod'
import { ServiceCategory, ServiceStepType, DocumentType } from '@prisma/client'

const ServiceFieldSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['text', 'email', 'phone', 'date', 'select', 'file', 'number']),
  label: z.string().min(1, 'Le label est requis'),
  required: z.boolean().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  options: z.array(
    z.object({
      value: z.string(),
      label: z.string()
    })
  ).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    customValidation: z.string().optional()
  }).optional()
})

export const ServiceStepSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  type: z.nativeEnum(ServiceStepType),
  isRequired: z.boolean().default(true),
  order: z.number().min(0),
  fields: z.array(ServiceFieldSchema).optional(),
  validations: z.record(z.unknown()).optional()
})

export const CreateServiceSchema = z.object({
  name: z.string().min(1, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  category: z.nativeEnum(ServiceCategory, {
    required_error: "La catégorie est requise"
  }),
  organizationId: z.string().optional(),
  requiredDocuments: z.array(z.nativeEnum(DocumentType)).optional(),
  optionalDocuments: z.array(z.nativeEnum(DocumentType)).optional(),
  requiresAppointment: z.boolean().default(false),
  appointmentDuration: z.number().min(5).optional(),
  appointmentInstructions: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default("EUR"),
  steps: z.array(ServiceStepSchema)
})

export const UpdateServiceSchema = CreateServiceSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional()
})

export const AssignServiceSchema = z.object({
  serviceId: z.string(),
  organizationId: z.string()
})

export const CreateServiceInput = z.infer<typeof CreateServiceSchema>

export const quickEditSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  category: z.nativeEnum(ServiceCategory),
  description: z.string().optional()
})

export const quickEditInput = z.infer<typeof quickEditSchema>
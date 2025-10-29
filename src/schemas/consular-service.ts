import { z } from 'zod';
import {
  ServiceCategory,
  ServiceStepType,
  DocumentType,
  ProcessingMode,
  DeliveryMode,
  RequestStatus,
} from '@/convex/lib/constants';
import { CountryCodeSchema } from './inputs';
import { fieldTypes } from '@/types/consular-service';

export const ServiceFieldSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(fieldTypes),
  label: z.string().min(1, 'Le label est requis'),
  required: z.boolean().optional(),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  profileField: z.string().optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      customValidation: z.string().optional(),
    })
    .optional(),
});

export const ServiceStepSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  type: z.nativeEnum(ServiceStepType),
  isRequired: z.boolean().default(true),
  order: z.number().min(0),
  fields: z.array(ServiceFieldSchema).optional(),
});

export const GenerateDocumentSettingsSchema = z.object({
  templateId: z.string(),
  generateOnStatus: z.array(z.nativeEnum(RequestStatus)),
  settings: z.record(z.string(), z.any()).optional().nullable(),
  serviceId: z.string().optional().nullable(),
  id: z.string().optional().nullable(),
});

export type GenerateDocumentSettingsSchemaInput = z.infer<
  typeof GenerateDocumentSettingsSchema
>;

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  category: z.nativeEnum(ServiceCategory, {
    required_error: 'La catégorie est requise',
  }),
  isActive: z.boolean().optional(),
  organizationId: z.string().optional(),
  requiredDocuments: z.array(z.nativeEnum(DocumentType)).optional(),
  optionalDocuments: z.array(z.nativeEnum(DocumentType)).optional(),
  requiresAppointment: z.boolean().default(false),
  appointmentDuration: z.number().min(5).optional(),
  appointmentInstructions: z.string().optional(),
  deliveryAppointment: z.boolean().default(false),
  deliveryAppointmentDesc: z.string().optional(),
  deliveryAppointmentDuration: z.number().min(15).optional(),
  processingMode: z.nativeEnum(ProcessingMode).optional(),
  deliveryMode: z.array(z.nativeEnum(DeliveryMode)).optional(),
  proxyRequirements: z.string().optional(),
  isFree: z.boolean().default(true),
  price: z.number().min(0).optional(),
  currency: z.string().default('EUR'),
  steps: z.array(ServiceStepSchema),
  generateDocumentSettings: z
    .array(GenerateDocumentSettingsSchema, {
      required_error: 'Les paramètres de génération de documents sont requis',
      invalid_type_error:
        'Les paramètres de génération de documents doivent être un tableau',
    })
    .optional()
    .default([]),
});

export type ServiceSchemaInput = z.infer<typeof ServiceSchema>;

export const NewServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  category: z.nativeEnum(ServiceCategory),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  countryCode: CountryCodeSchema,
});

export type NewServiceSchemaInput = z.infer<typeof NewServiceSchema>;

// src/types/consular-service.ts
import { z } from 'zod'
import { DocumentType, ServiceRequestStatus } from '@prisma/client'
import { FullProfile } from '@/types/profile'

// Types des étapes
export enum ServiceStepType {
  DOCUMENTS = 'documents',
  INFORMATION = 'information',
  APPOINTMENT = 'appointment',
  REVIEW = 'review'
}

// Configuration d'un champ dynamique
export interface ServiceField {
  name: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  label: string
  required: boolean
  options?: { value: string; label: string }[]
  validation?: z.ZodType
  profileField?: keyof FullProfile // Pour le pré-remplissage
}

// Configuration d'un document requis
export interface ServiceDocument {
  type: DocumentType
  required: boolean
  description: string
  maxSize?: number
  acceptedFormats?: string[]
}

// Configuration d'une étape
export interface ServiceStepConfig {
  type: ServiceStepType
  title: string
  description?: string
  fields?: ServiceField[]
  documents?: ServiceDocument[]
  isRequired: boolean
}

// État du formulaire
export interface ServiceFormState {
  documents: Record<DocumentType, File | null>
  information: Record<string, any>
  appointment?: {
    date: Date
    time: string
    type: string
  }
  status: ServiceRequestStatus
}

// Schéma de validation Zod
export const ServiceFormSchema = z.object({
  documents: z.record(z.custom<File>()),
  information: z.record(z.any()),
  appointment: z.object({
    date: z.date(),
    time: z.string(),
    type: z.string()
  }).optional()
})

export type ServiceFormData = z.infer<typeof ServiceFormSchema>
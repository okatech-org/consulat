import { ConsularService as PrismaConsularService } from '@prisma/client'
import { JSX } from 'react'

// Types pour les champs de formulaire dynamiques
export enum ServiceFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  DATE = 'date',
  SELECT = 'select',
  TEL = 'tel',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  FILE = 'file'
}

export interface ServiceField {
  name: string
  type: ServiceFieldType
  label: string
  required?: boolean
  description?: string
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any
  options?: Array<{
    value: string
    label: string
  }>
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    customValidation?: string
  }
}

export interface ServiceStep {
  id: string
  title: string
  description: string
  isComplete?: boolean
  component?: JSX.Element
  profileFields?: string
  defaultValues?: Record<string, unknown>
  fields?: ServiceField[]
}

export interface ProfileFieldMapping {
  [formField: string]: string
}

// Type principal pour le service consulaire
export interface ConsularService extends PrismaConsularService {
  steps: ServiceStep[]
  requiresAppointment: boolean
  appointmentDuration: number | null
}
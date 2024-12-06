import { DocumentType, ConsularService as PrismaConsularService } from '@prisma/client'
import { JSX } from 'react'

export enum ServiceStepType {
  DOCUMENTS = 'DOCUMENTS',
  FORM = 'FORM',
  APPOINTMENT = 'APPOINTMENT',
  REVIEW = 'REVIEW'
}


// Types pour les champs de formulaire dynamiques
export enum ServiceFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  DATE = 'date',
  SELECT = 'select',
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
  defaultValue?: string
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

// Configuration des rendez-vous
export interface AppointmentConfig {
  duration: number
  availableDays: number[] // 0-6 pour les jours de la semaine
  availableHours: {
    start: string // Format "HH:mm"
    end: string
  }
  bufferTime: number // Temps en minutes entre les RDV
  location?: string
  instructions?: string
}

// Types pour les étapes
export interface BaseServiceStep {
  id: string
  order: number
  title: string
  description?: string
  isRequired: boolean
  stepType: ServiceStepType
  createdAt: Date
  updatedAt: Date
}

export interface FormServiceStep extends BaseServiceStep {
  stepType: ServiceStepType.FORM
  fields: ServiceField[]
}

export interface ServiceStep {
  key: string
  title: string
  description: string
  isComplete: boolean
  component: JSX.Element
  fields?: ServiceField[]
}

// Type principal pour le service consulaire
export interface ConsularService extends PrismaConsularService {
  steps: ServiceStep[]
  requiresAppointment: boolean
  appointmentDuration: number | null
}

// Types pour les formulaires
export interface ServiceFormData {
  documents: Record<DocumentType, File>
  appointment?: {
    date: Date
    duration: number
  }
  [key: string]: unknown
}

// Type pour le state du formulaire
export interface ServiceFormState {
  currentStep: number
  formData: ServiceFormData
  isSubmitting: boolean
  error?: string
  validation: {
    [key: string]: boolean
  }
}
``

// Type pour les actions du formulaire
export type ServiceFormAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ServiceFormData> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'UPDATE_VALIDATION'; payload: { field: string; isValid: boolean } }
  | { type: 'RESET_FORM' }

// Type pour le hook personnalisé
export interface UseServiceForm {
  state: ServiceFormState
  dispatch: React.Dispatch<ServiceFormAction>
  handleNext: () => Promise<void>
  handlePrevious: () => void
  handleSubmit: () => Promise<void>
  validateStep: (step: number) => Promise<boolean>
  isStepValid: (step: number) => boolean
}
import { ConsularService, ServiceCategory, ServiceStepType } from '@prisma/client'

// Types pour les champs de formulaire dynamiques
export interface ServiceField {
  name: string
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'file' | 'number'
  label: string
  required?: boolean
  description?: string
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: Record<string, any>
  profileField?: string
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
  id?: string
  order: number
  title: string
  description?: string
  type: ServiceStepType
  isRequired: boolean
  fields?: ServiceField[]
  validations?: Record<string, unknown>
}

export interface ConsularServiceWithRelations extends ConsularService {
  steps: ServiceStep[]
  organization: {
    id: string
    name: string
  }
}

export interface CreateServiceInput {
  name: string
  description?: string
  category: ServiceCategory
  requiredDocuments: DocumentType[]
  optionalDocuments?: DocumentType[]
  requiresAppointment: boolean
  appointmentDuration?: number
  price?: number
  currency?: string
  steps: Omit<ServiceStep, 'id'>[]
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string
  isActive?: boolean
}

export interface ProfileFieldMapping {
  [formField: string]: string
}

export interface ServiceStore {
  services: ConsularServiceWithRelations[]
  selectedService: ConsularServiceWithRelations | null
  isLoading: boolean
  error: string | null

  // Actions
  setServices: (services: ConsularServiceWithRelations[]) => void
  setSelectedService: (service: ConsularServiceWithRelations | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}
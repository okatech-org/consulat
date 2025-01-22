import { ConsularService, ServiceCategory, ServiceStepType, Organization } from '@prisma/client'


export const fieldTypes = [
  'text',
  'email',
  'phone',
  'date',
  'select',
  'address',
  'file',
  'checkbox',
  'radio',
  'textarea',
  'number'
] as const

export type ServiceFieldType = typeof fieldTypes[number]

// Types pour les champs de formulaire dynamiques
export interface ServiceField {
  name: string
  type: ServiceFieldType
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
  id: string | null
  order: number
  title: string
  description: string | null
  type: ServiceStepType
  isRequired: boolean
  fields: ServiceField[]
  validations: Record<string, unknown> | null
}

export interface ConsularServiceItem extends Omit<ConsularService, "fields"> {
  steps: ServiceStep[]
  organization: Organization | null
}

export interface UpdateServiceInput extends Partial<ConsularServiceItem> {}

export interface ProfileFieldMapping {
  [formField: string]: string
}

export interface ServiceStore {
  services: ConsularServiceItem[]
  selectedService: ConsularServiceItem | null
  isLoading: boolean
  error: string | null

  // Actions
  setServices: (services: ConsularServiceItem[]) => void
  setSelectedService: (service: ConsularServiceItem | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface ConsularServiceListingItem {
  id: string
  name: string
  description: string | null
  category: ServiceCategory
  isActive: boolean
  organization: {
    id: string
    name: string
  } | null
}
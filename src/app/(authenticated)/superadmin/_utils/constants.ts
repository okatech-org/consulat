// src/lib/services.ts/constants.ts

import { ServiceCategory, ServiceStepType } from '@prisma/client'

// Clés de traduction
export const SERVICE_CATEGORY_KEYS = {
  IDENTITY: 'identity',
  CIVIL_STATUS: 'civil_status',
  VISA: 'visa',
  CERTIFICATION: 'certification',
  REGISTRATION: 'registration',
  OTHER: 'other'
} as const

export const STEP_TYPE_KEYS = {
  FORM: 'form',
  DOCUMENTS: 'documents',
  APPOINTMENT: 'appointment',
  PAYMENT: 'payment',
  REVIEW: 'review'
} as const

export const FIELD_TYPE_KEYS = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  SELECT: 'select',
  FILE: 'file',
  NUMBER: 'number'
} as const

// Configurations avec les clés
export const SERVICE_CATEGORIES = [
  { value: ServiceCategory.IDENTITY, key: SERVICE_CATEGORY_KEYS.IDENTITY },
  { value: ServiceCategory.CIVIL_STATUS, key: SERVICE_CATEGORY_KEYS.CIVIL_STATUS },
  { value: ServiceCategory.VISA, key: SERVICE_CATEGORY_KEYS.VISA },
  { value: ServiceCategory.CERTIFICATION, key: SERVICE_CATEGORY_KEYS.CERTIFICATION },
  { value: ServiceCategory.REGISTRATION, key: SERVICE_CATEGORY_KEYS.REGISTRATION },
  { value: ServiceCategory.OTHER, key: SERVICE_CATEGORY_KEYS.OTHER }
]

export const STEP_TYPES = [
  { value: ServiceStepType.FORM, key: STEP_TYPE_KEYS.FORM },
  { value: ServiceStepType.DOCUMENTS, key: STEP_TYPE_KEYS.DOCUMENTS },
  { value: ServiceStepType.APPOINTMENT, key: STEP_TYPE_KEYS.APPOINTMENT },
  { value: ServiceStepType.PAYMENT, key: STEP_TYPE_KEYS.PAYMENT },
  { value: ServiceStepType.REVIEW, key: STEP_TYPE_KEYS.REVIEW }
]

export const FIELD_TYPES = [
  { value: 'text', key: FIELD_TYPE_KEYS.TEXT },
  { value: 'email', key: FIELD_TYPE_KEYS.EMAIL },
  { value: 'phone', key: FIELD_TYPE_KEYS.PHONE },
  { value: 'date', key: FIELD_TYPE_KEYS.DATE },
  { value: 'select', key: FIELD_TYPE_KEYS.SELECT },
  { value: 'file', key: FIELD_TYPE_KEYS.FILE },
  { value: 'number', key: FIELD_TYPE_KEYS.NUMBER }
]
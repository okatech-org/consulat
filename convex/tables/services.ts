import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  deliveryModeValidator,
  processingModeValidator,
  serviceCategoryValidator,
  serviceConfigValidator,
  serviceStatusValidator,
  serviceStepTypeValidator,
} from '../lib/validators'

export const services = defineTable({
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  category: serviceCategoryValidator, // Type-safe avec enum
  status: serviceStatusValidator, // Type-safe avec enum

  organizationId: v.id('organizations'),

  // Configuration du service
  config: serviceConfigValidator,

  // Étapes du service (intégrées)
  steps: v.array(
    v.object({
      order: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      isRequired: v.boolean(),
      type: serviceStepTypeValidator,
      fields: v.optional(v.any()),
      validations: v.optional(v.any()),
    }),
  ),

  // Modes de traitement et livraison
  processingMode: processingModeValidator,
  deliveryModes: v.array(deliveryModeValidator),

  // Configuration des rendez-vous
  requiresAppointment: v.boolean(),
  appointmentDuration: v.optional(v.number()),
  appointmentInstructions: v.optional(v.string()),

  // Configuration de livraison
  deliveryAppointment: v.boolean(),
  deliveryAppointmentDuration: v.optional(v.number()),
  deliveryAppointmentDesc: v.optional(v.string()),

  // Tarification
  isFree: v.boolean(),
  price: v.optional(v.number()),
  currency: v.optional(v.string()),

  // Workflow
  workflowId: v.optional(v.id('workflows')),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_code', ['code'])
  .index('by_organization', ['organizationId'])
  .index('by_category', ['category'])
  .index('by_status', ['status'])

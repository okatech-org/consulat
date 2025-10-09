import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  ServiceCategory,
  ServiceStatus,
  ProcessingMode,
  DeliveryMode,
  ServiceStepType,
} from '../lib/constants'

export const services = defineTable({
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  category: v.union(
    v.literal(ServiceCategory.Identity),
    v.literal(ServiceCategory.CivilStatus),
    v.literal(ServiceCategory.Visa),
    v.literal(ServiceCategory.Certification),
    v.literal(ServiceCategory.Transcript),
    v.literal(ServiceCategory.Registration),
    v.literal(ServiceCategory.Assistance),
    v.literal(ServiceCategory.TravelDocument),
    v.literal(ServiceCategory.Other),
  ),
  status: v.union(
    v.literal(ServiceStatus.Active),
    v.literal(ServiceStatus.Inactive),
    v.literal(ServiceStatus.Suspended),
  ),

  organizationId: v.id('organizations'),

  // Configuration du service
  config: v.object({
    requiredDocuments: v.array(v.string()),
    optionalDocuments: v.array(v.string()),
    steps: v.array(
      v.object({
        order: v.number(),
        name: v.string(),
        type: v.string(),
        required: v.boolean(),
        fields: v.optional(v.any()),
      })
    ),
    pricing: v.optional(
      v.object({
        amount: v.number(),
        currency: v.string(),
      })
    ),
  }),

  // Étapes du service (intégrées)
  steps: v.array(
    v.object({
      order: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      isRequired: v.boolean(),
      type: v.union(
        v.literal(ServiceStepType.Form),
        v.literal(ServiceStepType.Documents),
        v.literal(ServiceStepType.Appointment),
        v.literal(ServiceStepType.Payment),
        v.literal(ServiceStepType.Review),
        v.literal(ServiceStepType.Delivery),
      ),
      fields: v.optional(v.any()),
      validations: v.optional(v.any()),
    }),
  ),

  // Modes de traitement et livraison
  processingMode: v.union(
    v.literal(ProcessingMode.OnlineOnly),
    v.literal(ProcessingMode.PresenceRequired),
    v.literal(ProcessingMode.Hybrid),
    v.literal(ProcessingMode.ByProxy),
  ),
  deliveryModes: v.array(
    v.union(
      v.literal(DeliveryMode.InPerson),
      v.literal(DeliveryMode.Postal),
      v.literal(DeliveryMode.Electronic),
      v.literal(DeliveryMode.ByProxy),
    )
  ),

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

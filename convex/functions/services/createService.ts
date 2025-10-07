import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { validateService } from '../../helpers/validation'
import { ServiceStatus } from '../../lib/constants'
import type { ServiceCategory } from '../../lib/constants'

export const createService = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    status: v.optional(v.string()),
    organizationId: v.id('organizations'),
    config: v.any(),
    steps: v.array(v.any()),
    processingMode: v.string(),
    deliveryModes: v.array(v.string()),
    requiresAppointment: v.boolean(),
    appointmentDuration: v.optional(v.number()),
    appointmentInstructions: v.optional(v.string()),
    deliveryAppointment: v.boolean(),
    deliveryAppointmentDuration: v.optional(v.number()),
    deliveryAppointmentDesc: v.optional(v.string()),
    isFree: v.boolean(),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    workflowId: v.optional(v.id('workflows')),
  },
  handler: async (ctx, args) => {
    const serviceData = {
      name: args.name,
      code: args.code,
      price: args.price,
    }

    const validationErrors = validateService(serviceData)
    if (validationErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      )
    }

    const serviceId = await ctx.db.insert('services', {
      code: args.code,
      name: args.name,
      description: args.description,
      category: args.category as ServiceCategory,
      status: args.status ?? ServiceStatus.Active,
      organizationId: args.organizationId,
      config: args.config,
      steps: args.steps,
      processingMode: args.processingMode,
      deliveryModes: args.deliveryModes,
      requiresAppointment: args.requiresAppointment,
      appointmentDuration: args.appointmentDuration,
      appointmentInstructions: args.appointmentInstructions,
      deliveryAppointment: args.deliveryAppointment,
      deliveryAppointmentDuration: args.deliveryAppointmentDuration,
      deliveryAppointmentDesc: args.deliveryAppointmentDesc,
      isFree: args.isFree,
      price: args.price,
      currency: args.currency,
      workflowId: args.workflowId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Ajouter le service à l'organisation
    const organization = await ctx.db.get(args.organizationId)
    if (organization) {
      await ctx.db.patch(args.organizationId, {
        serviceIds: [...organization.serviceIds, serviceId],
        updatedAt: Date.now(),
      })
    }

    return serviceId
  },
})

import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { validateService } from '../../helpers/validation'
import { ServiceStatus } from '../../lib/constants'
import type { ServiceCategory } from '../../lib/constants'

export const updateService = mutation({
  args: {
    serviceId: v.id('services'),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    config: v.optional(v.any()),
    steps: v.optional(v.array(v.any())),
    processingMode: v.optional(v.string()),
    deliveryModes: v.optional(v.array(v.string())),
    requiresAppointment: v.optional(v.boolean()),
    appointmentDuration: v.optional(v.number()),
    appointmentInstructions: v.optional(v.string()),
    deliveryAppointment: v.optional(v.boolean()),
    deliveryAppointmentDuration: v.optional(v.number()),
    deliveryAppointmentDesc: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    workflowId: v.optional(v.id('workflows')),
  },
  handler: async (ctx, args) => {
    const existingService = await ctx.db.get(args.serviceId)
    if (!existingService) {
      throw new Error('Service not found')
    }

    // Validation si des champs critiques sont modifiés
    if (args.name || args.code || args.price !== undefined) {
      const serviceData = {
        name: args.name || existingService.name,
        code: args.code || existingService.code,
        price: args.price !== undefined ? args.price : existingService.price,
      }

      const validationErrors = validateService(serviceData)
      if (validationErrors.length > 0) {
        throw new Error(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
        )
      }
    }

    const updateData = {
      ...(args.code && { code: args.code }),
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.category && { category: args.category as ServiceCategory }),
      ...(args.status && { status: args.status as ServiceStatus }),
      ...(args.config && { config: args.config }),
      ...(args.steps && { steps: args.steps }),
      ...(args.processingMode && { processingMode: args.processingMode }),
      ...(args.deliveryModes && { deliveryModes: args.deliveryModes }),
      ...(args.requiresAppointment !== undefined && {
        requiresAppointment: args.requiresAppointment,
      }),
      ...(args.appointmentDuration !== undefined && {
        appointmentDuration: args.appointmentDuration,
      }),
      ...(args.appointmentInstructions !== undefined && {
        appointmentInstructions: args.appointmentInstructions,
      }),
      ...(args.deliveryAppointment !== undefined && {
        deliveryAppointment: args.deliveryAppointment,
      }),
      ...(args.deliveryAppointmentDuration !== undefined && {
        deliveryAppointmentDuration: args.deliveryAppointmentDuration,
      }),
      ...(args.deliveryAppointmentDesc !== undefined && {
        deliveryAppointmentDesc: args.deliveryAppointmentDesc,
      }),
      ...(args.isFree !== undefined && { isFree: args.isFree }),
      ...(args.price !== undefined && { price: args.price }),
      ...(args.currency !== undefined && { currency: args.currency }),
      ...(args.workflowId !== undefined && { workflowId: args.workflowId }),
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.serviceId, updateData)
    return args.serviceId
  },
})

export const updateServiceSteps = mutation({
  args: {
    serviceId: v.id('services'),
    steps: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, {
      steps: args.steps,
      updatedAt: Date.now(),
    })
    return args.serviceId
  },
})

export const updateServiceConfig = mutation({
  args: {
    serviceId: v.id('services'),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, {
      config: args.config,
      updatedAt: Date.now(),
    })
    return args.serviceId
  },
})

export const toggleServiceStatus = mutation({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    if (!service) {
      throw new Error('Service not found')
    }

    const newStatus =
      service.status === ServiceStatus.Active
        ? ServiceStatus.Inactive
        : ServiceStatus.Active

    await ctx.db.patch(args.serviceId, {
      status: newStatus,
      updatedAt: Date.now(),
    })

    return { serviceId: args.serviceId, newStatus }
  },
})

import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { validateRequest } from '../../helpers/validation'
import {
  ActivityType,
  RequestPriority,
  RequestStatus,
} from '../../lib/constants'

export const createRequest = mutation({
  args: {
    serviceId: v.id('services'),
    requesterId: v.id('users'),
    profileId: v.optional(v.id('profiles')),
    priority: v.optional(v.number()),
    formData: v.optional(v.any()),
    documentIds: v.optional(v.array(v.id('documents'))),
  },
  handler: async (ctx, args) => {
    const requestData = {
      serviceId: args.serviceId,
      requesterId: args.requesterId,
      priority: args.priority,
    }

    const validationErrors = validateRequest(requestData)
    if (validationErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      )
    }

    // Générer un numéro de demande unique
    const requestCount = await ctx.db.query('requests').collect()
    const requestNumber = `REQ-${String(requestCount.length + 1).padStart(6, '0')}`

    const requestId = await ctx.db.insert('requests', {
      number: requestNumber,
      serviceId: args.serviceId,
      requesterId: args.requesterId,
      profileId: args.profileId,
      status: RequestStatus.Draft,
      priority: args.priority || RequestPriority.Normal,
      formData: args.formData,
      documentIds: args.documentIds || [],
      assignedToId: undefined,
      assignedAt: undefined,
      activities: [
        {
          type: ActivityType.RequestCreated,
          actorId: args.requesterId,
          data: { requestNumber },
          timestamp: Date.now(),
        },
      ],
      actions: [],
      submittedAt: undefined,
      completedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return requestId
  },
})

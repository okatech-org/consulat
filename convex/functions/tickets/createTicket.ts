import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { FeedbackStatus } from '../../lib/constants'
import type { FeedbackCategory } from '../../lib/constants'

export const createTicket = mutation({
  args: {
    subject: v.string(),
    message: v.string(),
    category: v.string(),
    rating: v.optional(v.number()),
    userId: v.optional(v.id('users')),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
    organizationId: v.optional(v.id('organizations')),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (!args.userId && !args.email) {
      throw new Error('Either userId or email is required')
    }

    if (args.rating && (args.rating < 1 || args.rating > 5)) {
      throw new Error('Rating must be between 1 and 5')
    }

    const ticketId = await ctx.db.insert('tickets', {
      subject: args.subject,
      message: args.message,
      category: args.category as FeedbackCategory,
      rating: args.rating,
      status: FeedbackStatus.Pending,
      userId: args.userId,
      email: args.email,
      phoneNumber: args.phoneNumber,
      response: undefined,
      respondedById: undefined,
      respondedAt: undefined,
      serviceId: args.serviceId,
      requestId: args.requestId,
      organizationId: args.organizationId,
      metadata: args.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return ticketId
  },
})

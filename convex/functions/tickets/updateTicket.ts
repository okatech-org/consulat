import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { FeedbackStatus } from '../../lib/constants'

export const updateTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    subject: v.optional(v.string()),
    message: v.optional(v.string()),
    category: v.optional(v.string()),
    rating: v.optional(v.number()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existingTicket = await ctx.db.get(args.ticketId)
    if (!existingTicket) {
      throw new Error('Ticket not found')
    }

    if (args.rating && (args.rating < 1 || args.rating > 5)) {
      throw new Error('Rating must be between 1 and 5')
    }

    const updateData = {
      ...(args.subject && { subject: args.subject }),
      ...(args.message && { message: args.message }),
      ...(args.category && { category: args.category }),
      ...(args.rating !== undefined && { rating: args.rating }),
      ...(args.status && { status: args.status as FeedbackStatus }),
      ...(args.metadata && {
        metadata: { ...existingTicket.metadata, ...args.metadata },
      }),
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.ticketId, updateData)
    return args.ticketId
  },
})

export const respondToTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    response: v.string(),
    respondedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId)
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    await ctx.db.patch(args.ticketId, {
      response: args.response,
      respondedById: args.respondedById,
      respondedAt: Date.now(),
      status: FeedbackStatus.Resolved,
      updatedAt: Date.now(),
    })

    return args.ticketId
  },
})

export const closeTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    closedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      status: FeedbackStatus.Closed,
      updatedAt: Date.now(),
    })

    return args.ticketId
  },
})

import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getRequest = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId)
  },
})

export const getRequestByNumber = query({
  args: { number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_number', (q) => q.eq('number', args.number))
      .first()
  },
})

export const getAllRequests = query({
  args: {
    status: v.optional(v.string()),
    requesterId: v.optional(v.id('users')),
    assignedToId: v.optional(v.id('users')),
    serviceId: v.optional(v.id('services')),
    priority: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let requests: Array<any> = []

    if (args.requesterId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_requester', (q) =>
          q.eq('requesterId', args.requesterId!),
        )
        .order('desc')
        .collect()
    } else if (args.assignedToId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_assigned', (q) =>
          q.eq('assignedToId', args.assignedToId),
        )
        .order('desc')
        .collect()
    } else if (args.serviceId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_service', (q) => q.eq('serviceId', args.serviceId!))
        .order('desc')
        .collect()
    } else if (args.priority !== undefined && args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_priority_status', (q) =>
          q.eq('priority', args.priority!).eq('status', args.status!),
        )
        .order('desc')
        .collect()
    } else if (args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()
    } else {
      requests = await ctx.db.query('requests').order('desc').collect()
    }

    return args.limit ? requests.slice(0, args.limit) : requests
  },
})

export const getRequestsByRequester = query({
  args: { requesterId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.requesterId))
      .order('desc')
      .collect()
  },
})

export const getRequestsByAssignee = query({
  args: { assignedToId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_assigned', (q) => q.eq('assignedToId', args.assignedToId))
      .order('desc')
      .collect()
  },
})

export const getRequestsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect()
  },
})

export const getRequestsByService = query({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_service', (q) => q.eq('serviceId', args.serviceId))
      .order('desc')
      .collect()
  },
})

export const searchRequests = query({
  args: {
    searchTerm: v.string(),
    requesterId: v.optional(v.id('users')),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let requests: Array<any> = []

    if (args.requesterId && args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_requester', (q) =>
          q.eq('requesterId', args.requesterId!),
        )
        .filter((q) => q.eq(q.field('status'), args.status!))
        .collect()
    } else if (args.requesterId) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_requester', (q) =>
          q.eq('requesterId', args.requesterId!),
        )
        .collect()
    } else if (args.status) {
      requests = await ctx.db
        .query('requests')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    } else {
      requests = await ctx.db.query('requests').collect()
    }

    return requests.filter((request) =>
      request.number.toLowerCase().includes(args.searchTerm.toLowerCase()),
    )
  },
})

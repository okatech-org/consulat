import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getTicket = query({
  args: { ticketId: v.id('tickets') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId)
  },
})

export const getAllTickets = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    userId: v.optional(v.id('users')),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tickets: Array<any> = []

    if (args.userId && args.category && args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .filter((q) =>
          q.and(
            q.eq(q.field('category'), args.category!),
            q.eq(q.field('status'), args.status!),
          ),
        )
        .order('desc')
        .collect()
    } else if (args.userId && args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .filter((q) => q.eq(q.field('category'), args.category!))
        .order('desc')
        .collect()
    } else if (args.userId && args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()
    } else if (args.category && args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()
    } else if (args.userId) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .order('desc')
        .collect()
    } else if (args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .order('desc')
        .collect()
    } else if (args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()
    } else {
      tickets = await ctx.db.query('tickets').order('desc').collect()
    }

    if (args.organizationId) {
      tickets = tickets.filter(
        (ticket) => ticket.organizationId === args.organizationId,
      )
    }

    return args.limit ? tickets.slice(0, args.limit) : tickets
  },
})

export const getTicketsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tickets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  },
})

export const getTicketsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tickets')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect()
  },
})

export const getTicketsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tickets')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .order('desc')
      .collect()
  },
})

export const getRecentTickets = query({
  args: {
    limit: v.optional(v.number()),
    organizationId: v.optional(v.id('organizations')),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('by_created_at', (q) =>
        q.gte('createdAt', Date.now() - 7 * 24 * 60 * 60 * 1000),
      )
      .order('desc')
      .collect()

    let filteredTickets = tickets

    if (args.organizationId) {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.organizationId === args.organizationId,
      )
    }

    return args.limit ? filteredTickets.slice(0, args.limit) : filteredTickets
  },
})

export const searchTickets = query({
  args: {
    searchTerm: v.string(),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tickets: Array<any> = []

    if (args.status && args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('category'), args.category!))
        .collect()
    } else if (args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    } else if (args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .collect()
    } else {
      tickets = await ctx.db.query('tickets').collect()
    }

    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (ticket.email &&
          ticket.email.toLowerCase().includes(args.searchTerm.toLowerCase())),
    )
  },
})

import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { FeedbackStatus } from '../lib/constants';
import { Doc } from '../_generated/dataModel';
import {
  feedbackCategoryValidator,
  feedbackStatusValidator,
} from '../lib/validators';

// Mutations
export const createTicket = mutation({
  args: {
    subject: v.string(),
    message: v.string(),
    category: feedbackCategoryValidator,
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
      throw new Error('Either userId or email is required');
    }

    if (args.rating && (args.rating < 1 || args.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const ticketId = await ctx.db.insert('tickets', {
      subject: args.subject,
      message: args.message,
      category: args.category,
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
    });

    return ticketId;
  },
});

export const updateTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    subject: v.optional(v.string()),
    message: v.optional(v.string()),
    category: v.optional(feedbackCategoryValidator),
    rating: v.optional(v.number()),
    status: v.optional(feedbackStatusValidator),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existingTicket = await ctx.db.get(args.ticketId);
    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    if (args.rating && (args.rating < 1 || args.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updateData = {
      ...(args.subject && { subject: args.subject }),
      ...(args.message && { message: args.message }),
      ...(args.category && { category: args.category }),
      ...(args.rating !== undefined && { rating: args.rating }),
      ...(args.status && { status: args.status }),
      ...(args.metadata && {
        metadata: { ...existingTicket.metadata, ...args.metadata },
      }),
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.ticketId, updateData);
    return args.ticketId;
  },
});

export const respondToTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    response: v.string(),
    respondedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    await ctx.db.patch(args.ticketId, {
      response: args.response,
      respondedById: args.respondedById,
      respondedAt: Date.now(),
      status: FeedbackStatus.Resolved,
    });

    return args.ticketId;
  },
});

export const closeTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    closedById: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      status: FeedbackStatus.Closed,
    });

    return args.ticketId;
  },
});

// Queries
export const getTicket = query({
  args: { ticketId: v.id('tickets') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId);
  },
});

export const getAllTickets = query({
  args: {
    status: v.optional(feedbackStatusValidator),
    category: v.optional(feedbackCategoryValidator),
    userId: v.optional(v.id('users')),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tickets: Array<Doc<'tickets'>> = [];

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
        .collect();
    } else if (args.userId && args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .filter((q) => q.eq(q.field('category'), args.category!))
        .order('desc')
        .collect();
    } else if (args.userId && args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect();
    } else if (args.category && args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect();
    } else if (args.userId) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_user', (q) => q.eq('userId', args.userId))
        .order('desc')
        .collect();
    } else if (args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .order('desc')
        .collect();
    } else if (args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      tickets = await ctx.db.query('tickets').order('desc').collect();
    }

    if (args.organizationId) {
      tickets = tickets.filter((ticket) => ticket.organizationId === args.organizationId);
    }

    return args.limit ? tickets.slice(0, args.limit) : tickets;
  },
});

export const getTicketsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tickets')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
  },
});

export const getTicketsByStatus = query({
  args: { status: feedbackStatusValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tickets')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect();
  },
});

export const getTicketsByCategory = query({
  args: { category: feedbackCategoryValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tickets')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .order('desc')
      .collect();
  },
});

export const getRecentTickets = query({
  args: {
    limit: v.optional(v.number()),
    organizationId: v.optional(v.id('organizations')),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('by_creation_time', (q) =>
        q.gte('_creationTime', Date.now() - 7 * 24 * 60 * 60 * 1000),
      )
      .order('desc')
      .collect();

    let filteredTickets = tickets;

    if (args.organizationId) {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.organizationId === args.organizationId,
      );
    }

    return args.limit ? filteredTickets.slice(0, args.limit) : filteredTickets;
  },
});

export const searchTickets = query({
  args: {
    searchTerm: v.string(),
    status: v.optional(feedbackStatusValidator),
    category: v.optional(feedbackCategoryValidator),
  },
  handler: async (ctx, args) => {
    let tickets: Array<Doc<'tickets'>> = [];

    if (args.status && args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('category'), args.category!))
        .collect();
    } else if (args.status) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else if (args.category) {
      tickets = await ctx.db
        .query('tickets')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .collect();
    } else {
      tickets = await ctx.db.query('tickets').collect();
    }

    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (ticket.email &&
          ticket.email.toLowerCase().includes(args.searchTerm.toLowerCase())),
    );
  },
});

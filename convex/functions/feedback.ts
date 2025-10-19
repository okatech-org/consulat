import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { Doc } from '../_generated/dataModel';
import { feedbackCategoryValidator, feedbackStatusValidator } from '../lib/validators';
import { FeedbackStatus } from '../lib/constants';

// Mutations
export const createFeedback = mutation({
  args: {
    subject: v.string(),
    message: v.string(),
    category: feedbackCategoryValidator,
    rating: v.optional(v.number()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    serviceId: v.optional(v.id('services')),
    requestId: v.optional(v.id('requests')),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const ticketId = await ctx.db.insert('tickets', {
      subject: args.subject,
      message: args.message,
      category: args.category,
      status: FeedbackStatus.Pending,
      rating: args.rating,
      email: args.email,
      phoneNumber: args.phoneNumber,
      userId: user._id,
      serviceId: args.serviceId,
      requestId: args.requestId,
      organizationId: undefined,
      response: undefined,
      respondedAt: undefined,
      respondedById: undefined,
    });

    return ticketId;
  },
});

export const updateFeedbackStatus = mutation({
  args: {
    ticketId: v.id('tickets'),
    status: feedbackStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      status: args.status,
    });

    return args.ticketId;
  },
});

export const respondToFeedback = mutation({
  args: {
    ticketId: v.id('tickets'),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.ticketId, {
      response: args.response,
      respondedAt: Date.now(),
      respondedById: user._id,
      status: FeedbackStatus.Resolved,
    });

    return args.ticketId;
  },
});

// Queries
export const getMyFeedbacks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const feedbacks = await ctx.db
      .query('tickets')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return feedbacks;
  },
});

export const getFeedbackStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const allFeedbacks = await ctx.db
      .query('tickets')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    const pending = allFeedbacks.filter(
      (f) => f.status === FeedbackStatus.Pending,
    ).length;
    const inReview = allFeedbacks.filter(
      (f) => f.status === FeedbackStatus.InReview,
    ).length;
    const resolved = allFeedbacks.filter(
      (f) => f.status === FeedbackStatus.Resolved,
    ).length;
    const closed = allFeedbacks.filter(
      (f) => f.status === FeedbackStatus.Closed,
    ).length;

    return {
      total: allFeedbacks.length,
      pending,
      inReview,
      resolved,
      closed,
    };
  },
});

export const getAdminFeedbackList = query({
  args: {
    status: v.optional(feedbackStatusValidator),
    category: v.optional(feedbackCategoryValidator),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let feedbacks: Array<Doc<'tickets'>> = [];

    if (args.status) {
      feedbacks = await ctx.db
        .query('tickets')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      feedbacks = await ctx.db.query('tickets').order('desc').collect();
    }

    // Filter by category
    if (args.category) {
      feedbacks = feedbacks.filter((f) => f.category === args.category);
    }

    // Filter by organization
    if (args.organizationId) {
      feedbacks = feedbacks.filter((f) => f.organizationId === args.organizationId);
    }

    // Apply limit
    if (args.limit) {
      feedbacks = feedbacks.slice(0, args.limit);
    }

    // Enrich with user data
    const enrichedFeedbacks = await Promise.all(
      feedbacks.map(async (feedback) => {
        const user = feedback.userId ? await ctx.db.get(feedback.userId) : null;
        const respondedBy = feedback.respondedById
          ? await ctx.db.get(feedback.respondedById)
          : null;

        return {
          ...feedback,
          user,
          respondedBy,
        };
      }),
    );

    const total = feedbacks.length;
    const page = 1; // Since we're doing client-side pagination

    return {
      items: enrichedFeedbacks,
      pagination: {
        total,
        page,
        limit: args.limit || total,
        totalPages: 1,
      },
    };
  },
});

export const getFeedback = query({
  args: { ticketId: v.id('tickets') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId);
  },
});

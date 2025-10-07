import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.clerkUserId))
      .first()
  },
})

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

export const getAllUsers = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users: Array<any> = []

    if (args.status) {
      users = await ctx.db
        .query('users')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()
    } else {
      users = await ctx.db.query('users').order('desc').collect()
    }

    return args.limit ? users.slice(0, args.limit) : users
  },
})

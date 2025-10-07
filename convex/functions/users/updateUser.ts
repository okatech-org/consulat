import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { validateUser } from '../../helpers/validation'

export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db.get(args.userId)
    if (!existingUser) {
      throw new Error('User not found')
    }

    const updateData = {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      roles: args.roles,
      status: args.status,
      countryCode: args.countryCode,
      updatedAt: Date.now(),
    }

    // Validation si des champs critiques sont modifiés
    if (args.email || args.phoneNumber) {
      const userData = {
        name: `${args.firstName || existingUser.firstName || ''} ${args.lastName || existingUser.lastName || ''}`.trim(),
        email: args.email || existingUser.email,
        phoneNumber: args.phoneNumber || existingUser.phoneNumber,
      }

      const validationErrors = validateUser(userData)
      if (validationErrors.length > 0) {
        throw new Error(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
        )
      }
    }

    await ctx.db.patch(args.userId, updateData)
    return args.userId
  },
})

export const updateUserLastActive = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    })
    return args.userId
  },
})

export const softDeleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: 'inactive',
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    })
    return args.userId
  },
})

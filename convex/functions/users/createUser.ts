import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { validateUser } from '../../helpers/validation'
import { UserRole, UserStatus } from '../../lib/constants'

export const createUser = mutation({
  args: {
    userId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userData = {
      name: `${args.firstName || ''} ${args.lastName || ''}`.trim(),
      email: args.email,
      phoneNumber: args.phoneNumber,
    }

    const validationErrors = validateUser(userData)
    if (validationErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      )
    }

    const userId = await ctx.db.insert('users', {
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      roles: args.roles || [UserRole.User],
      status: UserStatus.Active,
      countryCode: args.countryCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return userId
  },
})

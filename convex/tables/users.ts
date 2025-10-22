import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { userRoleValidator, userStatusValidator, countryCodeValidator } from '../lib/validators';

export const users = defineTable({
  userId: v.string(),
  legacyId: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  email: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
  phoneNumberVerified: v.optional(v.boolean()),

  roles: v.array(userRoleValidator),
  status: userStatusValidator,

  profileId: v.optional(v.id('profiles')),
  countryCode: v.optional(countryCodeValidator),

  deletedAt: v.optional(v.number()),
  lastActiveAt: v.optional(v.number()),
})
  .index('by_userId', ['userId'])
  .index('by_legacyId', ['legacyId'])
  .index('by_email', ['email'])
  .index('by_phone', ['phoneNumber'])
  .index('by_status', ['status']);

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { userRoleValidator, userStatusValidator } from '../lib/validators';

// Table Users - Données d'authentification
export const users = defineTable({
  // Identifiants
  userId: v.string(), // ID from Clerk
  legacyId: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  email: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),

  // Rôles et permissions
  roles: v.array(userRoleValidator),
  status: userStatusValidator,

  // Relations
  profileId: v.optional(v.id('profiles')),
  countryCode: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
  lastActiveAt: v.optional(v.number()),
})
  .index('by_userId', ['userId'])
  .index('by_legacyId', ['legacyId'])
  .index('by_email', ['email'])
  .index('by_phone', ['phoneNumber'])
  .index('by_status', ['status']);

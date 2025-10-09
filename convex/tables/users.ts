import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { UserRole, UserStatus } from '../lib/constants'

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
  roles: v.array(
    v.union(
      v.literal(UserRole.User),
      v.literal(UserRole.Agent),
      v.literal(UserRole.Admin),
      v.literal(UserRole.SuperAdmin),
      v.literal(UserRole.Manager),
      v.literal(UserRole.IntelAgent),
      v.literal(UserRole.EducationAgent),
    )
  ),
  status: v.union(
    v.literal(UserStatus.Active),
    v.literal(UserStatus.Inactive),
    v.literal(UserStatus.Suspended),
  ),

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
  .index('by_status', ['status'])

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  userPermissionValidator,
  userRoleValidator,
  userStatusValidator,
} from '../lib/validators'

// Table pour gérer les appartenances aux organisations
export const memberships = defineTable({
  userId: v.id('users'),
  organizationId: v.id('organizations'),

  // Rôle et permissions
  role: userRoleValidator,
  permissions: v.array(userPermissionValidator),

  // Statut de l'adhésion
  status: userStatusValidator,

  // Dates importantes
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),
  lastActiveAt: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_organization', ['organizationId'])
  .index('by_user_organization', ['userId', 'organizationId'])
  .index('by_status', ['status'])
  .index('by_role', ['role'])

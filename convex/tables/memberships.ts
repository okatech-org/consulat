import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  countryCodeValidator,
  membershipStatusValidator,
  userPermissionValidator,
  userRoleValidator,
} from '../lib/validators';

// Table pour gérer les appartenances aux organisations
export const memberships = defineTable({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),

  userId: v.id('users'),
  organizationId: v.id('organizations'),

  // Rôle et permissions
  role: userRoleValidator,
  permissions: v.array(userPermissionValidator),

  // Statut de l'adhésion
  status: membershipStatusValidator,
  assignedCountries: v.array(countryCodeValidator),

  managerId: v.optional(v.id('users')),

  assignedServices: v.array(v.id('services')),

  // Dates importantes
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),
  lastActiveAt: v.optional(v.number()),
})
  .index('by_user', ['userId'])
  .index('by_organization', ['organizationId'])
  .index('by_user_organization', ['userId', 'organizationId'])
  .index('by_status', ['status'])
  .index('by_role', ['role'])
  .index('by_role_and_organization', ['role', 'organizationId'])
  .index('by_manager', ['managerId']);

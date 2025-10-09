import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { UserRole, UserStatus, UserPermission } from '../lib/constants'

// Table pour gérer les appartenances aux organisations
export const memberships = defineTable({
  userId: v.id('users'),
  organizationId: v.id('organizations'),

  // Rôle et permissions
  role: v.union(
    v.literal(UserRole.User),
    v.literal(UserRole.Agent),
    v.literal(UserRole.Admin),
    v.literal(UserRole.SuperAdmin),
    v.literal(UserRole.Manager),
    v.literal(UserRole.IntelAgent),
    v.literal(UserRole.EducationAgent),
  ),
  permissions: v.array(
    v.union(
      v.literal(UserPermission.ProfileRead),
      v.literal(UserPermission.ProfileWrite),
      v.literal(UserPermission.ProfileDelete),
      v.literal(UserPermission.RequestRead),
      v.literal(UserPermission.RequestWrite),
      v.literal(UserPermission.RequestDelete),
      v.literal(UserPermission.DocumentRead),
      v.literal(UserPermission.DocumentWrite),
      v.literal(UserPermission.DocumentDelete),
      v.literal(UserPermission.AppointmentRead),
      v.literal(UserPermission.AppointmentWrite),
      v.literal(UserPermission.AppointmentDelete),
      v.literal(UserPermission.NotificationRead),
      v.literal(UserPermission.NotificationWrite),
      v.literal(UserPermission.NotificationDelete),
      v.literal(UserPermission.AddressRead),
      v.literal(UserPermission.AddressWrite),
      v.literal(UserPermission.AddressDelete),
      v.literal(UserPermission.CountryRead),
      v.literal(UserPermission.CountryWrite),
      v.literal(UserPermission.CountryDelete),
      v.literal(UserPermission.EmergencyContactRead),
      v.literal(UserPermission.EmergencyContactWrite),
      v.literal(UserPermission.EmergencyContactDelete),
      v.literal(UserPermission.FeedbackRead),
      v.literal(UserPermission.FeedbackWrite),
      v.literal(UserPermission.FeedbackDelete),
      v.literal(UserPermission.OrganizationRead),
      v.literal(UserPermission.OrganizationWrite),
      v.literal(UserPermission.OrganizationDelete),
      v.literal(UserPermission.ServiceRead),
      v.literal(UserPermission.ServiceWrite),
      v.literal(UserPermission.ServiceDelete),
      v.literal(UserPermission.UserRead),
      v.literal(UserPermission.UserWrite),
      v.literal(UserPermission.UserDelete),
    )
  ),

  // Statut de l'adhésion
  status: v.union(
    v.literal(UserStatus.Active),
    v.literal(UserStatus.Inactive),
    v.literal(UserStatus.Suspended),
  ),

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

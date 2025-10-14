import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { feedbackCategoryValidator, feedbackStatusValidator } from '../lib/validators';

export const tickets = defineTable({
  subject: v.string(),
  message: v.string(),
  category: feedbackCategoryValidator,
  rating: v.optional(v.number()), // 1-5
  status: feedbackStatusValidator,

  // Relations
  userId: v.optional(v.id('users')),
  email: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),

  // Réponse de l'admin
  response: v.optional(v.string()),
  respondedById: v.optional(v.id('users')),
  respondedAt: v.optional(v.number()),

  // Service ou demande associée
  serviceId: v.optional(v.id('services')),
  requestId: v.optional(v.id('requests')),
  organizationId: v.optional(v.id('organizations')),

  // Métadonnées
  metadata: v.optional(v.any()),
})
  .index('by_user', ['userId'])
  .index('by_category', ['category'])
  .index('by_status', ['status'])
  .index('by_service', ['serviceId'])
  .index('by_request', ['requestId'])
  .index('by_organization', ['organizationId']);

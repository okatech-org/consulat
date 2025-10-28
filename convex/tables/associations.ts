import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Table for associations (community organizations, NGOs, etc.)
 */
export const associations = defineTable({
  name: v.string(),
  category: v.string(),
  zone: v.string(),
  city: v.string(),
  country: v.optional(v.string()),
  coordinates: v.optional(
    v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
  ),
  website: v.optional(v.string()),
  logo: v.optional(v.string()),
  memberCount: v.optional(v.number()),
  riskLevel: v.union(
    v.literal('faible'),
    v.literal('moyen'),
    v.literal('eleve'),
    v.literal('critique'),
  ),
  monitoringStatus: v.union(
    v.literal('actif'),
    v.literal('passif'),
    v.literal('archive'),
  ),
  lastActivity: v.optional(v.number()),
  description: v.optional(v.string()),
  activities: v.optional(v.array(v.string())),
  funding: v.optional(v.array(v.string())),
  influence: v.union(
    v.literal('local'),
    v.literal('regional'),
    v.literal('national'),
    v.literal('international'),
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_category', ['category'])
  .index('by_zone', ['zone'])
  .index('by_city', ['city'])
  .index('by_risk_level', ['riskLevel'])
  .index('by_monitoring_status', ['monitoringStatus'])
  .index('by_influence', ['influence'])
  .searchIndex('search_associations', {
    searchField: 'name',
    filterFields: ['category', 'zone', 'riskLevel', 'monitoringStatus'],
  });

/**
 * Table for association-profile relationships (membership)
 */
export const associationMembers = defineTable({
  associationId: v.id('associations'),
  profileId: v.id('profiles'),
  role: v.optional(v.string()),
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),
  isActive: v.boolean(),
  influenceLevel: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_association', ['associationId'])
  .index('by_profile', ['profileId'])
  .index('by_active', ['isActive'])
  .index('by_association_and_active', ['associationId', 'isActive']);

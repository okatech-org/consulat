import { v } from 'convex/values';
import { query, mutation } from '../_generated/server';

/**
 * Get all associations with optional filters
 */
export const getAssociations = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    zone: v.optional(v.string()),
    riskLevel: v.optional(v.union(
      v.literal('faible'),
      v.literal('moyen'),
      v.literal('eleve'),
      v.literal('critique')
    )),
    monitoringStatus: v.optional(v.union(
      v.literal('actif'),
      v.literal('passif'),
      v.literal('archive')
    )),
    influence: v.optional(v.union(
      v.literal('local'),
      v.literal('regional'),
      v.literal('national'),
      v.literal('international')
    )),
  },
  handler: async (ctx, args) => {
    let associations = await ctx.db.query('associations').collect();

    // Apply filters
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      associations = associations.filter(asso =>
        asso.name.toLowerCase().includes(searchLower) ||
        asso.city.toLowerCase().includes(searchLower) ||
        asso.category.toLowerCase().includes(searchLower)
      );
    }

    if (args.category) {
      associations = associations.filter(asso => asso.category === args.category);
    }

    if (args.zone) {
      associations = associations.filter(asso => asso.zone === args.zone);
    }

    if (args.riskLevel) {
      associations = associations.filter(asso => asso.riskLevel === args.riskLevel);
    }

    if (args.monitoringStatus) {
      associations = associations.filter(asso => asso.monitoringStatus === args.monitoringStatus);
    }

    if (args.influence) {
      associations = associations.filter(asso => asso.influence === args.influence);
    }

    // Return with IDs
    return associations.map(asso => ({
      ...asso,
      id: asso._id,
    }));
  },
});

/**
 * Get association by ID
 */
export const getAssociationById = query({
  args: {
    associationId: v.id('associations'),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    // Get member count
    const members = await ctx.db
      .query('associationMembers')
      .withIndex('by_association_and_active', (q) =>
        q.eq('associationId', args.associationId).eq('isActive', true)
      )
      .collect();

    return {
      ...association,
      id: association._id,
      activeMemberCount: members.length,
    };
  },
});

/**
 * Get associations statistics
 */
export const getAssociationsStatistics = query({
  args: {},
  handler: async (ctx) => {
    const associations = await ctx.db.query('associations').collect();

    const byCategory: Record<string, number> = {};
    const byZone: Record<string, number> = {};
    const byRiskLevel: Record<string, number> = {};
    const byMonitoringStatus: Record<string, number> = {};
    const byInfluence: Record<string, number> = {};

    let totalMembers = 0;

    associations.forEach(asso => {
      byCategory[asso.category] = (byCategory[asso.category] || 0) + 1;
      byZone[asso.zone] = (byZone[asso.zone] || 0) + 1;
      byRiskLevel[asso.riskLevel] = (byRiskLevel[asso.riskLevel] || 0) + 1;
      byMonitoringStatus[asso.monitoringStatus] = (byMonitoringStatus[asso.monitoringStatus] || 0) + 1;
      byInfluence[asso.influence] = (byInfluence[asso.influence] || 0) + 1;
      totalMembers += asso.memberCount || 0;
    });

    return {
      total: associations.length,
      totalMembers,
      averageMembers: associations.length > 0 ? Math.round(totalMembers / associations.length) : 0,
      byCategory,
      byZone,
      byRiskLevel,
      byMonitoringStatus,
      byInfluence,
      activeCount: byMonitoringStatus['actif'] || 0,
      highRiskCount: (byRiskLevel['eleve'] || 0) + (byRiskLevel['critique'] || 0),
    };
  },
});

/**
 * Get map data for associations (with coordinates)
 */
export const getAssociationsMapData = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    zone: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    monitoringStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let associations = await ctx.db.query('associations').collect();

    // Apply same filters as getAssociations
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      associations = associations.filter(asso =>
        asso.name.toLowerCase().includes(searchLower) ||
        asso.city.toLowerCase().includes(searchLower) ||
        asso.category.toLowerCase().includes(searchLower)
      );
    }

    if (args.category) {
      associations = associations.filter(asso => asso.category === args.category);
    }

    if (args.zone) {
      associations = associations.filter(asso => asso.zone === args.zone);
    }

    if (args.riskLevel) {
      associations = associations.filter(asso => asso.riskLevel === args.riskLevel);
    }

    if (args.monitoringStatus) {
      associations = associations.filter(asso => asso.monitoringStatus === args.monitoringStatus);
    }

    // Return only associations with coordinates for map display
    return associations
      .filter(asso => asso.coordinates)
      .map(asso => ({
        id: asso._id,
        name: asso.name,
        category: asso.category,
        city: asso.city,
        zone: asso.zone,
        riskLevel: asso.riskLevel,
        memberCount: asso.memberCount || 0,
        status: asso.monitoringStatus,
        activities: asso.activities || [],
        influence: asso.influence,
        coordinates: asso.coordinates,
      }));
  },
});

/**
 * Get association members (profiles)
 */
export const getAssociationMembers = query({
  args: {
    associationId: v.id('associations'),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let memberships = await ctx.db
      .query('associationMembers')
      .withIndex('by_association', (q) => q.eq('associationId', args.associationId))
      .collect();

    if (args.activeOnly) {
      memberships = memberships.filter(m => m.isActive);
    }

    // Enrich with profile data
    const enrichedMembers = await Promise.all(
      memberships.map(async (membership) => {
        const profile = await ctx.db.get(membership.profileId);
        return {
          ...membership,
          id: membership._id,
          profile: profile
            ? {
                id: profile._id,
                firstName: profile.personal.firstName,
                lastName: profile.personal.lastName,
                email: profile.contacts.email,
              }
            : undefined,
        };
      })
    );

    return enrichedMembers;
  },
});

/**
 * Get profile associations (which associations a profile belongs to)
 */
export const getProfileAssociations = query({
  args: {
    profileId: v.id('profiles'),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let memberships = await ctx.db
      .query('associationMembers')
      .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
      .collect();

    if (args.activeOnly) {
      memberships = memberships.filter(m => m.isActive);
    }

    // Enrich with association data
    const enrichedAssociations = await Promise.all(
      memberships.map(async (membership) => {
        const association = await ctx.db.get(membership.associationId);
        return {
          ...membership,
          id: membership._id,
          association: association
            ? {
                id: association._id,
                name: association.name,
                category: association.category,
                riskLevel: association.riskLevel,
                city: association.city,
              }
            : undefined,
        };
      })
    );

    return enrichedAssociations;
  },
});

/**
 * Create a new association
 */
export const createAssociation = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    zone: v.string(),
    city: v.string(),
    country: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
    website: v.optional(v.string()),
    memberCount: v.optional(v.number()),
    riskLevel: v.union(
      v.literal('faible'),
      v.literal('moyen'),
      v.literal('eleve'),
      v.literal('critique')
    ),
    monitoringStatus: v.union(
      v.literal('actif'),
      v.literal('passif'),
      v.literal('archive')
    ),
    description: v.optional(v.string()),
    activities: v.optional(v.array(v.string())),
    funding: v.optional(v.array(v.string())),
    influence: v.union(
      v.literal('local'),
      v.literal('regional'),
      v.literal('national'),
      v.literal('international')
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const associationId = await ctx.db.insert('associations', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return associationId;
  },
});

/**
 * Update association
 */
export const updateAssociation = mutation({
  args: {
    associationId: v.id('associations'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    zone: v.optional(v.string()),
    city: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
    website: v.optional(v.string()),
    memberCount: v.optional(v.number()),
    riskLevel: v.optional(v.union(
      v.literal('faible'),
      v.literal('moyen'),
      v.literal('eleve'),
      v.literal('critique')
    )),
    monitoringStatus: v.optional(v.union(
      v.literal('actif'),
      v.literal('passif'),
      v.literal('archive')
    )),
    description: v.optional(v.string()),
    activities: v.optional(v.array(v.string())),
    influence: v.optional(v.union(
      v.literal('local'),
      v.literal('regional'),
      v.literal('national'),
      v.literal('international')
    )),
  },
  handler: async (ctx, args) => {
    const { associationId, ...updates } = args;

    await ctx.db.patch(associationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return associationId;
  },
});

/**
 * Delete association
 */
export const deleteAssociation = mutation({
  args: {
    associationId: v.id('associations'),
  },
  handler: async (ctx, args) => {
    // Delete all memberships first
    const memberships = await ctx.db
      .query('associationMembers')
      .withIndex('by_association', (q) => q.eq('associationId', args.associationId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete the association
    await ctx.db.delete(args.associationId);

    return { success: true };
  },
});

/**
 * Add member to association
 */
export const addMember = mutation({
  args: {
    associationId: v.id('associations'),
    profileId: v.id('profiles'),
    role: v.optional(v.string()),
    influenceLevel: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const membershipId = await ctx.db.insert('associationMembers', {
      associationId: args.associationId,
      profileId: args.profileId,
      role: args.role,
      influenceLevel: args.influenceLevel,
      notes: args.notes,
      joinedAt: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return membershipId;
  },
});

/**
 * Remove member from association
 */
export const removeMember = mutation({
  args: {
    membershipId: v.id('associationMembers'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.membershipId, {
      isActive: false,
      leftAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

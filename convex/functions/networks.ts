import { v } from 'convex/values';
import { query } from '../_generated/server';
import type { Doc, Id } from '../_generated/dataModel';

/**
 * Calculate influence score for a profile (0-100)
 * Based on:
 * - Number of associations (10 points each, max 50)
 * - Intelligence notes count (20 points if >= 5 notes)
 * - Association roles (15 points for leadership roles)
 * - Risk level from notes (15 points for high risk)
 */
function calculateProfileInfluence(
  associationCount: number,
  notesCount: number,
  hasLeadershipRole: boolean,
  hasHighRisk: boolean
): number {
  let score = 0;

  // Associations (max 50 points)
  score += Math.min(associationCount * 10, 50);

  // Intelligence notes (20 points if active surveillance)
  if (notesCount >= 5) score += 20;

  // Leadership roles (15 points)
  if (hasLeadershipRole) score += 15;

  // High risk (15 points)
  if (hasHighRisk) score += 15;

  return Math.min(score, 100);
}

/**
 * Calculate influence score for an association (0-100)
 * Based on:
 * - Number of members (10 points each, max 60)
 * - Risk level (40 points for critical, 30 for high, 20 for medium)
 * - Monitoring status (10 points for active)
 */
function calculateAssociationInfluence(
  memberCount: number,
  riskLevel: string,
  monitoringStatus: string
): number {
  let score = 0;

  // Members (max 60 points)
  score += Math.min(memberCount * 10, 60);

  // Risk level
  if (riskLevel === 'critique') score += 40;
  else if (riskLevel === 'eleve') score += 30;
  else if (riskLevel === 'moyen') score += 20;
  else score += 10;

  // Active monitoring (10 points)
  if (monitoringStatus === 'actif') score += 10;

  return Math.min(score, 100);
}

/**
 * Determine risk level from intelligence notes
 */
function determineRiskLevel(notesCount: number, hasHighPriorityNotes: boolean): 'low' | 'medium' | 'high' {
  if (hasHighPriorityNotes || notesCount >= 10) return 'high';
  if (notesCount >= 5) return 'medium';
  return 'low';
}

/**
 * Get network data with nodes (profiles + associations) and clusters
 */
export const getNetworkData = query({
  args: {
    search: v.optional(v.string()),
    influenceLevel: v.optional(v.union(v.literal('all'), v.literal('high'), v.literal('medium'), v.literal('low'))),
  },
  handler: async (ctx, args) => {
    const { search, influenceLevel = 'all' } = args;

    // Fetch all profiles
    const profiles = await ctx.db.query('profiles').collect();

    // Fetch all associations
    const associations = await ctx.db.query('associations').collect();

    // Fetch all association members
    const allMembers = await ctx.db.query('associationMembers').collect();

    // Fetch all intelligence notes
    const allNotes = await ctx.db.query('intelligenceNotes').collect();

    // Build profile nodes
    const profileNodes = await Promise.all(
      profiles.map(async (profile) => {
        // Count associations for this profile
        const profileAssociations = allMembers.filter(
          (m) => m.profileId === profile._id && m.isActive
        );
        const associationCount = profileAssociations.length;

        // Check for leadership roles
        const hasLeadershipRole = profileAssociations.some(
          (m) => m.role && ['président', 'vice-président', 'secrétaire', 'trésorier'].some(
            (r) => m.role?.toLowerCase().includes(r)
          )
        );

        // Count intelligence notes
        const profileNotes = allNotes.filter((n) => n.profileId === profile._id);
        const notesCount = profileNotes.length;
        const hasHighPriorityNotes = profileNotes.some((n) => n.priority === 'high' || n.priority === 'critical');

        // Calculate influence
        const influence = calculateProfileInfluence(
          associationCount,
          notesCount,
          hasLeadershipRole,
          hasHighPriorityNotes
        );

        // Determine risk level
        const riskLevel = determineRiskLevel(notesCount, hasHighPriorityNotes);

        // Count connections (other profiles in same associations)
        const sharedAssociationIds = profileAssociations.map((m) => m.associationId);
        const connectionsSet = new Set<Id<'profiles'>>();

        for (const assocId of sharedAssociationIds) {
          const otherMembers = allMembers.filter(
            (m) => m.associationId === assocId && m.profileId !== profile._id && m.isActive
          );
          otherMembers.forEach((m) => connectionsSet.add(m.profileId));
        }

        const name = `${profile.personal.lastName} ${profile.personal.firstName}`;
        const location = profile.contacts.address?.city || 'Non spécifié';

        return {
          id: profile._id,
          name,
          type: 'profile' as const,
          influence,
          connections: connectionsSet.size,
          riskLevel,
          location,
        };
      })
    );

    // Build association nodes
    const associationNodes = associations.map((association) => {
      // Count members
      const members = allMembers.filter(
        (m) => m.associationId === association._id && m.isActive
      );
      const memberCount = members.length;

      // Calculate influence
      const influence = calculateAssociationInfluence(
        memberCount,
        association.riskLevel,
        association.monitoringStatus
      );

      // Map risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (association.riskLevel === 'critique' || association.riskLevel === 'eleve') {
        riskLevel = 'high';
      } else if (association.riskLevel === 'moyen') {
        riskLevel = 'medium';
      }

      return {
        id: association._id,
        name: association.name,
        type: 'association' as const,
        influence,
        connections: memberCount,
        riskLevel,
        location: association.city || association.zone,
      };
    });

    // Combine all nodes
    let allNodes = [...profileNodes, ...associationNodes];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allNodes = allNodes.filter((node) => node.name.toLowerCase().includes(searchLower));
    }

    // Apply influence filter
    if (influenceLevel !== 'all') {
      allNodes = allNodes.filter((node) => {
        if (influenceLevel === 'high') return node.influence >= 80;
        if (influenceLevel === 'medium') return node.influence >= 50 && node.influence < 80;
        if (influenceLevel === 'low') return node.influence < 50;
        return true;
      });
    }

    // Detect clusters (profiles sharing 2+ associations)
    const clusters: Array<{
      id: string;
      name: string;
      nodes: number;
      influence: 'low' | 'medium' | 'high';
      connections: number;
      profileIds: Id<'profiles'>[];
    }> = [];

    // Group profiles by shared associations
    const profilesByAssociation = new Map<Id<'associations'>, Id<'profiles'>[]>();
    for (const member of allMembers.filter((m) => m.isActive)) {
      if (!profilesByAssociation.has(member.associationId)) {
        profilesByAssociation.set(member.associationId, []);
      }
      profilesByAssociation.get(member.associationId)!.push(member.profileId);
    }

    // Find clusters (groups of profiles with multiple shared associations)
    const processedProfiles = new Set<string>();
    let clusterIndex = 0;

    for (const profile of profiles) {
      if (processedProfiles.has(profile._id)) continue;

      // Find all associations for this profile
      const profileAssocIds = allMembers
        .filter((m) => m.profileId === profile._id && m.isActive)
        .map((m) => m.associationId);

      if (profileAssocIds.length < 2) continue;

      // Find other profiles sharing at least 2 associations
      const clusterProfiles = new Set<Id<'profiles'>>([profile._id]);

      for (const otherProfile of profiles) {
        if (otherProfile._id === profile._id || processedProfiles.has(otherProfile._id)) continue;

        const otherAssocIds = allMembers
          .filter((m) => m.profileId === otherProfile._id && m.isActive)
          .map((m) => m.associationId);

        const sharedCount = profileAssocIds.filter((id) => otherAssocIds.includes(id)).length;

        if (sharedCount >= 2) {
          clusterProfiles.add(otherProfile._id);
        }
      }

      if (clusterProfiles.size >= 3) {
        // Calculate cluster influence
        const clusterInfluenceScores = Array.from(clusterProfiles).map((id) => {
          const node = profileNodes.find((n) => n.id === id);
          return node?.influence || 0;
        });
        const avgInfluence = clusterInfluenceScores.reduce((sum, i) => sum + i, 0) / clusterInfluenceScores.length;

        let clusterInfluenceLevel: 'low' | 'medium' | 'high' = 'low';
        if (avgInfluence >= 80) clusterInfluenceLevel = 'high';
        else if (avgInfluence >= 50) clusterInfluenceLevel = 'medium';

        // Determine cluster name (based on most common location)
        const clusterProfilesArray = Array.from(clusterProfiles);
        const locations = clusterProfilesArray
          .map((id) => profileNodes.find((n) => n.id === id)?.location)
          .filter(Boolean) as string[];
        const locationCounts = locations.reduce((acc, loc) => {
          acc[loc] = (acc[loc] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const dominantLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Réseau';

        // Count total connections within cluster
        let totalConnections = 0;
        for (const profId of clusterProfilesArray) {
          const node = profileNodes.find((n) => n.id === profId);
          if (node) totalConnections += node.connections;
        }

        clusters.push({
          id: `cluster-${String(clusterIndex + 1).padStart(3, '0')}`,
          name: `Réseau ${dominantLocation}`,
          nodes: clusterProfiles.size,
          influence: clusterInfluenceLevel,
          connections: Math.floor(totalConnections / clusterProfiles.size),
          profileIds: Array.from(clusterProfiles),
        });

        // Mark profiles as processed
        clusterProfiles.forEach((id) => processedProfiles.add(id));
        clusterIndex++;
      }
    }

    // Calculate stats
    const totalConnections = allNodes.reduce((sum, n) => sum + n.connections, 0);
    const averageInfluence = allNodes.length > 0
      ? allNodes.reduce((sum, n) => sum + n.influence, 0) / allNodes.length
      : 0;

    return {
      nodes: allNodes,
      clusters: clusters.map(({ profileIds, ...rest }) => rest), // Remove internal profileIds from response
      stats: {
        totalNodes: allNodes.length,
        totalConnections,
        averageInfluence: Math.round(averageInfluence),
        totalClusters: clusters.length,
      },
    };
  },
});

/**
 * Get detailed cluster information
 * TODO: Implement detailed cluster analysis with direct data queries
 */
export const getClusterDetails = query({
  args: {
    clusterId: v.string(),
  },
  handler: async (ctx, args) => {
    // Placeholder implementation
    // In a real implementation, this would query specific cluster data directly
    // rather than calling getNetworkData (queries can't call other queries)

    return {
      id: args.clusterId,
      name: 'Cluster details',
      nodes: 0,
      influence: 'low' as const,
      connections: 0,
      // Future: Add detailed analysis by querying data directly
    };
  },
});

import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import {
  addMemberToOrganization,
  removeMemberFromOrganization,
} from '../helpers/relationships';
import {
  countryCodeValidator,
  membershipStatusValidator,
  userPermissionValidator,
  userRoleValidator,
} from '../lib/validators';
import { MembershipStatus, RequestStatus, UserRole } from '../lib/constants';

// Mutations
export const addMember = mutation({
  args: {
    userId: v.id('users'),
    organizationId: v.id('organizations'),
    role: v.string(),
    permissions: v.optional(v.array(v.string())),
  },
  returns: v.id('memberships'),
  handler: async (ctx, args) => {
    const membershipId = await addMemberToOrganization(
      ctx,
      args.userId,
      args.organizationId,
      args.role,
      args.permissions || [],
    );

    const organization = await ctx.db.get(args.organizationId);
    if (organization) {
      await ctx.db.patch(args.organizationId, {
        memberIds: [...organization.memberIds, args.userId],
      });
    }

    return membershipId;
  },
});

export const removeMember = mutation({
  args: {
    userId: v.id('users'),
    organizationId: v.id('organizations'),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await removeMemberFromOrganization(ctx, args.userId, args.organizationId);

    const organization = await ctx.db.get(args.organizationId);
    if (organization) {
      await ctx.db.patch(args.organizationId, {
        memberIds: organization.memberIds.filter((id) => id !== args.userId),
      });
    }

    return { success: true };
  },
});

export const updateMembership = mutation({
  args: {
    membershipId: v.id('memberships'),
    role: v.optional(userRoleValidator),
    permissions: v.optional(v.array(userPermissionValidator)),
    status: v.optional(membershipStatusValidator),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  returns: v.id('memberships'),
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error('Membership not found');
    }

    const updateData = {
      ...(args.role && { role: args.role }),
      ...(args.permissions && { permissions: args.permissions }),
      ...(args.status && { status: args.status }),
      ...(args.firstName && { firstName: args.firstName }),
      ...(args.lastName && { lastName: args.lastName }),
    };

    await ctx.db.patch(args.membershipId, updateData);
    return args.membershipId;
  },
});

// Queries
export const getMembership = query({
  args: { membershipId: v.id('memberships') },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.membershipId);
  },
});

export const getMembershipsByUser = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('memberships')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), MembershipStatus.Active))
      .collect();
  },
});

export const getMembershipsByOrganization = query({
  args: { organizationId: v.id('organizations') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('memberships')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .filter((q) => q.eq(q.field('status'), MembershipStatus.Active))
      .collect();
  },
});

export const getUserOrganizations = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('memberships')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), MembershipStatus.Active))
      .collect();

    const organizations = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.organizationId)),
    );

    return organizations.filter(Boolean).map((org, index) => ({
      ...org,
      membership: memberships[index],
    }));
  },
});

export const getOrganizationMembers = query({
  args: { organizationId: v.id('organizations') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('memberships')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .filter((q) => q.eq(q.field('status'), MembershipStatus.Active))
      .collect();

    const users = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.userId)),
    );

    return users.filter(Boolean).map((user, index) => ({
      ...user,
      membership: memberships[index],
    }));
  },
});

// Agent list query with comprehensive filtering and enrichment
export const getAgentsList = query({
  args: {
    organizationId: v.optional(v.id('organizations')),
    search: v.optional(v.string()),
    linkedCountries: v.optional(v.array(countryCodeValidator)),
    assignedServices: v.optional(v.array(v.id('services'))),
    managerId: v.optional(v.id('memberships')),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    status: v.optional(membershipStatusValidator),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    let query = ctx.db.query('memberships');

    if (args.status) {
      query = query.filter((q) => q.eq(q.field('status'), args.status));
    }

    // Filter by organization
    if (args.organizationId) {
      query = query.filter((q) => q.eq(q.field('organizationId'), args.organizationId));
    }

    // Filter by manager
    if (args.managerId) {
      query = query.filter((q) => q.eq(q.field('_id'), args.managerId));
    }

    const allMemberships = await query.collect();

    // Apply all client-side filters
    let filteredMemberships = allMemberships;

    // Filter by linked countries
    if (args.linkedCountries && args.linkedCountries.length > 0) {
      filteredMemberships = filteredMemberships.filter((membership) =>
        args.linkedCountries!.some((country) =>
          membership.assignedCountries.includes(country),
        ),
      );
    }

    // Filter by assigned services
    if (args.assignedServices && args.assignedServices.length > 0) {
      filteredMemberships = filteredMemberships.filter((membership) =>
        membership.assignedServices?.some((service) =>
          args.assignedServices!.some((serviceId) => serviceId === service),
        ),
      );
    }

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      const userIds = filteredMemberships.map((m) => m.userId);
      const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

      filteredMemberships = filteredMemberships.filter((membership, index) => {
        const user = users[index];
        if (!user) return false;

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();

        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    const total = filteredMemberships.length;

    // Apply pagination
    const paginatedMemberships = filteredMemberships.slice(skip, skip + limit);

    // Enrich with user data and counts
    const enrichedAgents = await Promise.all(
      paginatedMemberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        const organization = await ctx.db.get(membership.organizationId);

        // Get manager info if exists
        let manager = null;
        if (membership.managerId) {
          manager = await ctx.db.get(membership.managerId);
        }

        // Fetch linked countries details
        const countriesList = await Promise.all(
          membership.assignedCountries.map(async (countryCode) => {
            const country = await ctx.db
              .query('countries')
              .withIndex('by_code', (q) => q.eq('code', countryCode))
              .first();
            return country || { code: countryCode, name: countryCode };
          }),
        );

        // Fetch assigned services details
        const servicesList = await Promise.all(
          membership.assignedServices.map((serviceId) => ctx.db.get(serviceId)),
        );

        // Count active requests (using InProduction and other non-final statuses)
        const activeRequests = await ctx.db
          .query('requests')
          .withIndex('by_assignee_status', (q) => q.eq('assignedAgentId', membership._id))
          .filter((q) => q.neq(q.field('status'), RequestStatus.Completed))
          .filter((q) => q.neq(q.field('status'), RequestStatus.Cancelled))
          .filter((q) => q.neq(q.field('status'), RequestStatus.Rejected))
          .collect();

        // Count completed requests
        const completedRequests = await ctx.db
          .query('requests')
          .withIndex('by_assignee_status', (q) => q.eq('assignedAgentId', membership._id))
          .filter((q) => q.eq(q.field('status'), RequestStatus.Completed))
          .collect();

        return {
          _id: membership._id,
          userId: user?._id,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          phoneNumber: user?.phoneNumber || '',
          email: user?.email || '',
          roles: user?.roles || [],
          linkedCountries: countriesList.filter(Boolean),
          assignedServices: servicesList.filter(Boolean),
          assignedOrganizationId: membership.organizationId,
          organizationName: organization?.name,
          managedByUserId: membership.managerId,
          managerName: manager
            ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim()
            : undefined,
          assignedRequests: activeRequests.length,
          completedRequests: completedRequests.length,
          createdAt: membership.joinedAt,
        };
      }),
    );

    return {
      agents: enrichedAgents,
      total,
      page,
      limit,
    };
  },
});

// Get all countries for filter dropdowns
export const getCountriesForFilter = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query('countries').collect();
  },
});

// Get all services for filter dropdowns
export const getServicesForFilter = query({
  args: { organizationId: v.optional(v.id('organizations')) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let query = ctx.db.query('services');

    if (args.organizationId) {
      query = query.filter((q) => q.eq(q.field('organizationId'), args.organizationId));
    }

    return await query.collect();
  },
});

// Get all managers in an organization
export const getManagersForFilter = query({
  args: { organizationId: v.optional(v.id('organizations')) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('memberships')
      .filter((q) => q.eq(q.field('status'), MembershipStatus.Active));

    if (args.organizationId) {
      query = query.filter((q) => q.eq(q.field('organizationId'), args.organizationId));
    }

    query = query.filter((q) => q.eq(q.field('role'), UserRole.Manager));

    const membershipList = await query.collect();

    const managers = await Promise.all(
      membershipList.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          _id: user?._id,
          id: user?._id,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email || '',
        };
      }),
    );

    return managers.filter(Boolean);
  },
});

export const getMembershipWithOrganizationByUserId = query({
  args: { userId: v.id('users') },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('memberships')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!membership) {
      return null;
    }

    const organization = await ctx.db.get(membership.organizationId);

    return {
      ...membership,
      organization,
    };
  },
});

export const getOrganizationAgents = query({
  args: {
    organizationId: v.id('organizations'),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('memberships')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .filter((q) => q.eq(q.field('status'), MembershipStatus.Active))
      .collect();

    console.log({ memberships });

    return memberships.map((membership) => ({
      _id: membership._id,
      firstName: membership.firstName,
      lastName: membership.lastName,
      role: membership.role,
    }));
  },
});

// Get detailed agent information with all related data
export const getAgentDetails = query({
  args: {
    agentId: v.id('memberships'),
  },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.agentId);

    if (!membership) {
      return null;
    }

    // Get user details
    const user = await ctx.db.get(membership.userId);
    if (!user) {
      return null;
    }

    // Get organization
    const organization = await ctx.db.get(membership.organizationId);

    // Get linked countries details
    const linkedCountries = await Promise.all(
      membership.assignedCountries.map(async (countryCode) => {
        const country = await ctx.db
          .query('countries')
          .withIndex('by_code', (q) => q.eq('code', countryCode))
          .first();
        return country || { code: countryCode, name: countryCode };
      }),
    );

    // Get assigned services details
    const assignedServices = await Promise.all(
      membership.assignedServices.map(async (serviceId) => {
        const service = await ctx.db.get(serviceId);
        return service;
      }),
    );

    // Get manager details if exists
    let manager = null;
    if (membership.managerId) {
      const managerMembership = await ctx.db.get(membership.managerId);
      if (managerMembership) {
        manager = {
          id: managerMembership._id,
          name: `${managerMembership.firstName || ''} ${managerMembership.lastName || ''}`.trim(),
        };
      }
    }

    // Get managed agents if this is a manager
    const managedAgents: Array<{
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      assignedRequests: any[];
      completedRequests: number;
      averageProcessingTime: number;
    }> = [];
    if (membership.role === UserRole.Manager) {
      const managedMemberships = await ctx.db
        .query('memberships')
        .withIndex('by_manager', (q) => q.eq('managerId', membership.managerId))
        .filter((q) => q.eq(q.field('status'), MembershipStatus.Active))
        .collect();

      const enrichedManagedAgents = await Promise.all(
        managedMemberships.map(async (managedMembership) => {
          const managedUser = await ctx.db.get(managedMembership.userId);

          // Count requests for this managed agent
          const activeRequests = await ctx.db
            .query('requests')
            .withIndex('by_assignee_status', (q) =>
              q.eq('assignedAgentId', managedMembership._id),
            )
            .filter((q) => q.neq(q.field('status'), RequestStatus.Completed))
            .filter((q) => q.neq(q.field('status'), RequestStatus.Cancelled))
            .filter((q) => q.neq(q.field('status'), RequestStatus.Rejected))
            .collect();

          const completedRequests = await ctx.db
            .query('requests')
            .withIndex('by_assignee_status', (q) =>
              q.eq('assignedAgentId', managedMembership._id),
            )
            .filter((q) => q.eq(q.field('status'), RequestStatus.Completed))
            .collect();

          // Calculate average processing time for managed agent
          let averageProcessingTime = 0;
          if (completedRequests.length > 0) {
            const processingTimes = completedRequests
              .filter((r) => r.submittedAt && r.completedAt)
              .map((r) => {
                const days = Math.floor(
                  (r.completedAt! - r.submittedAt!) / (1000 * 60 * 60 * 24),
                );
                return days;
              });

            if (processingTimes.length > 0) {
              averageProcessingTime = Math.round(
                processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length,
              );
            }
          }

          return {
            id: managedMembership._id,
            name:
              `${managedMembership.firstName || ''} ${managedMembership.lastName || ''}`.trim() ||
              `${managedUser?.firstName || ''} ${managedUser?.lastName || ''}`.trim(),
            email: managedUser?.email || '',
            phoneNumber: managedUser?.phoneNumber || '',
            assignedRequests: activeRequests,
            completedRequests: completedRequests.length,
            averageProcessingTime,
          };
        }),
      );

      managedAgents.push(...enrichedManagedAgents);
    }

    // Get assigned requests details
    const assignedRequests = await ctx.db
      .query('requests')
      .withIndex('by_assignee', (q) => q.eq('assignedAgentId', args.agentId))
      .collect();

    // Enrich requests with service details
    const enrichedRequests = await Promise.all(
      assignedRequests.map(async (request) => {
        const service = await ctx.db.get(request.serviceId);
        return {
          id: request._id,
          serviceCategory: service?.category,
          status: request.status,
          priority: request.priority,
          createdAt: request.submittedAt || request._creationTime,
          assignedAt: request.assignedAt,
        };
      }),
    );

    // Calculate average processing time
    const completedRequests = assignedRequests.filter(
      (r) => r.status === RequestStatus.Completed && r.submittedAt && r.completedAt,
    );

    let averageProcessingTime = 0;
    if (completedRequests.length > 0) {
      const processingTimes = completedRequests.map((r) => {
        const days = Math.floor(
          (r.completedAt! - r.submittedAt!) / (1000 * 60 * 60 * 24),
        );
        return days;
      });

      averageProcessingTime = Math.round(
        processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length,
      );
    }

    return {
      id: membership._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      roles: [membership.role],
      linkedCountries: linkedCountries.filter(Boolean),
      assignedServices: assignedServices.filter(Boolean),
      assignedOrganizationId: membership.organizationId,
      organizationName: organization?.name,
      managedByUserId: membership.managerId,
      manager,
      managedAgents,
      assignedRequests: enrichedRequests,
      averageProcessingTime,
      availability: null, // Not implemented in schema yet
    };
  },
});

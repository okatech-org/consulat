import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import {
  addMemberToOrganization,
  removeMemberFromOrganization,
} from '../helpers/relationships';
import {
  membershipStatusValidator,
  userPermissionValidator,
  userRoleValidator,
} from '../lib/validators';
import { MembershipStatus } from '../lib/constants';

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
      updatedAt: Date.now(),
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

import { v } from 'convex/values';
import { mutation, query, action } from '../_generated/server';
import { api } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import { validateUser } from '../helpers/validation';
import { UserRole, UserStatus, OrganizationStatus, OwnerType } from '../lib/constants';
import { countryCodeFromPhoneNumber } from '../lib/utils';
import { getUserProfileHelper } from '../helpers/relationships';
import { createClerkClient } from '@clerk/backend';
import { internalMutation } from '../_generated/server';
import {
  countryCodeValidator,
  userRoleValidator,
  userStatusValidator,
} from '../lib/validators';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Mutations
export const createUser = mutation({
  args: {
    userId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    roles: v.optional(v.array(userRoleValidator)),
  },
  handler: async (ctx, args) => {
    const userData = {
      name: `${args.firstName || ''} ${args.lastName || ''}`.trim(),
      email: args.email,
      phoneNumber: args.phoneNumber,
    };

    const validationErrors = validateUser(userData);
    if (validationErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      );
    }

    const userId = await ctx.db.insert('users', {
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      roles: args.roles || [UserRole.User],
      status: UserStatus.Active,
    });

    return userId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    roles: v.optional(v.array(userRoleValidator)),
    status: v.optional(userStatusValidator),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db.get(args.userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updateData = {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      roles: args.roles,
      status: args.status,
      countryCode: args.countryCode,
      updatedAt: Date.now(),
    };

    if (args.email || args.phoneNumber) {
      const userData = {
        name: `${args.firstName || existingUser.firstName || ''} ${args.lastName || existingUser.lastName || ''}`.trim(),
        email: args.email || existingUser.email,
        phoneNumber: args.phoneNumber || existingUser.phoneNumber,
      };

      const validationErrors = validateUser(userData);
      if (validationErrors.length > 0) {
        throw new Error(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
        );
      }
    }

    await ctx.db.patch(args.userId, updateData);
    return args.userId;
  },
});

export const updateUserLastActive = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActiveAt: Date.now(),
    });
    return args.userId;
  },
});

export const softDeleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: UserStatus.Inactive,
      deletedAt: Date.now(),
    });
    return args.userId;
  },
});

export const deleteUser = mutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkUserId } = args;

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', clerkUserId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        status: UserStatus.Suspended,
        deletedAt: Date.now(),
      });
      return true;
    }

    return false;
  },
});

export const updateOrCreateUser = mutation({
  args: {
    clerkUser: v.any(),
  },
  handler: async (ctx, args) => {
    const { clerkUser } = args;

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', clerkUser.id))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        firstName: clerkUser.first_name || existingUser.firstName,
        lastName: clerkUser.last_name || existingUser.lastName,
        email: clerkUser.email_addresses?.[0]?.email_address || existingUser.email,
        phoneNumber:
          clerkUser.phone_numbers?.[0]?.phone_number || existingUser.phoneNumber,
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    } else {
      const newUserId = await ctx.db.insert('users', {
        userId: clerkUser.id,
        legacyId: undefined,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        email: clerkUser.email_addresses?.[0]?.email_address,
        phoneNumber: clerkUser.phone_numbers?.[0]?.phone_number,
        roles: [UserRole.User],
        status: UserStatus.Active,
        profileId: undefined,
        lastActiveAt: Date.now(),
      });
      return newUserId;
    }
  },
});

// Actions
export const handleNewUser = action({
  args: {
    clerkId: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    userId: Id<'users'>;
    profileId: Id<'profiles'> | undefined;
    message: string;
  }> => {
    try {
      const existingUser = await ctx.runQuery(api.functions.user.getUserByClerkId, {
        clerkUserId: args.clerkId,
      });

      if (existingUser) {
        return {
          userId: existingUser._id as Id<'users'>,
          profileId: existingUser.profileId as Id<'profiles'> | undefined,
          message: 'User already exists',
        };
      }

      const clerkUser = await clerkClient.users.getUser(args.clerkId);

      if (!clerkUser) {
        throw new Error('Failed to fetch user from Clerk');
      }

      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber;

      if (!email && !phoneNumber) {
        throw new Error('User must have at least an email or phone number');
      }

      const extratedCountryCode = countryCodeFromPhoneNumber(phoneNumber || '');

      if (!extratedCountryCode) {
        throw new Error('Could not determine country code from phone number');
      }

      const userId: Id<'users'> = await ctx.runMutation(api.functions.user.createUser, {
        userId: args.clerkId,
        email: email,
        phoneNumber: phoneNumber,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        roles: [UserRole.User],
      });

      const profileId: Id<'profiles'> = await ctx.runMutation(
        api.functions.profile.createProfile,
        {
          userId: userId,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          email: email || '',
          phone: phoneNumber || '',
          residenceCountry: extratedCountryCode,
        },
      );

      try {
        await clerkClient.users.updateUserMetadata(args.clerkId, {
          publicMetadata: {
            profileId: profileId,
            roles: [UserRole.User],
            countryCode: extratedCountryCode,
            userId: userId,
          },
        });
      } catch (error) {
        console.error('Failed to update Clerk metadata:', error);
      }

      return {
        userId: userId,
        profileId: profileId,
        message: 'User created successfully',
      };
    } catch (error) {
      console.error('Error in handleNewUser:', error);
      throw error;
    }
  },
});

// Queries
export const getUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkUserId: v.string(), withMembership: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.clerkUserId))
      .first();

    if (!user) {
      return null;
    }

    return {
      ...user,
      membership: args.withMembership
        ? await ctx.db
            .query('memberships')
            .withIndex('by_user', (q) => q.eq('userId', user._id))
            .first()
        : null,
    };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});

export const getAllUsers = query({
  args: {
    status: v.optional(userStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users: Array<Doc<'users'>> = [];

    if (args.status) {
      users = await ctx.db
        .query('users')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      users = await ctx.db.query('users').order('desc').collect();
    }

    return args.limit ? users.slice(0, args.limit) : users;
  },
});

// Enriched users list query with filtering and pagination
export const getUsersListEnriched = query({
  args: {
    search: v.optional(v.string()),
    roles: v.optional(v.array(userRoleValidator)),
    status: v.optional(userStatusValidator),
    countryCode: v.optional(v.array(countryCodeValidator)),
    organizationId: v.optional(v.array(v.id('organizations'))),
    hasProfile: v.optional(v.boolean()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    let users = await ctx.db.query('users').collect();

    // Filter by status
    if (args.status) {
      users = users.filter((user) => user.status === args.status);
    }

    // Filter by roles
    if (args.roles && args.roles.length > 0) {
      users = users.filter((user) =>
        args.roles!.some((role) => user.roles.includes(role)),
      );
    }

    // Filter by hasProfile
    if (args.hasProfile !== undefined) {
      users = users.filter((user) =>
        args.hasProfile ? !!user.profileId : !user.profileId,
      );
    }

    // Filter by search (name or email)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter((user) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Filter by organization (via memberships)
    if (args.organizationId && args.organizationId.length > 0) {
      const userIdsInOrgs = new Set<Id<'users'>>();

      for (const orgId of args.organizationId) {
        const memberships = await ctx.db
          .query('memberships')
          .withIndex('by_organization', (q) => q.eq('organizationId', orgId))
          .collect();

        memberships.forEach((m) => userIdsInOrgs.add(m.userId));
      }

      users = users.filter((user) => userIdsInOrgs.has(user._id));
    }

    // Filter by country (via memberships)
    if (args.countryCode && args.countryCode.length > 0) {
      const userIdsWithCountries = new Set<Id<'users'>>();

      const allMemberships = await ctx.db.query('memberships').collect();

      for (const membership of allMemberships) {
        if (
          args.countryCode.some((code) => membership.assignedCountries.includes(code))
        ) {
          userIdsWithCountries.add(membership.userId);
        }
      }

      users = users.filter((user) => userIdsWithCountries.has(user._id));
    }

    const total = users.length;

    // Apply pagination
    const paginatedUsers = users.slice(skip, skip + limit);

    // Enrich with additional data
    const enrichedUsers = await Promise.all(
      paginatedUsers.map(async (user) => {
        // Get profile if exists
        const profile = user.profileId ? await ctx.db.get(user.profileId) : null;

        // Get memberships
        const memberships = await ctx.db
          .query('memberships')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .collect();

        // Get organizations
        const organizations = await Promise.all(
          memberships.map((m) => ctx.db.get(m.organizationId)),
        );

        // Get assigned countries from memberships
        const assignedCountries = Array.from(
          new Set(memberships.flatMap((m) => m.assignedCountries)),
        );

        return {
          ...user,
          name:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Nom non défini',
          hasProfile: !!user.profileId,
          profile,
          organizations: organizations.filter(Boolean),
          assignedCountries,
          membershipCount: memberships.length,
        };
      }),
    );

    return {
      users: enrichedUsers,
      total,
      page,
      limit,
    };
  },
});

export const getUserProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await getUserProfileHelper(ctx, args.userId);
  },
});

export const updateOrCreateUserInternal = internalMutation({
  args: {
    clerkUser: v.object({
      id: v.string(),
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      email_addresses: v.optional(
        v.array(
          v.object({
            email_address: v.string(),
          }),
        ),
      ),
      phone_numbers: v.optional(
        v.array(
          v.object({
            phone_number: v.string(),
          }),
        ),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const { clerkUser } = args;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', clerkUser.id))
      .first();

    const email = clerkUser.email_addresses?.[0]?.email_address;
    const phoneNumber = clerkUser.phone_numbers?.[0]?.phone_number;

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      await ctx.db.patch(existingUser._id, {
        firstName: clerkUser.first_name || existingUser.firstName,
        lastName: clerkUser.last_name || existingUser.lastName,
        email: email || existingUser.email,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Créer un nouvel utilisateur
      const newUserId = await ctx.db.insert('users', {
        userId: clerkUser.id,
        legacyId: undefined,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        email: email,
        phoneNumber: phoneNumber,
        roles: [UserRole.User],
        status: UserStatus.Active,
        profileId: undefined,
        lastActiveAt: Date.now(),
      });
      return newUserId;
    }
  },
});

export const deleteUserInternal = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkUserId } = args;

    // Trouver l'utilisateur par userId
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', clerkUserId))
      .first();

    if (user) {
      // Marquer l'utilisateur comme supprimé (soft delete)
      await ctx.db.patch(user._id, {
        status: UserStatus.Suspended,
        deletedAt: Date.now(),
      });
      return true;
    }

    return false;
  },
});

export const getUserAppointments = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Récupérer tous les rendez-vous où l'utilisateur est participant
    const allAppointments = await ctx.db.query('appointments').order('desc').collect();

    let userAppointments = allAppointments.filter((appointment) =>
      appointment.participants.some((participant) => participant.userId === args.userId),
    );

    if (args.status) {
      userAppointments = userAppointments.filter((apt) => apt.status === args.status);
    }

    if (args.limit) {
      userAppointments = userAppointments.slice(0, args.limit);
    }

    // Enrichir avec les détails du service et de l'organisation
    const enrichedAppointments = await Promise.all(
      userAppointments.map(async (apt) => {
        const service = apt.serviceId ? await ctx.db.get(apt.serviceId) : null;
        const organization = await ctx.db.get(apt.organizationId);

        return {
          ...apt,
          service,
          organization,
        };
      }),
    );

    return enrichedAppointments;
  },
});

export const getUserDocuments = query({
  args: {
    userId: v.id('users'),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Récupérer le profil de l'utilisateur
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!profile) return [];

    // Récupérer les documents du profil
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
      )
      .collect();

    let filteredDocuments = documents;

    if (args.type) {
      filteredDocuments = filteredDocuments.filter((doc) => doc.type === args.type);
    }

    if (args.status) {
      filteredDocuments = filteredDocuments.filter((doc) => doc.status === args.status);
    }

    // Enrichir avec les URLs des fichiers
    const documentsWithUrls = await Promise.all(
      filteredDocuments.map(async (doc) => ({
        ...doc,
        fileUrl: doc.storageId ? await ctx.storage.getUrl(doc.storageId as any) : null,
      })),
    );

    return documentsWithUrls;
  },
});

export const getUserNotifications = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications;

    if (args.status) {
      notifications = await ctx.db
        .query('notifications')
        .filter((q) => q.eq(q.field('userId'), args.userId))
        .order('desc')
        .collect();
    } else {
      notifications = await ctx.db
        .query('notifications')
        .filter((q) => q.eq(q.field('userId'), args.userId))
        .order('desc')
        .collect();
    }

    return args.limit ? notifications.slice(0, args.limit) : notifications;
  },
});

export const getUserOrganizationContact = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    // Récupérer les organisations du pays de l'utilisateur
    const organizations = await ctx.db.query('organizations').collect();
    const userOrganizations = organizations.filter((org) =>
      org.countryCodes.includes(profile.residenceCountry!),
    );

    if (userOrganizations.length === 0) return null;

    // Prendre la première organisation active
    const primaryOrg =
      userOrganizations.find((org) => org.status === OrganizationStatus.Active) ||
      userOrganizations[0];

    // Récupérer la configuration du pays depuis les settings de l'organisation
    const orgSettings = primaryOrg.settings?.find(
      (s) => s.countryCode === profile.residenceCountry,
    );

    return {
      organization: primaryOrg,
      contact: orgSettings?.contact,
      schedule: orgSettings?.schedule,
      website: orgSettings?.contact?.website,
    };
  },
});

export const searchUsersByEmailOrPhone = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase().trim();

    if (searchTerm.length < 3) {
      return [];
    }

    // Search by email first
    const users = await ctx.db.query('users').collect();

    const filteredUsers = users.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      const phone = user.phoneNumber?.toLowerCase() || '';

      return email.includes(searchTerm) || phone.includes(searchTerm);
    });

    const limitedUsers = args.limit ? filteredUsers.slice(0, args.limit) : filteredUsers;

    // Get profiles for these users
    const usersWithProfiles = await Promise.all(
      limitedUsers.map(async (user) => {
        const profile = await ctx.db
          .query('profiles')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .first();

        return {
          ...user,
          profile,
        };
      }),
    );

    return usersWithProfiles;
  },
});

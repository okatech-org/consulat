import { v } from 'convex/values';
import { mutation, query, action } from '../_generated/server';
import { api } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import { validateUser } from '../helpers/validation';
import { UserRole, UserStatus, ProfileCategory } from '../lib/constants';
import { countryCodeFromPhoneNumber } from '../lib/utils';
import { getUserProfileHelper } from '../helpers/relationships';
import { createClerkClient } from '@clerk/backend';
import { internalMutation } from '../_generated/server';

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
    roles: v.optional(v.array(v.string())),
    countryCode: v.optional(v.string()),
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
      countryCode: args.countryCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
    roles: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
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
      updatedAt: Date.now(),
    });
    return args.userId;
  },
});

export const softDeleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: 'inactive',
      deletedAt: Date.now(),
      updatedAt: Date.now(),
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
        status: 'deleted',
        deletedAt: Date.now(),
        updatedAt: Date.now(),
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
        updatedAt: Date.now(),
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
        roles: ['user'],
        status: 'active',
        profileId: undefined,
        countryCode: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
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

      const country = countryCodeFromPhoneNumber(phoneNumber || '');

      if (!country) {
        throw new Error('Could not determine country code from phone number');
      }

      const userId: Id<'users'> = await ctx.runMutation(api.functions.user.createUser, {
        userId: args.clerkId,
        email: email,
        phoneNumber: phoneNumber,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        roles: [UserRole.User],
        countryCode: country.code,
      });

      const profileId: Id<'profiles'> = await ctx.runMutation(
        api.functions.profile.createProfile,
        {
          userId: userId,
          category: ProfileCategory.Adult,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          email: email || '',
          phoneNumber: phoneNumber || '',
          residenceCountry: country.code,
        },
      );

      try {
        await clerkClient.users.updateUserMetadata(args.clerkId, {
          publicMetadata: {
            profileId: profileId,
            roles: [UserRole.User],
            countryCode: country.code,
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
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.clerkUserId))
      .first();
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
    status: v.optional(v.string()),
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
    const countryCodeData = countryCodeFromPhoneNumber(phoneNumber || '');

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      await ctx.db.patch(existingUser._id, {
        firstName: clerkUser.first_name || existingUser.firstName,
        lastName: clerkUser.last_name || existingUser.lastName,
        email: email || existingUser.email,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        updatedAt: Date.now(),
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
        roles: ['user'],
        status: 'active',
        profileId: undefined,
        countryCode: countryCodeData?.code,
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
        status: 'deleted',
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return true;
    }

    return false;
  },
});

// Queries spécifiques pour les vues utilisateur
export const getUserDashboardData = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');

    // Récupérer le profil de l'utilisateur
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    // Récupérer les demandes récentes
    const requests = await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.userId))
      .order('desc')
      .take(5);

    // Récupérer les demandes en cours
    const currentRequest = await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.userId))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'pending'),
          q.eq(q.field('status'), 'submitted'),
          q.eq(q.field('status'), 'under_review'),
          q.eq(q.field('status'), 'in_production'),
          q.eq(q.field('status'), 'ready_for_pickup'),
        ),
      )
      .order('desc')
      .first();

    // Récupérer les notifications non lues
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) =>
        q.eq('userId', args.userId).eq('readAt', undefined),
      )
      .take(5);

    // Récupérer les rendez-vous à venir
    const upcomingAppointments = await ctx.db
      .query('appointments')
      .filter((q) => q.gt(q.field('startAt'), Date.now()))
      .filter((q) => q.eq(q.field('status'), 'confirmed'))
      .order('asc')
      .take(3);

    // Enrichir les rendez-vous avec les détails des participants
    const enrichedAppointments = await Promise.all(
      upcomingAppointments.map(async (apt) => {
        const service = apt.serviceId ? await ctx.db.get(apt.serviceId) : null;
        const organization = await ctx.db.get(apt.organizationId);

        return {
          ...apt,
          service,
          organization,
        };
      }),
    );

    // Récupérer les statistiques des demandes
    const allUserRequests = await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', args.userId))
      .collect();

    const requestStats = {
      total: allUserRequests.length,
      pending: allUserRequests.filter((r) =>
        ['pending', 'submitted', 'under_review'].includes(r.status),
      ).length,
      completed: allUserRequests.filter((r) => r.status === 'completed').length,
      rejected: allUserRequests.filter((r) => r.status === 'rejected').length,
    };

    return {
      user,
      profile,
      currentRequest,
      recentRequests: requests,
      unreadNotifications,
      upcomingAppointments: enrichedAppointments,
      requestStats,
      documentsCount: profile?.documentIds?.length || 0,
    };
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
        q.eq('ownerId', profile._id).eq('ownerType', 'profile'),
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
        .withIndex('by_user_status', (q) =>
          q.eq('userId', args.userId).eq('status', args.status!),
        )
        .order('desc')
        .collect();
    } else {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_status', (q) =>
          q.eq('userId', args.userId).eq('status', 'sent'),
        )
        .order('desc')
        .collect();
    }

    return args.limit ? notifications.slice(0, args.limit) : notifications;
  },
});

export const getUserOrganizationContact = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.countryCode) return null;

    // Récupérer les organisations du pays de l'utilisateur
    const organizations = await ctx.db.query('organizations').collect();
    const userOrganizations = organizations.filter((org) =>
      org.countryIds.includes(user.countryCode!),
    );

    if (userOrganizations.length === 0) return null;

    // Prendre la première organisation active
    const primaryOrg =
      userOrganizations.find((org) => org.status === 'active') || userOrganizations[0];

    // Récupérer la configuration du pays
    const countryConfig = await ctx.db
      .query('organizationCountryConfigs')
      .withIndex('by_organization_country', (q) =>
        q.eq('organizationId', primaryOrg._id).eq('countryCode', user.countryCode!),
      )
      .first();

    return {
      organization: primaryOrg,
      contact: countryConfig?.contact,
      schedule: countryConfig?.schedule,
      website: countryConfig?.contact?.website,
    };
  },
});

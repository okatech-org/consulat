import { v } from 'convex/values';
import { mutation, query, action } from '../_generated/server';
import { api } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import { validateUser } from '../helpers/validation';
import { UserRole, UserStatus, ProfileCategory, ProfileStatus } from '../lib/constants';
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
          status: ProfileStatus.Active,
          residenceCountry: country.code,
          personal: {
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            birthDate: undefined,
            birthPlace: undefined,
            birthCountry: undefined,
            gender: undefined,
            nationality: undefined,
            maritalStatus: undefined,
            workStatus: undefined,
            acquisitionMode: undefined,
            address: undefined,
          },
          family: {
            father: undefined,
            mother: undefined,
            spouse: undefined,
          },
          emergencyContacts: [],
          professionSituation: {
            profession: undefined,
            employer: undefined,
            employerAddress: undefined,
          },
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

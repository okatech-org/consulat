import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { ProfileStatus, ServiceCategory, RequestStatus } from '../lib/constants';
import type { ProfileStatus as ProfileStatusType } from '../lib/constants';
import type { Doc, Id } from '../_generated/dataModel';
import {
  genderValidator,
  nationalityAcquisitionValidator,
  parentalRoleValidator,
  profileStatusValidator,
} from '../lib/validators';

// Mutations
export const createChildProfile = mutation({
  args: {
    authorUserId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    parentRole: parentalRoleValidator,
    hasOtherParent: v.optional(v.boolean()),
    otherParentFirstName: v.optional(v.string()),
    otherParentLastName: v.optional(v.string()),
    otherParentEmail: v.optional(v.string()),
    otherParentPhone: v.optional(v.string()),
    otherParentRole: v.optional(parentalRoleValidator),
    residenceCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.authorUserId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get the user's profile to extract email and phone
    const userProfile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.authorUserId))
      .first();

    const parents: Array<{
      userId?: Id<'users'>;
      role: string;
      firstName: string;
      lastName: string;
      email?: string;
      phoneNumber?: string;
    }> = [
      {
        userId: args.authorUserId,
        role: args.parentRole,
        firstName: userProfile?.personal?.firstName || user.firstName || '',
        lastName: userProfile?.personal?.lastName || user.lastName || '',
        email: userProfile?.contacts?.email || user.email || undefined,
        phoneNumber: userProfile?.contacts?.phone || user.phoneNumber || undefined,
      },
    ];

    // Add other parent if provided
    if (
      args.hasOtherParent &&
      args.otherParentFirstName &&
      args.otherParentLastName &&
      args.otherParentRole
    ) {
      parents.push({
        role: args.otherParentRole,
        firstName: args.otherParentFirstName,
        lastName: args.otherParentLastName,
        email: args.otherParentEmail,
        phoneNumber: args.otherParentPhone,
      });
    }

    const childProfileId = await ctx.db.insert('childProfiles', {
      authorUserId: args.authorUserId,
      status: ProfileStatus.Draft,
      residenceCountry: args.residenceCountry,
      consularCard: {
        cardNumber: undefined,
        cardIssuedAt: undefined,
        cardExpiresAt: undefined,
      },
      personal: {
        firstName: args.firstName,
        lastName: args.lastName,
        birthDate: undefined,
        birthPlace: undefined,
        birthCountry: undefined,
        gender: undefined,
        nationality: undefined,
        acquisitionMode: undefined,
        passportInfos: undefined,
        nipCode: undefined,
      },
      parents,
      registrationRequest: undefined,
    });

    return childProfileId;
  },
});

export const updateChildProfile = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
    status: v.optional(profileStatusValidator),
    residenceCountry: v.optional(v.string()),
    registrationRequest: v.optional(v.id('requests')),

    consularCard: v.optional(
      v.object({
        cardNumber: v.optional(v.string()),
        cardIssuedAt: v.optional(v.number()),
        cardExpiresAt: v.optional(v.number()),
      }),
    ),

    personal: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        birthDate: v.optional(v.number()),
        birthPlace: v.optional(v.string()),
        birthCountry: v.optional(v.string()),
        gender: v.optional(genderValidator),
        nationality: v.optional(v.string()),
        acquisitionMode: v.optional(nationalityAcquisitionValidator),
        passportInfos: v.optional(
          v.object({
            number: v.optional(v.string()),
            issueDate: v.optional(v.number()),
            expiryDate: v.optional(v.number()),
            issueAuthority: v.optional(v.string()),
          }),
        ),
        nipCode: v.optional(v.string()),
      }),
    ),

    parents: v.optional(
      v.array(
        v.object({
          userId: v.optional(v.id('users')),
          role: parentalRoleValidator,
          firstName: v.string(),
          lastName: v.string(),
          email: v.optional(v.string()),
          phoneNumber: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.get(args.childProfileId);
    if (!existingProfile) {
      throw new Error('Child profile not found');
    }

    const updateData: {
      personal?: typeof existingProfile.personal;
      parents?: typeof existingProfile.parents;
      residenceCountry?: string;
      consularCard?: typeof existingProfile.consularCard;
      status?: ProfileStatusType;
      registrationRequest?: typeof existingProfile.registrationRequest;
    } = {};

    if (args.personal !== undefined) {
      updateData.personal = { ...existingProfile.personal, ...args.personal };
    }

    if (args.parents !== undefined) {
      updateData.parents = args.parents;
    }

    if (args.residenceCountry !== undefined) {
      updateData.residenceCountry = args.residenceCountry;
    }

    if (args.consularCard !== undefined) {
      updateData.consularCard = { ...existingProfile.consularCard, ...args.consularCard };
    }

    if (args.status !== undefined) {
      updateData.status = args.status as ProfileStatusType;
    }

    if (args.registrationRequest !== undefined) {
      updateData.registrationRequest = args.registrationRequest;
    }

    await ctx.db.patch(args.childProfileId, updateData);
    return args.childProfileId;
  },
});

export const updateChildPersonalInfo = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
    personal: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      birthPlace: v.optional(v.string()),
      birthCountry: v.optional(v.string()),
      gender: v.optional(genderValidator),
      nationality: v.optional(v.string()),
      acquisitionMode: v.optional(nationalityAcquisitionValidator),
      passportInfos: v.optional(
        v.object({
          number: v.optional(v.string()),
          issueDate: v.optional(v.number()),
          expiryDate: v.optional(v.number()),
          issueAuthority: v.optional(v.string()),
        }),
      ),
      nipCode: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    if (!profile) {
      throw new Error('Child profile not found');
    }

    await ctx.db.patch(args.childProfileId, {
      personal: { ...profile.personal, ...args.personal },
    });

    return args.childProfileId;
  },
});

export const submitChildProfileForValidation = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    if (!profile) {
      throw new Error('Child profile not found');
    }

    if (profile.status !== ProfileStatus.Draft) {
      throw new Error('Only draft profiles can be submitted');
    }

    // Get the author user
    const user = await ctx.db.get(profile.authorUserId);
    if (!user) {
      throw new Error('User not found');
    }

    const userCountryCode = user.countryCode;
    if (!userCountryCode) {
      throw new Error('User country code not found');
    }

    // Check if there's already a registration request
    if (profile.registrationRequest) {
      throw new Error('profile_already_has_validation_request');
    }

    // Check for existing registration request - we need to check through the service
    const existingRequest = await ctx.db
      .query('requests')
      .filter((q) =>
        q.and(
          q.eq(q.field('profileId'), args.childProfileId),
          q.or(
            q.eq(q.field('status'), RequestStatus.Pending),
            q.eq(q.field('status'), RequestStatus.Submitted),
            q.eq(q.field('status'), RequestStatus.UnderReview),
            q.eq(q.field('status'), RequestStatus.InProduction),
            q.eq(q.field('status'), RequestStatus.Validated),
            q.eq(q.field('status'), RequestStatus.ReadyForPickup),
            q.eq(q.field('status'), RequestStatus.AppointmentScheduled),
          ),
        ),
      )
      .first();

    if (existingRequest) {
      // Verify it's a registration request by checking the service
      const service = await ctx.db.get(existingRequest.serviceId);
      if (service?.category === ServiceCategory.Registration) {
        throw new Error(`existing_registration_request:${existingRequest.status}`);
      }
    }

    // Validate documents - Birth certificate is required for children
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', 'childProfile'),
      )
      .collect();

    const birthCertificate = documents.find((d) => d?.type === 'birth_certificate');

    if (!birthCertificate) {
      throw new Error('missing_documents:birthCertificate');
    }

    // Validate basic information
    const requiredBasicInfo = [
      { name: 'firstName', value: profile.personal?.firstName },
      { name: 'lastName', value: profile.personal?.lastName },
      { name: 'birthDate', value: profile.personal?.birthDate },
      { name: 'birthPlace', value: profile.personal?.birthPlace },
      { name: 'nationality', value: profile.personal?.nationality },
    ];

    const missingBasicInfo = requiredBasicInfo
      .filter((field) => !field.value)
      .map((field) => field.name);

    if (missingBasicInfo.length > 0) {
      throw new Error(`missing_basic_info:${missingBasicInfo.join(',')}`);
    }

    // Get the registration service for the user's country
    const service = await ctx.db
      .query('services')
      .filter((q) =>
        q.and(
          q.eq(q.field('category'), ServiceCategory.Registration),
          q.eq(q.field('status'), 'active'),
        ),
      )
      .first();

    if (!service) {
      throw new Error('service_not_found');
    }

    // Get the organization for this service
    const organization = service.organizationId
      ? await ctx.db.get(service.organizationId)
      : null;

    if (!organization) {
      throw new Error('organization_not_found');
    }

    // Generate unique request number
    const now = Date.now();
    const requestNumber = `REG-CHILD-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the service request
    const requestId = await ctx.db.insert('requests', {
      number: requestNumber,
      serviceId: service._id,
      profileId: args.childProfileId,
      requesterId: profile.authorUserId,
      status: RequestStatus.Submitted,
      priority: 0,
      documentIds: [],
      generatedDocuments: [],
      notes: [],
      metadata: {
        submittedAt: now,
        activities: [
          {
            type: 'request_submitted',
            actorId: profile.authorUserId,
            timestamp: now,
            data: {
              profileType: 'child',
              description: 'Child profile submitted for validation',
            },
          },
        ],
      },
    });

    // Update profile status and link to request
    await ctx.db.patch(args.childProfileId, {
      status: ProfileStatus.Pending,
      registrationRequest: requestId,
    });

    return args.childProfileId;
  },
});

// Queries
export const getChildProfile = query({
  args: { childProfileId: v.id('childProfiles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.childProfileId);
  },
});

export const getChildProfilesByAuthor = query({
  args: { authorUserId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('childProfiles')
      .filter((q) => q.eq(q.field('authorUserId'), args.authorUserId))
      .order('desc')
      .collect();
  },
});

export const getChildProfileWithDocuments = query({
  args: { childProfileId: v.id('childProfiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    if (!profile) return null;

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', 'childProfile'),
      )
      .collect();

    return {
      ...profile,
      documents,
    };
  },
});

export const getAllChildProfiles = query({
  args: {
    status: v.optional(v.string()),
    residenceCountry: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let profiles: Array<Doc<'childProfiles'>> = [];

    profiles = await ctx.db.query('childProfiles').order('desc').collect();

    if (args.status) {
      profiles = profiles.filter((profile) => profile.status === args.status);
    }

    if (args.residenceCountry) {
      profiles = profiles.filter(
        (profile) => profile.residenceCountry === args.residenceCountry,
      );
    }

    if (args.limit) {
      profiles = profiles.slice(0, args.limit);
    }

    return profiles;
  },
});

export const getCurrentChildProfile = query({
  args: { childProfileId: v.id('childProfiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    if (!profile) {
      return null;
    }

    // Get documents associated with the profile
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', 'childProfile'),
      )
      .collect();

    const identityPicture = documents.find((d) => d?.type === 'identity_photo');
    const passport = documents.find((d) => d?.type === 'passport');
    const birthCertificate = documents.find((d) => d?.type === 'birth_certificate');
    const residencePermit = documents.find((d) => d?.type === 'residence_permit');
    const addressProof = documents.find((d) => d?.type === 'proof_of_address');

    const registrationRequest = profile.registrationRequest
      ? await ctx.db.get(profile.registrationRequest)
      : null;

    return {
      ...profile,
      registrationRequest,
      identityPicture,
      passport,
      birthCertificate,
      residencePermit,
      addressProof,
    };
  },
});

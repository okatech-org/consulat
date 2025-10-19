import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import {
  ProfileStatus,
  ServiceCategory,
  RequestStatus,
  OwnerType,
  RequestPriority,
  ActivityType,
  DocumentType,
  ParentalRole,
  Gender,
} from '../lib/constants';
import type { ProfileStatus as ProfileStatusType } from '../lib/constants';
import type { Doc } from '../_generated/dataModel';
import {
  genderValidator,
  nationalityAcquisitionValidator,
  parentalAuthorityValidator,
  profileStatusValidator,
} from '../lib/validators';
import { api } from '../_generated/api';

// Mutations
export const createChildProfile = mutation({
  args: {
    authorUserId: v.id('users'),
    residenceCountry: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.authorUserId))
      .first();

    if (!currentUserProfile) {
      throw new Error('user_profile_not_found');
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
      parents: [
        {
          profileId: currentUserProfile._id,
          role:
            currentUserProfile.personal?.gender === Gender.Male
              ? ParentalRole.Father
              : ParentalRole.Mother,
          firstName: currentUserProfile.personal?.firstName || '',
          lastName: currentUserProfile.personal?.lastName || '',
          email: currentUserProfile.contacts?.email,
          phoneNumber: currentUserProfile.contacts?.phone,
          address: currentUserProfile.contacts?.address,
        },
      ],
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
    parents: v.optional(v.array(parentalAuthorityValidator)),
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

    if (args.parents !== undefined) {
      updateData.parents = args.parents;
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
      throw new Error('profile_not_found');
    }

    if (profile.residenceCountry === undefined) {
      throw new Error('profile_not_found');
    }

    if (profile.status !== ProfileStatus.Draft) {
      throw new Error('profile_not_draft');
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
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
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

    // Get the organization's registration service
    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_country', (q) => q.eq('countryIds', [profile.residenceCountry!]))
      .first();

    if (!organization) {
      throw new Error('organization_not_found');
    }

    const registrationService = await ctx.db
      .query('services')
      .withIndex('by_category', (q) => q.eq('category', ServiceCategory.Registration))
      .first();

    if (!registrationService) {
      throw new Error('registration_service_not_found');
    }

    // Generate unique request number
    const now = Date.now();
    const requestNumber = `REG-CHILD-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the service request
    const requestId = await ctx.db.insert('requests', {
      number: requestNumber,
      serviceId: registrationService._id,
      profileId: args.childProfileId,
      requesterId: profile.authorUserId,
      status: RequestStatus.Submitted,
      priority: RequestPriority.Normal,
      documentIds: [],
      generatedDocuments: [],
      notes: [],
      metadata: {
        submittedAt: now,
        activities: [
          {
            type: ActivityType.RequestSubmitted,
            actorId: 'system',
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

    await ctx.scheduler.runAfter(0, api.functions.request.autoAssignRequestToAgent, {
      countryCode: profile.residenceCountry!,
      organizationId: organization._id,
      serviceId: registrationService._id,
      requestId: requestId,
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
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.ChildProfile),
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
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.ChildProfile),
      )
      .collect();

    const identityPicture = documents.find((d) => d?.type === DocumentType.IdentityPhoto);
    const passport = documents.find((d) => d?.type === DocumentType.Passport);
    const birthCertificate = documents.find(
      (d) => d?.type === DocumentType.BirthCertificate,
    );
    const residencePermit = documents.find(
      (d) => d?.type === DocumentType.ResidencePermit,
    );
    const addressProof = documents.find((d) => d?.type === DocumentType.ProofOfAddress);

    const registrationRequest = profile.registrationRequest
      ? await ctx.db.get(profile.registrationRequest)
      : undefined;

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

export const deleteChildProfile = mutation({
  args: { childProfileId: v.id('childProfiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);

    if (!profile) {
      throw new Error('profile_not_found');
    }

    if (profile.status !== ProfileStatus.Draft) {
      throw new Error('profile_not_draft');
    }

    await ctx.db.delete(args.childProfileId);
    return args.childProfileId;
  },
});

export const addParentToChildProfile = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
    parent: parentalAuthorityValidator,
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);

    if (!profile) {
      throw new Error('profile_not_found');
    }

    const existingParent = profile.parents.find(
      (p) => p.profileId === args.parent.profileId,
    );

    if (existingParent) {
      throw new Error('parent_already_exists');
    }

    await ctx.db.patch(args.childProfileId, {
      parents: [...profile.parents, args.parent],
    });

    return args.childProfileId;
  },
});

export const removeParentFromChildProfile = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
    parentId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    if (!profile) {
      throw new Error('profile_not_found');
    }

    const existingParent = profile.parents.find((p) => p.profileId === args.parentId);

    if (!existingParent) {
      throw new Error('parent_not_found');
    }

    await ctx.db.patch(args.childProfileId, {
      parents: profile.parents.filter((p) => p.profileId !== args.parentId),
    });

    return args.childProfileId;
  },
});

export const updateParentInChildProfile = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
    parent: parentalAuthorityValidator,
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    if (!profile) {
      throw new Error('profile_not_found');
    }

    const existingParent = profile.parents.find(
      (p) => p.profileId === args.parent.profileId,
    );

    if (!existingParent) {
      throw new Error('parent_not_found');
    }

    await ctx.db.patch(args.childProfileId, {
      parents: profile.parents.map((p) =>
        p.profileId === args.parent.profileId ? { ...args.parent } : p,
      ),
    });

    return args.childProfileId;
  },
});

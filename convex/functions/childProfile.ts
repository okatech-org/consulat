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
import type { Doc, Id } from '../_generated/dataModel';
import {
  countryCodeValidator,
  genderValidator,
  nationalityAcquisitionValidator,
  parentalAuthorityValidator,
  profileStatusValidator,
} from '../lib/validators';
import { api } from '../_generated/api';
import { paginationOptsValidator } from 'convex/server';

export const queryChildProfiles = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('childProfiles')
      .order('desc')
      .paginate(args.paginationOpts);
  },
});

// Mutations
export const createChildProfile = mutation({
  args: {
    authorUserId: v.id('users'),
    residenceCountry: countryCodeValidator,
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
      consularCard: {},
      personal: {
        firstName: args.firstName,
        lastName: args.lastName,
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
      documents: {},
    });

    return childProfileId;
  },
});

export const updateChildProfile = mutation({
  args: {
    childProfileId: v.id('childProfiles'),
    status: v.optional(profileStatusValidator),
    residenceCountry: v.optional(countryCodeValidator),
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
        birthCountry: v.optional(countryCodeValidator),
        gender: v.optional(genderValidator),
        nationality: v.optional(countryCodeValidator),
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
    passport: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    birthCertificate: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    residencePermit: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    addressProof: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    identityPicture: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
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
      residenceCountry?: typeof existingProfile.residenceCountry;
      consularCard?: typeof existingProfile.consularCard;
      status?: typeof existingProfile.status;
      registrationRequest?: typeof existingProfile.registrationRequest;
      documents?: typeof existingProfile.documents;
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

    if (args.passport !== undefined) {
      updateData.documents = { ...existingProfile.documents, passport: args.passport };
    }
    if (args.birthCertificate !== undefined) {
      updateData.documents = {
        ...existingProfile.documents,
        birthCertificate: args.birthCertificate,
      };
    }
    if (args.residencePermit !== undefined) {
      updateData.documents = {
        ...existingProfile.documents,
        residencePermit: args.residencePermit,
      };
    }
    if (args.addressProof !== undefined) {
      updateData.documents = {
        ...existingProfile.documents,
        addressProof: args.addressProof,
      };
    }
    if (args.identityPicture !== undefined) {
      updateData.documents = {
        ...existingProfile.documents,
        identityPicture: args.identityPicture,
      };
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
      birthCountry: v.optional(countryCodeValidator),
      gender: v.optional(genderValidator),
      nationality: v.optional(countryCodeValidator),
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
    requesterId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.childProfileId);
    const requester = await ctx.db.get(args.requesterId);

    if (!profile || !requester) {
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

    const identityPicture = documents.find((d) => d?.type === DocumentType.IdentityPhoto);

    const birthCertificate = documents.find(
      (d) => d?.type === DocumentType.BirthCertificate,
    );

    if (!identityPicture) {
      throw new Error('missing_documents:identityPicture');
    }

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
      .withIndex('by_country_code', (q) =>
        q.eq('countryCodes', [profile.residenceCountry!]),
      )
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
      organizationId: organization._id,
      countryCode: profile.residenceCountry!,
      requesterId: args.requesterId,
      profileId: args.childProfileId,
      status: RequestStatus.Submitted,
      priority: RequestPriority.Normal,
      documentIds: [identityPicture._id, birthCertificate._id],
      generatedDocuments: [],
      notes: [],
      submittedAt: now,
      metadata: {
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
        profile: {
          firstName: profile.personal?.firstName,
          lastName: profile.personal?.lastName,
          email: requester.contacts?.email,
          phoneNumber: requester.contacts?.phone,
        },
        service: {
          name: registrationService.name,
          category: registrationService.category,
        },
        organization: {
          name: organization.name,
          type: organization.type,
          logo: organization.logo,
        },
        requester: {
          firstName: profile.personal?.firstName,
          lastName: profile.personal?.lastName,
          email: requester.contacts?.email,
          phoneNumber: requester.contacts?.phone,
        },
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

// Enriched profiles list query with filtering and pagination
export const getChildProfilesListEnriched = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.array(v.string())),
    gender: v.optional(v.array(v.string())),
    countryCode: v.optional(v.array(countryCodeValidator)),
    organizationId: v.optional(v.array(v.id('organizations'))),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    let profiles = await ctx.db.query('childProfiles').collect();

    // Filter by status
    if (args.status && args.status.length > 0) {
      profiles = profiles.filter((p) => args.status!.includes(p.status));
    } else {
      profiles = profiles.filter((p) => p.status !== ProfileStatus.Draft);
    }

    // Filter by gender
    if (args.gender && args.gender.length > 0) {
      profiles = profiles.filter((p) =>
        p.personal?.gender ? args.gender!.includes(p.personal.gender) : false,
      );
    }

    // Filter by country code
    if (args.countryCode && args.countryCode.length > 0) {
      profiles = profiles.filter((p) => args.countryCode!.includes(p.residenceCountry!));
    }

    // Filter by search term (firstName, lastName, cardNumber, email)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      profiles = profiles.filter((p) => {
        const firstName = p.personal?.firstName?.toLowerCase() || '';
        const lastName = p.personal?.lastName?.toLowerCase() || '';
        const cardNumber = p.consularCard?.cardNumber?.toLowerCase() || '';
        const parentFirstName = p.parents[0]?.firstName?.toLowerCase() || '';
        const parentLastName = p.parents[0]?.lastName?.toLowerCase() || '';
        const parentEmail = p.parents[0]?.email?.toLowerCase() || '';

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          cardNumber.includes(searchLower) ||
          parentFirstName.includes(searchLower) ||
          parentLastName.includes(searchLower) ||
          parentEmail.includes(searchLower)
        );
      });
    }

    const total = profiles.length;

    // Apply pagination
    const paginatedProfiles = profiles.slice(skip, skip + limit);

    // Enrich with formatted data
    const enrichedProfiles = paginatedProfiles.map((profile) => ({
      id: profile._id,
      cardNumber: profile.consularCard?.cardNumber,
      firstName: profile.personal?.firstName,
      lastName: profile.personal?.lastName,
      parentFirstName: profile.parents[0]?.firstName,
      parentLastName: profile.parents[0]?.lastName,
      parentEmail: profile.parents[0]?.email,
      gender: profile.personal?.gender,
      status: profile.status,
      nipCode: profile.personal?.nipCode,
      birthDate: profile.personal?.birthDate,
      cardIssuedAt: profile.consularCard?.cardIssuedAt
        ? new Date(profile.consularCard.cardIssuedAt).toLocaleDateString()
        : undefined,
      cardExpiresAt: profile.consularCard?.cardExpiresAt
        ? new Date(profile.consularCard.cardExpiresAt).toLocaleDateString()
        : undefined,
      createdAt: new Date(profile._creationTime).toLocaleString(),
      IDPictureUrl: profile.documents?.identityPicture?.fileUrl,
      IDPictureFileName: `${profile.personal?.firstName}_${profile.personal?.lastName}_${profile.consularCard?.cardNumber}`,
      shareUrl: `${process.env.PUBLIC_APP_URL}/listing/profiles/${profile._id}`,
      registrationRequest: profile.registrationRequest,
      countryCode: profile.residenceCountry,
    }));

    return {
      items: enrichedProfiles,
      total,
      page,
      limit,
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

export const isChildProfile = query({
  args: { childProfileId: v.string() },
  handler: async (ctx, args) => {
    const childProfile = await ctx.db
      .query('childProfiles')
      .withIndex('by_id', (q) => q.eq('_id', args.childProfileId as Id<'childProfiles'>))
      .first();

    return !!childProfile;
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

export const getChildProfileByFullName = query({
  args: { firstName: v.string(), lastName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('childProfiles')
      .filter((q) => q.eq(q.field('personal.firstName'), args.firstName))
      .filter((q) => q.eq(q.field('personal.lastName'), args.lastName))
      .first();
  },
});

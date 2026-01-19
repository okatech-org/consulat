import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import {
  ActivityType,
  OwnerType,
  ProfileStatus,
  RequestPriority,
  RequestStatus,
  ServiceCategory,
} from '../lib/constants';
import type { ProfileStatus as ProfileStatusType } from '../lib/constants';
import type { Doc, Id } from '../_generated/dataModel';
import {
  addressValidator,
  emergencyContactValidator,
  genderValidator,
  maritalStatusValidator,
  workStatusValidator,
  nationalityAcquisitionValidator,
  profileStatusValidator,
  countryCodeValidator,
} from '../lib/validators';
import { api } from '../_generated/api';
import { paginationOptsValidator } from 'convex/server';
import { legacyProfiles } from '../lib/legacyProfilesMap';

export const queryProfiles = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query('profiles').order('desc').paginate(args.paginationOpts);
  },
});

// Mutations
export const createProfile = mutation({
  args: {
    userId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    residenceCountry: v.optional(countryCodeValidator),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existingProfile) {
      throw new Error('User already has a profile');
    }

    const profileId = await ctx.db.insert('profiles', {
      userId: args.userId,
      status: ProfileStatus.Draft,
      residenceCountry: args.residenceCountry,
      consularCard: {},
      contacts: {
        email: args.email,
        phone: args.phone,
      },
      personal: {
        firstName: args.firstName,
        lastName: args.lastName,
      },
      family: {},
      emergencyContacts: [],
      professionSituation: {},
      documents: {},
    });

    await ctx.db.patch(args.userId, {
      profileId: profileId,
    });

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    profileId: v.id('profiles'),
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

    contacts: v.optional(
      v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(addressValidator),
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

    family: v.optional(
      v.object({
        maritalStatus: v.optional(maritalStatusValidator),
        father: v.optional(
          v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
          }),
        ),
        mother: v.optional(
          v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
          }),
        ),
        spouse: v.optional(
          v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
          }),
        ),
      }),
    ),

    // Contacts d'urgence
    emergencyContacts: v.optional(v.array(emergencyContactValidator)),

    professionSituation: v.optional(
      v.object({
        workStatus: v.optional(workStatusValidator),
        profession: v.optional(v.string()),
        employer: v.optional(v.string()),
        employerAddress: v.optional(v.string()),
        cv: v.optional(v.id('documents')),
      }),
    ),
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
    const existingProfile = await ctx.db.get(args.profileId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    const updateData: {
      personal?: typeof existingProfile.personal;
      family?: typeof existingProfile.family;
      emergencyContacts?: typeof existingProfile.emergencyContacts;
      professionSituation?: typeof existingProfile.professionSituation;
      residenceCountry?: typeof existingProfile.residenceCountry;
      consularCard?: typeof existingProfile.consularCard;
      contacts?: typeof existingProfile.contacts;
      status?: ProfileStatusType;
      registrationRequest?: typeof existingProfile.registrationRequest;
      documents?: typeof existingProfile.documents;
    } = {};

    if (args.personal !== undefined) {
      updateData.personal = { ...existingProfile.personal, ...args.personal };
    }

    if (args.family !== undefined) {
      updateData.family = { ...existingProfile.family, ...args.family };
    }

    if (args.emergencyContacts !== undefined) {
      updateData.emergencyContacts = args.emergencyContacts;
    }

    if (args.professionSituation !== undefined) {
      updateData.professionSituation = {
        ...existingProfile.professionSituation,
        ...args.professionSituation,
      };
    }

    if (args.residenceCountry !== undefined) {
      updateData.residenceCountry = args.residenceCountry;
    }

    if (args.consularCard !== undefined) {
      updateData.consularCard = { ...existingProfile.consularCard, ...args.consularCard };
    }

    if (args.contacts !== undefined) {
      updateData.contacts = { ...existingProfile.contacts, ...args.contacts };
    }

    if (args.status !== undefined) {
      updateData.status = args.status as ProfileStatusType;
    }

    if (args.registrationRequest !== undefined) {
      updateData.registrationRequest = args.registrationRequest;
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

    await ctx.db.patch(args.profileId, updateData);
    return args.profileId;
  },
});

export const addEmergencyContact = mutation({
  args: {
    profileId: v.id('profiles'),
    emergencyContact: emergencyContactValidator,
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(args.profileId, {
      emergencyContacts: [...profile.emergencyContacts, args.emergencyContact],
    });

    return args.profileId;
  },
});

export const updateEmergencyContact = mutation({
  args: {
    profileId: v.id('profiles'),
    contactIndex: v.number(),
    emergencyContact: emergencyContactValidator,
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    if (args.contactIndex < 0 || args.contactIndex >= profile.emergencyContacts.length) {
      throw new Error('Invalid contact index');
    }

    const updatedContacts = [...profile.emergencyContacts];
    updatedContacts[args.contactIndex] = args.emergencyContact;

    await ctx.db.patch(args.profileId, {
      emergencyContacts: updatedContacts,
    });

    return args.profileId;
  },
});

export const removeEmergencyContact = mutation({
  args: {
    profileId: v.id('profiles'),
    contactIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    if (args.contactIndex < 0 || args.contactIndex >= profile.emergencyContacts.length) {
      throw new Error('Invalid contact index');
    }

    const updatedContacts = profile.emergencyContacts.filter(
      (_, index) => index !== args.contactIndex,
    );

    await ctx.db.patch(args.profileId, {
      emergencyContacts: updatedContacts,
    });

    return args.profileId;
  },
});

export const updateProfileStatus = mutation({
  args: {
    profileId: v.id('profiles'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      status: args.status as ProfileStatusType,
    });

    return args.profileId;
  },
});

// Queries
export const getProfile = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

export const getAllProfiles = query({
  args: {
    status: v.optional(profileStatusValidator),
    residenceCountry: v.optional(countryCodeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let profiles: Array<Doc<'profiles'>> = [];

    if (args.status) {
      profiles = await ctx.db
        .query('profiles')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      profiles = await ctx.db.query('profiles').order('desc').collect();
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

// Enriched profiles list query with filtering and pagination
export const getProfilesListEnriched = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.array(v.string())),
    gender: v.optional(v.array(v.string())),
    countryCode: v.optional(v.array(countryCodeValidator)),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    let profiles = await ctx.db.query('profiles').collect();

    // Filter by status
    if (args.status && args.status.length > 0) {
      profiles = profiles.filter((p) => args.status!.includes(p.status));
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
        const email = p.contacts?.email?.toLowerCase() || '';

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          cardNumber.includes(searchLower) ||
          email.includes(searchLower)
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
      email: profile.contacts?.email,
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
      address: profile.contacts?.address,
      phoneNumber: profile.contacts?.phone,
    }));

    return {
      items: enrichedProfiles,
      total,
      page,
      limit,
    };
  },
});

export const getCurrentProfile = query({
  args: { profileId: v.optional(v.id('profiles')) },
  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();

    if (!userIdentity) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userIdentity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Obtenir le profil par userId
    const profile = args.profileId
      ? await ctx.db.get(args.profileId)
      : await ctx.db
          .query('profiles')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .first();

    if (!profile) {
      return null;
    }

    // Obtenir les documents associés au profil
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
      )
      .collect();

    const identityPicture = documents.find((d) => d?.type === 'identity_photo');
    const passport = documents.find((d) => d?.type === 'passport');
    const birthCertificate = documents.find((d) => d?.type === 'birth_certificate');
    const residencePermit = documents.find((d) => d?.type === 'residence_permit');
    const addressProof = documents.find((d) => d?.type === 'proof_of_address');

    const registrationRequest = profile.registrationRequest!
      ? await ctx.db
          .query('requests')
          .withIndex('by_id', (q) => q.eq('_id', profile.registrationRequest!))
          .first()
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

export const getCompleteProfileById = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);

    if (!profile) {
      return null;
    }

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
      )
      .collect();

    const identityPicture = documents.find((d) => d?.type === 'identity_photo');
    const passport = documents.find((d) => d?.type === 'passport');
    const birthCertificate = documents.find((d) => d?.type === 'birth_certificate');
    const residencePermit = documents.find((d) => d?.type === 'residence_permit');
    const addressProof = documents.find((d) => d?.type === 'proof_of_address');

    const registrationRequest = profile.registrationRequest!
      ? await ctx.db
          .query('requests')
          .withIndex('by_id', (q) => q.eq('_id', profile.registrationRequest!))
          .first()
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

export const getProfilIdFromPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const isProfile = await ctx.db
      .query('profiles')
      .withIndex('by_id', (q) => q.eq('_id', args.publicId as Id<'profiles'>))
      .first();

    if (isProfile) {
      return args.publicId as Id<'profiles'>;
    }

    const isChildProfile = await ctx.db
      .query('childProfiles')
      .withIndex('by_id', (q) => q.eq('_id', args.publicId as Id<'childProfiles'>))
      .first();

    if (isChildProfile) {
      return isChildProfile._id;
    }

    const profile = legacyProfiles[args.publicId] as Id<'profiles'> | undefined;

    if (profile) {
      return profile;
    }

    return null;
  },
});

// Submit adult profile for validation (with full validation logic)
export const submitProfileForValidation = mutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);

    if (!profile) {
      throw new Error('profile_not_found');
    }

    if (profile.status !== ProfileStatus.Draft) {
      throw new Error('profile_not_draft');
    }

    // Get the author user
    const user = await ctx.db.get(profile.userId);

    if (!user) {
      throw new Error('user_not_found');
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
          q.eq(q.field('profileId'), args.profileId),
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

    // Validate documents - Adult profiles require passport, birth certificate, and address proof
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
      )
      .collect();

    const passport = documents.find((d) => d?.type === 'passport');
    const birthCertificate = documents.find((d) => d?.type === 'birth_certificate');
    const addressProof = documents.find((d) => d?.type === 'proof_of_address');

    const missingDocs = [];
    if (!birthCertificate) missingDocs.push('birthCertificate');
    if (!passport) missingDocs.push('passport');
    if (!addressProof) missingDocs.push('addressProof');

    if (missingDocs.length > 0) {
      throw new Error(`missing_documents:${missingDocs.join(',')}`);
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

    // Validate contact information for adults
    const requiredContactInfo = [
      { name: 'address', value: profile.contacts?.address },
      { name: 'phone', value: profile.contacts?.phone },
      { name: 'email', value: profile.contacts?.email },
    ];

    const missingContactInfo = requiredContactInfo
      .filter((field) => !field.value)
      .map((field) => field.name);

    if (missingContactInfo.length > 0) {
      throw new Error(`missing_contact_info:${missingContactInfo.join(',')}`);
    }

    // Check emergency contacts
    if (!profile.emergencyContacts || profile.emergencyContacts.length === 0) {
      throw new Error('missing_contact_info:emergencyContacts');
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
    const requestNumber = `REG-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the service request
    const requestId = await ctx.db.insert('requests', {
      number: requestNumber,
      serviceId: registrationService._id,
      organizationId: organization._id,
      countryCode: profile.residenceCountry!,

      profileId: args.profileId,
      requesterId: profile._id,
      status: RequestStatus.Submitted,
      priority: RequestPriority.Normal,
      documentIds: [],
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
              profileType: 'adult',
              description: 'Adult profile submitted for validation',
            },
          },
        ],
        service: {
          name: registrationService.name,
          category: registrationService.category,
        },
        profile: {
          firstName: profile.personal?.firstName,
          lastName: profile.personal?.lastName,
          email: profile.contacts?.email,
          phoneNumber: profile.contacts?.phone,
        },
        organization: {
          name: organization.name,
          type: organization.type,
          logo: organization.logo,
        },
        requester: {
          firstName: profile.personal?.firstName,
          lastName: profile.personal?.lastName,
          email: profile.contacts?.email,
          phoneNumber: profile.contacts?.phone,
        },
      },
    });

    // Update profile status and link to request
    await ctx.db.patch(args.profileId, {
      status: ProfileStatus.Pending,
      registrationRequest: requestId,
    });

    await ctx.scheduler.runAfter(0, api.functions.request.autoAssignRequestToAgent, {
      countryCode: profile.residenceCountry!,
      organizationId: organization._id,
      serviceId: registrationService._id,
      requestId: requestId,
    });

    return args.profileId;
  },
});

export const getOverviewProfile = query({
  args: { userId: v.id('users'), profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profileRequest = ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const profile = await profileRequest;

    if (!profile) {
      return null;
    }

    const documentsRequest = ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
      )
      .collect();

    const requestsRequest: Promise<Array<Doc<'requests'>>> = ctx.runQuery(
      api.functions.request.getUserRequests,
      {
        profileId: profile._id,
      },
    );

    const parentalAuthoritiesRequest = ctx.db
      .query('childProfiles')
      .filter((q) => q.eq(q.field('authorUserId'), args.userId))
      .collect();

    const [documents, userRequests, parentalAuthorities] = await Promise.all([
      documentsRequest,
      requestsRequest,
      parentalAuthoritiesRequest,
    ]);

    const pendingRequests = userRequests.filter((request) =>
      [
        RequestStatus.Submitted,
        RequestStatus.Pending,
        RequestStatus.PendingCompletion,
      ].includes(request.status as RequestStatus),
    );
    const completedRequests = userRequests.filter((request) =>
      [
        RequestStatus.Validated,
        RequestStatus.InProduction,
        RequestStatus.ReadyForPickup,
        RequestStatus.AppointmentScheduled,
        RequestStatus.Completed,
      ].includes(request.status as RequestStatus),
    );

    return {
      documentsCount: documents.length,
      requestStats: {
        total: userRequests.length,
        pending: pendingRequests.length,
        completed: completedRequests.length,
      },
      profile: {
        identityPicture: documents.find((d) => d?.type === 'identity_photo')?.fileUrl,
        ...profile!,
      },
      childrenCount: parentalAuthorities.length,
    };
  },
});

// Fonction pour mettre à jour les informations personnelles du profil
export const updatePersonalInfo = mutation({
  args: {
    profileId: v.id('profiles'),
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
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(args.profileId, {
      personal: { ...profile.personal, ...args.personal },
    });

    return args.profileId;
  },
});

// Fonction pour mettre à jour les informations familiales du profil
export const updateFamilyInfo = mutation({
  args: {
    profileId: v.id('profiles'),
    family: v.object({
      maritalStatus: v.optional(maritalStatusValidator),
      father: v.optional(
        v.object({
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
        }),
      ),
      mother: v.optional(
        v.object({
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
        }),
      ),
      spouse: v.optional(
        v.object({
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(args.profileId, {
      family: { ...profile.family, ...args.family },
    });

    return args.profileId;
  },
});

// Fonction pour mettre à jour les informations professionnelles du profil
export const updateProfessionalInfo = mutation({
  args: {
    profileId: v.id('profiles'),
    professionSituation: v.object({
      workStatus: v.optional(workStatusValidator),
      profession: v.optional(v.string()),
      employer: v.optional(v.string()),
      employerAddress: v.optional(v.string()),
      activityInGabon: v.optional(v.string()),
      cv: v.optional(v.id('documents')),
    }),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(args.profileId, {
      professionSituation: {
        ...profile.professionSituation,
        ...args.professionSituation,
      },
    });

    return args.profileId;
  },
});

// Fonction pour mettre à jour les contacts du profil
export const updateContacts = mutation({
  args: {
    profileId: v.id('profiles'),
    contacts: v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(addressValidator),
    }),
    emergencyContacts: v.optional(v.array(emergencyContactValidator)),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const patchData: any = {
      contacts: { ...profile.contacts, ...args.contacts },
    };

    if (args.emergencyContacts) {
      patchData.emergencyContacts = args.emergencyContacts;
    }

    await ctx.db.patch(args.profileId, patchData);

    return args.profileId;
  },
});

export const getProfilesMapData = query({
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query('profiles')
      .filter((q) => q.not(q.eq(q.field('status'), ProfileStatus.Draft)))
      .collect();

    const childProfiles = await ctx.db
      .query('childProfiles')
      .filter((q) => q.not(q.eq(q.field('status'), ProfileStatus.Draft)))
      .collect();

    const profilesMapData = profiles
      .filter((profile) => {
        return (
          profile.contacts?.address &&
          profile.personal?.firstName &&
          profile.personal?.lastName
        );
      })
      .map((profile) => {
        return {
          id: profile._id,
          firstName: profile.personal!.firstName!,
          lastName: profile.personal!.lastName!,
          address: profile.contacts!.address!,
          status: profile.status,
        };
      });

    const childProfilesMapData = childProfiles
      .filter((profile) => {
        if (!profile.personal?.firstName || !profile.personal?.lastName) {
          return false;
        }
        if (!profile.parents || profile.parents.length === 0) {
          return false;
        }
        const [parent1, parent2] = profile.parents;
        return !!(parent1?.address || parent2?.address);
      })
      .map((profile) => {
        const [parent1, parent2] = profile.parents!;
        return {
          id: profile._id,
          firstName: profile.personal!.firstName!,
          lastName: profile.personal!.lastName!,
          address: parent1?.address || parent2?.address,
          status: profile.status,
        };
      });

    return [...profilesMapData, ...childProfilesMapData];
  },
});

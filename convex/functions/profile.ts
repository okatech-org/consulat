import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import {
  ActivityType,
  OwnerType,
  ProfileStatus,
  RequestPriority,
  RequestStatus,
  ServiceCategory,
  ServiceStatus,
} from '../lib/constants';
import type { ProfileStatus as ProfileStatusType } from '../lib/constants';
import type { Doc } from '../_generated/dataModel';
import {
  addressValidator,
  emergencyContactValidator,
  genderValidator,
  maritalStatusValidator,
  workStatusValidator,
  nationalityAcquisitionValidator,
  profileStatusValidator,
} from '../lib/validators';
import { api } from '../_generated/api';

// Mutations
export const createProfile = mutation({
  args: {
    userId: v.id('users'),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    residenceCountry: v.optional(v.string()),
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
      consularCard: {
        cardNumber: undefined,
        cardIssuedAt: undefined,
        cardExpiresAt: undefined,
      },
      contacts: {
        email: args.email,
        phone: args.phone,
        address: undefined,
      },
      personal: {
        firstName: args.firstName,
        lastName: args.lastName,
      },
      family: {
        father: undefined,
        mother: undefined,
        spouse: undefined,
      },
      emergencyContacts: [],
      professionSituation: {
        workStatus: undefined,
        profession: undefined,
        employer: undefined,
        employerAddress: undefined,
        cv: undefined,
      },
      registrationRequest: undefined,
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
    residenceCountry: v.optional(v.string()),
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
      residenceCountry?: string;
      consularCard?: typeof existingProfile.consularCard;
      contacts?: typeof existingProfile.contacts;
      status?: ProfileStatusType;
      registrationRequest?: typeof existingProfile.registrationRequest;
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

export const updateConsularCard = mutation({
  args: {
    profileId: v.id('profiles'),
    consularCard: v.object({
      cardNumber: v.optional(v.string()),
      cardIssuedAt: v.optional(v.number()),
      cardExpiresAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(args.profileId, {
      consularCard: { ...profile.consularCard, ...args.consularCard },
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

export const getProfileByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
  },
});

export const getAllProfiles = query({
  args: {
    status: v.optional(profileStatusValidator),
    residenceCountry: v.optional(v.string()),
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

export const getProfilesByStatus = query({
  args: { status: profileStatusValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect();
  },
});

export const getProfilesByResidenceCountry = query({
  args: { residenceCountry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('residenceCountry'), args.residenceCountry))
      .order('desc')
      .collect();
  },
});

export const getProfileWithDocuments = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profile._id).eq('ownerType', OwnerType.Profile),
      )
      .collect();

    return {
      ...profile,
      documents,
    };
  },
});

export const searchProfiles = query({
  args: {
    searchTerm: v.string(),
    status: v.optional(profileStatusValidator),
  },
  handler: async (ctx, args) => {
    let profiles: Array<Doc<'profiles'>> = [];

    if (args.status) {
      profiles = await ctx.db
        .query('profiles')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else {
      profiles = await ctx.db.query('profiles').collect();
    }

    return profiles.filter((profile) => {
      const searchLower = args.searchTerm.toLowerCase();
      return (
        (profile.personal?.firstName &&
          profile.personal.firstName.toLowerCase().includes(searchLower)) ||
        (profile.personal?.lastName &&
          profile.personal.lastName.toLowerCase().includes(searchLower)) ||
        (profile.consularCard?.cardNumber &&
          profile.consularCard.cardNumber.toLowerCase().includes(searchLower))
      );
    });
  },
});

// Nouvelle fonction pour obtenir le profil courant avec toutes les données nécessaires
export const getCurrentProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Obtenir le profil par userId
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
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

// Submit adult profile for validation (with full validation logic)
export const submitProfileForValidation = mutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    if (profile.status !== ProfileStatus.Draft) {
      throw new Error('Only draft profiles can be submitted');
    }

    // Get the user who owns this profile
    const user = profile.userId ? await ctx.db.get(profile.userId) : null;
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

    // Get the registration service for the user's country
    const service = await ctx.db
      .query('services')
      .filter((q) =>
        q.and(
          q.eq(q.field('category'), ServiceCategory.Registration),
          q.eq(q.field('status'), ServiceStatus.Active),
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
    const requestNumber = `REG-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the service request
    const requestId = await ctx.db.insert('requests', {
      number: requestNumber,
      serviceId: service._id,
      profileId: args.profileId,
      requesterId: profile.userId!,
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
            actorId: profile.userId!,
            timestamp: now,
            data: {
              profileType: 'adult',
              description: 'Adult profile submitted for validation',
            },
          },
        ],
      },
    });

    // Update profile status and link to request
    await ctx.db.patch(args.profileId, {
      status: ProfileStatus.Pending,
      registrationRequest: requestId,
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
        userId: args.userId,
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
      identityPicture: v.optional(v.any()),
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
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await ctx.db.patch(args.profileId, {
      contacts: { ...profile.contacts, ...args.contacts },
    });

    return args.profileId;
  },
});

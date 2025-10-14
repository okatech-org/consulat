import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { ProfileStatus, RequestStatus } from '../lib/constants';
import type { ProfileStatus as ProfileStatusType } from '../lib/constants';
import type { Doc } from '../_generated/dataModel';
import {
  addressValidator,
  emergencyContactValidator,
  genderValidator,
  maritalStatusValidator,
  workStatusValidator,
  nationalityAcquisitionValidator,
  profileCategoryValidator,
  profileStatusValidator,
} from '../lib/validators';
import { api } from '../_generated/api';

// Mutations
export const createProfile = mutation({
  args: {
    userId: v.id('users'),
    category: profileCategoryValidator,
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
        birthDate: undefined,
        birthPlace: undefined,
        birthCountry: undefined,
        gender: undefined,
        nationality: undefined,
        acquisitionMode: undefined,
        passportInfos: undefined,
        nipCode: undefined,
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

export const updateFamilyInfo = mutation({
  args: {
    profileId: v.id('profiles'),
    family: v.object({
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
    status: v.optional(v.string()),
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
  args: { status: v.string() },
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
        q.eq('ownerId', profile._id).eq('ownerType', 'profile'),
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
    status: v.optional(v.string()),
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
        q.eq('ownerId', profile._id).eq('ownerType', 'profile'),
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

// Nouvelle fonction pour soumettre un profil pour validation
export const submitProfileForValidation = mutation({
  args: {
    profileId: v.id('profiles'),
    isChild: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    if (profile.status !== ProfileStatus.Draft) {
      throw new Error('Only draft profiles can be submitted');
    }

    // Mettre à jour le statut du profil
    await ctx.db.patch(args.profileId, {
      status: ProfileStatus.Pending,
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
        q.eq('ownerId', profile._id).eq('ownerType', 'profile'),
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

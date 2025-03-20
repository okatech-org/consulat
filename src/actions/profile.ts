'use server';

import { db } from '@/lib/prisma';
import { ConsularService, Profile, ServiceCategory, Prisma } from '@prisma/client';
import { checkAuth } from '@/lib/auth/action';
import { FullProfileInclude } from '@/types';
import { CountryCode } from '@/lib/autocomplete-datas';
import { tryCatch } from '@/lib/utils';
import { assignAgentToRequest } from '@/actions/agents';

import { CreateProfileInput, FullProfileUpdateFormData } from '@/schemas/registration';
import {
  NameSchema,
  CountryCodeSchema,
  EmailSchema,
  DateSchema,
  PhoneNumberSchema,
} from '@/schemas/inputs';
import { z } from 'zod';
import { isUserExists } from './auth';

const homeLandCountry = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as CountryCode;

const CreateProfileAsyncSchema = z
  .object({
    firstName: NameSchema,
    lastName: NameSchema,
    residenceCountyCode: CountryCodeSchema,
    email: EmailSchema.optional(),
    phoneNumber: PhoneNumberSchema.refine(async (phone) => {
      const existingPhoneUser = await db.user.findUnique({
        where: {
          phoneNumber: phone,
        },
      });

      return !existingPhoneUser;
    }),
    emailVerified: DateSchema.optional(),
    phoneVerified: DateSchema.optional(),
    otp: z.string().length(6, { message: 'messages.errors.otp_length' }).optional(),
  })
  .superRefine(async (data) => {
    const [existingUser, existingPhone] = await Promise.all([
      isUserExists(undefined, data.email, data.phoneNumber),
      isUserExists(undefined, undefined, data.phoneNumber),
    ]);

    if (existingUser) {
      throw new Error('email-user_email_already_exists');
    }

    if (existingPhone) {
      throw new Error('phone.number-user_phone_already_exists');
    }
  });

export async function createUserWithProfile(input: CreateProfileInput) {
  const {
    firstName,
    lastName,
    residenceCountyCode,
    email,
    phoneNumber,
    emailVerified,
    phoneVerified,
  } = await CreateProfileAsyncSchema.parseAsync(input);

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: `${firstName ?? ''} ${lastName ?? ''}`,
        email,
        emailVerified,
        phoneVerified,
        phoneNumber,
        countryCode: residenceCountyCode,
      },
    });

    if (!user) {
      throw new Error('user_creation_failed');
    }

    await tx.profile.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        residenceCountyCode,
        ...(homeLandCountry && { nationality: homeLandCountry }),
        ...(email && { email }),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  });
}

export async function updateProfile(
  profileId: string,
  data: Partial<FullProfileUpdateFormData>,
): Promise<Profile> {
  const { user } = await checkAuth();

  if (!user || !user?.id) {
    throw new Error('unauthorized');
  }

  // Récupérer le profil existant avec toutes les relations nécessaires
  const existingProfile = await db.profile.findUnique({
    where: { id: profileId },
    ...FullProfileInclude, // Utiliser l'include complet pour avoir toutes les données
  });

  if (!existingProfile) {
    throw new Error('profile_not_found');
  }

  // Préparer les données déstructurées
  const {
    passportIssueDate,
    passportExpiryDate,
    address,
    residentContact,
    homeLandContact,
    passport,
    birthCertificate,
    residencePermit,
    addressProof,
    identityPicture,
    birthDate,
    ...remain
  } = data;

  // Initialiser l'objet de mise à jour avec les propriétés de base
  const updateData: Prisma.ProfileUpdateInput = {
    ...remain,
    ...(birthDate && { birthDate: new Date(birthDate) }),
    ...(passportIssueDate && { passportIssueDate: new Date(passportIssueDate) }),
    ...(passportExpiryDate && { passportExpiryDate: new Date(passportExpiryDate) }),
  };

  // Gérer la mise à jour de l'adresse séparément si fournie
  if (address) {
    updateData.address = {
      upsert: {
        create: address,
        update: address,
      },
    };
  }

  // Gérer la mise à jour du contact résident séparément si fournie
  if (residentContact) {
    // S'assurer que tous les champs requis sont présents
    const safeResidentContact = {
      firstName: residentContact.firstName || existingProfile.firstName || '',
      lastName: residentContact.lastName || existingProfile.lastName || '',
      relationship: residentContact.relationship || 'OTHER', // Valeur par défaut pour éviter null
      phoneNumber: residentContact.phoneNumber,
    };

    updateData.residentContact = {
      upsert: {
        create: {
          ...safeResidentContact,
          ...(residentContact.address && {
            address: {
              create: residentContact.address,
            },
          }),
        },
        update: {
          ...(residentContact.firstName && { firstName: residentContact.firstName }),
          ...(residentContact.lastName && { lastName: residentContact.lastName }),
          ...(residentContact.relationship && {
            relationship: residentContact.relationship,
          }),
          ...(residentContact.phoneNumber && {
            phoneNumber: residentContact.phoneNumber,
          }),
          ...(residentContact.address && {
            address: {
              upsert: {
                create: residentContact.address,
                update: residentContact.address,
              },
            },
          }),
        },
      },
    };
  }

  // Gérer la mise à jour du contact au pays d'origine séparément si fournie
  if (homeLandContact) {
    // S'assurer que tous les champs requis sont présents
    const safeHomeLandContact = {
      firstName: homeLandContact.firstName || existingProfile.firstName || '',
      lastName: homeLandContact.lastName || existingProfile.lastName || '',
      relationship: homeLandContact.relationship || 'OTHER', // Valeur par défaut pour éviter null
      phoneNumber: homeLandContact.phoneNumber,
    };

    updateData.homeLandContact = {
      upsert: {
        create: {
          ...safeHomeLandContact,
          ...(homeLandContact.address && {
            address: {
              create: homeLandContact.address,
            },
          }),
        },
        update: {
          ...(homeLandContact.firstName && { firstName: homeLandContact.firstName }),
          ...(homeLandContact.lastName && { lastName: homeLandContact.lastName }),
          ...(homeLandContact.relationship && {
            relationship: homeLandContact.relationship,
          }),
          ...(homeLandContact.phoneNumber && {
            phoneNumber: homeLandContact.phoneNumber,
          }),
          ...(homeLandContact.address && {
            address: {
              upsert: {
                create: homeLandContact.address,
                update: homeLandContact.address,
              },
            },
          }),
        },
      },
    };
  }

  // Gérer les connexions de documents avec connect
  if (identityPicture && identityPicture.id) {
    updateData.identityPicture = { connect: { id: identityPicture.id } };
  }

  if (passport && passport.id) {
    updateData.passport = { connect: { id: passport.id } };
  }

  if (birthCertificate && birthCertificate.id) {
    updateData.birthCertificate = { connect: { id: birthCertificate.id } };
  }

  if (residencePermit && residencePermit.id) {
    updateData.residencePermit = { connect: { id: residencePermit.id } };
  }

  if (addressProof && addressProof.id) {
    updateData.addressProof = { connect: { id: addressProof.id } };
  }

  const updateResult = await tryCatch(
    db.profile.update({
      where: { id: existingProfile.id },
      data: updateData,
      ...FullProfileInclude,
    }),
  );

  if (updateResult.error || !updateResult.data) {
    throw new Error('profile_update_failed');
  }

  return updateResult.data;
}

export async function submitProfileForValidation(
  profileId: string,
  isChild: boolean = false,
): Promise<Profile> {
  const { user: currentUser } = await checkAuth();

  if (!currentUser || !currentUser.countryCode) {
    throw new Error('unauthorized');
  }

  const registrationService = await getRegistrationServiceForUser(
    currentUser.countryCode,
  );

  if (!registrationService) {
    throw new Error('service_not_found');
  }

  // Vérifier que le profil existe et est complet
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    ...FullProfileInclude,
  });

  if (!profile) {
    throw new Error('profile_not_found');
  }

  // Validate documents
  const requiredDocuments = [
    { name: 'birthCertificate', value: profile.birthCertificate },
  ];

  if (!isChild) {
    requiredDocuments.push(
      { name: 'passport', value: profile.passport },
      { name: 'addressProof', value: profile.addressProof },
    );
  }

  const missingDocuments = requiredDocuments
    .filter((doc) => !doc.value)
    .map((doc) => doc.name);
  if (missingDocuments.length > 0) {
    throw new Error(`missing_documents:${missingDocuments.join(',')}`);
  }

  // Basic information validation
  const requiredBasicInfo = [
    { name: 'firstName', value: profile.firstName },
    { name: 'lastName', value: profile.lastName },
    { name: 'birthDate', value: profile.birthDate },
    { name: 'birthPlace', value: profile.birthPlace },
    { name: 'nationality', value: profile.nationality },
  ];

  const missingBasicInfo = requiredBasicInfo
    .filter((field) => !field.value)
    .map((field) => field.name);
  if (missingBasicInfo.length > 0) {
    throw new Error(`missing_basic_info:${missingBasicInfo.join(',')}`);
  }

  // Contact info validation (not required for children)
  if (!isChild) {
    const requiredContactInfo = [
      { name: 'address', value: profile.address },
      { name: 'phoneNumber', value: profile.phoneNumber },
      { name: 'email', value: profile.email },
      { name: 'residentContact', value: profile.residentContact },
    ];

    const missingContactInfo = requiredContactInfo
      .filter((field) => !field.value)
      .map((field) => field.name);
    if (missingContactInfo.length > 0) {
      throw new Error(`missing_contact_info:${missingContactInfo.join(',')}`);
    }
  }

  // Create the service request
  const serviceRequest = await db.serviceRequest.create({
    data: {
      serviceCategory: ServiceCategory.REGISTRATION,
      organization: {
        connect: {
          id: registrationService.organizationId ?? '',
        },
      },
      country: {
        connect: {
          code: currentUser.countryCode,
        },
      },
      submittedBy: {
        connect: {
          id: currentUser.id,
        },
      },
      service: {
        connect: {
          id: registrationService.id,
        },
      },
      requestedFor: {
        connect: {
          id: profileId,
        },
      },
    },
  });

  // Assign an agent to the request if possible
  if (registrationService.organizationId) {
    const { error } = await tryCatch(
      assignAgentToRequest(
        serviceRequest.id,
        registrationService.organizationId,
        currentUser.countryCode as CountryCode,
        db,
      ),
    );

    if (error) {
      // Log the error but continue with profile update
      console.error('Failed to assign agent:', error);
    }
  }

  // Update profile status and return
  return db.profile.update({
    where: { id: profileId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });
}

export async function getRegistrationServiceForUser(
  countryCode: string,
): Promise<ConsularService | null> {
  await checkAuth();

  const service = await db.consularService.findFirst({
    where: {
      countryCode,
      category: 'REGISTRATION',
    },
  });

  return service;
}

export async function getAvailableServices(countryCode: string) {
  const countryData = await db.country.findUnique({
    where: {
      code: countryCode,
    },
    include: {
      availableServices: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return countryData?.availableServices ?? [];
}

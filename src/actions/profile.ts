'use server';

import { getTranslations } from 'next-intl/server';
import { checkAuth } from '@/lib/auth/action';
import { ConsularService, Prisma, Profile, ServiceCategory } from '@prisma/client';
import { db } from '@/lib/prisma';

import { CreateProfileInput, FullProfileUpdateFormData } from '@/schemas/registration';
import { tryCatch } from '@/lib/utils';
import { assignAgentToRequest } from '@/actions/agents';
import { CountryCode } from '@/lib/autocomplete-datas';
import { FullProfileInclude } from '@/types';
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
  const t = await getTranslations('messages.profile.errors');
  const { user } = await checkAuth();

  if (!user || !user?.id) {
    throw new Error(t('unauthorized'));
  }

  const existingProfile = await db.profile.findUnique({
    where: { id: profileId },
  });

  if (!existingProfile) {
    throw new Error(t('profile_not_found'));
  }

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

  const updateData: Prisma.ProfileUpdateInput = {
    ...remain,
    ...(birthDate && { birthDate: new Date(birthDate) }),
    ...(passportIssueDate && { passportIssueDate: new Date(passportIssueDate) }),
    ...(passportExpiryDate && { passportExpiryDate: new Date(passportExpiryDate) }),
    ...(address && {
      address: {
        upsert: {
          create: address,
          update: address,
        },
      },
    }),
    ...(residentContact && {
      residentContact: {
        upsert: {
          create: {
            phoneNumber: residentContact.phoneNumber,
            firstName: residentContact.firstName,
            lastName: residentContact.lastName,
            ...(residentContact.relationship && {
              relationship: residentContact.relationship,
            }),
            ...(residentContact.address && {
              address: {
                create: residentContact.address,
              },
            }),
          },
          update: {
            ...(residentContact.firstName && {
              firstName: residentContact.firstName,
            }),
            ...(residentContact.lastName && {
              lastName: residentContact.lastName,
            }),
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
      },
    }),
    ...(homeLandContact && {
      homeLandContact: {
        upsert: {
          create: {
            firstName: homeLandContact.firstName,
            lastName: homeLandContact.lastName,
            relationship: homeLandContact.relationship,
            phoneNumber: homeLandContact.phoneNumber,
            address: {
              create: homeLandContact.address,
            },
          },
          update: {
            firstName: homeLandContact.firstName,
            lastName: homeLandContact.lastName,
            relationship: homeLandContact.relationship,
            phoneNumber: homeLandContact.phoneNumber,
            address: {
              upsert: {
                create: homeLandContact.address,
                update: homeLandContact.address,
              },
            },
          },
        },
      },
    }),
    ...(identityPicture && {
      identityPicture: {
        upsert: {
          create: identityPicture,
          update: identityPicture,
        },
      },
    }),
    ...(passport && {
      passport: {
        upsert: {
          create: passport,
          update: passport,
        },
      },
    }),
    ...(birthCertificate && {
      birthCertificate: {
        upsert: {
          create: birthCertificate,
          update: birthCertificate,
        },
      },
    }),
    ...(residencePermit && {
      residencePermit: {
        upsert: {
          create: residencePermit,
          update: residencePermit,
        },
      },
    }),
    ...(addressProof && {
      addressProof: {
        upsert: {
          create: addressProof,
          update: addressProof,
        },
      },
    }),
  };

  // Mettre à jour le profil
  const updatedProfile = await db.profile.update({
    where: { id: existingProfile.id },
    data: { ...updateData },
    ...FullProfileInclude,
  });

  return updatedProfile;
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

  // Vérifier que tous les components requis sont présents
  const requiredDocuments = [profile.birthCertificate];

  if (!isChild) {
    requiredDocuments.push(profile.passport);
    requiredDocuments.push(profile.addressProof);
  }

  if (requiredDocuments.some((doc) => !doc)) {
    throw new Error('missing_documents');
  }

  // Vérifier que toutes les informations requises sont présentes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requiredFields: any[] = [
    profile.firstName,
    profile.lastName,
    profile.birthDate,
    profile.birthPlace,
    profile.nationality,
  ];

  if (!isChild) {
    requiredFields.push(
      profile.address,
      profile.phoneId,
      profile.email,
      profile.residentContact,
      profile.homeLandContact,
    );
  }

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
      throw error;
    }
  }

  // Mettre à jour le statut du profil
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

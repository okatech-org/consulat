'use server';

import { getTranslations } from 'next-intl/server';
import { checkAuth } from '@/lib/auth/action';
import {
  ConsularService,
  DocumentStatus,
  DocumentType,
  Prisma,
  Profile,
  RequestStatus,
  ServiceCategory,
} from '@prisma/client';
import { db } from '@/lib/prisma';

import { processFileData } from '@/actions/utils';
import {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
  CreateProfileInput,
} from '@/schemas/registration';
import { deleteFiles } from '@/actions/uploads';
import { calculateProfileCompletion, tryCatch } from '@/lib/utils';
import { assignAgentToRequest } from '@/actions/agents';
import { CountryCode } from '@/lib/autocomplete-datas';
import { FullProfileInclude } from '@/types';
import {
  NameSchema,
  CountryCodeSchema,
  EmailSchema,
  PhoneValueSchema,
  DateSchema,
} from '@/schemas/inputs';
import { z } from 'zod';
import { isUserExists } from './auth';

const CreateProfileAsyncSchema = z
  .object({
    firstName: NameSchema,
    lastName: NameSchema,
    residenceCountyCode: CountryCodeSchema,
    email: EmailSchema.optional(),
    phone: PhoneValueSchema.refine(async (phone) => {
      const existingPhone = await db.phone.findUnique({
        where: {
          number: phone.number,
        },
        include: {
          user: true,
        },
      });

      return !existingPhone?.user;
    }),
    emailVerified: DateSchema.optional(),
    phoneVerified: DateSchema.optional(),
    otp: z.string().length(6, { message: 'messages.errors.otp_length' }).optional(),
  })
  .superRefine(async (data) => {
    const [existingUser, existingPhone] = await Promise.all([
      isUserExists(undefined, data.email, data.phone),
      isUserExists(undefined, undefined, data.phone),
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
    phone,
    emailVerified,
    phoneVerified,
  } = await CreateProfileAsyncSchema.parseAsync(input);

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        emailVerified,
        phoneVerified,
        phone: {
          create: phone,
        },
        country: {
          connect: {
            code: residenceCountyCode,
          },
        },
      },
    });

    if (!user) {
      throw new Error('user_creation_failed');
    }

    await tx.profile.create({
      data: {
        firstName,
        lastName,
        residenceCountyCode,
        email,
        ...(user.phoneId && {
          phone: {
            connect: {
              id: user.phoneId,
            },
          },
        }),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  });
}

export async function postProfile(
  formData: FormData,
  countryCode: CountryCode,
): Promise<string> {
  const uploadedFiles: { key: string; url: string }[] = [];

  try {
    const currentUser = await checkAuth();

    // Récupérer et parser les données du formulaire
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { identityPictureFile, ...basicInfo } = JSON.parse(
      formData.get('basicInfo') as string,
    ) as BasicInfoFormData;
    const contactInfo = JSON.parse(
      formData.get('contactInfo') as string,
    ) as ContactInfoFormData;
    const familyInfo = JSON.parse(
      formData.get('familyInfo') as string,
    ) as FamilyInfoFormData;
    const professionalInfo = JSON.parse(
      formData.get('professionalInfo') as string,
    ) as ProfessionalInfoFormData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filesPromises: Array<Promise<any>> = [];

    const identityPictureFileItem = formData.get('identityPictureFile') as File;

    if (identityPictureFileItem) {
      const formData = new FormData();
      formData.append('files', identityPictureFileItem);
      filesPromises.push(processFileData(formData));
    }

    const passportFile = formData.get('passportFile') as File;

    if (passportFile) {
      const formData = new FormData();
      formData.append('files', passportFile);
      filesPromises.push(processFileData(formData));
    }

    const birthCertificateFile = formData.get('birthCertificateFile') as File;

    if (birthCertificateFile) {
      const formData = new FormData();
      formData.append('files', birthCertificateFile);
      filesPromises.push(processFileData(formData));
    }

    const residencePermitFile = formData.get('residencePermitFile') as File;

    if (residencePermitFile) {
      const formData = new FormData();
      formData.append('files', residencePermitFile);
      filesPromises.push(processFileData(formData));
    }

    const addressProofFile = formData.get('addressProofFile') as File;

    if (addressProofFile) {
      const formData = new FormData();
      formData.append('files', addressProofFile);
      filesPromises.push(processFileData(formData));
    }

    // Traiter les fichiers uploadés
    const [identityPicture, passport, birthCertificate, residencePermit, addressProof] =
      await Promise.all(filesPromises);

    // Garder une trace des fichiers uploadés pour pouvoir les supprimer en cas d'erreur
    if (identityPicture) uploadedFiles.push(identityPicture);
    if (passport) uploadedFiles.push(passport);
    if (birthCertificate) uploadedFiles.push(birthCertificate);
    if (residencePermit) uploadedFiles.push(residencePermit);
    if (addressProof) uploadedFiles.push(addressProof);

    // Créer le profil avec une transaction
    const profile = await db.$transaction(async (tx) => {
      // 1. Créer le profil avec toutes ses relations

      const now = new Date();
      const inThreeMonths = new Date(now.setMonth(now.getMonth() + 3));
      const inOneYear = new Date(now.setFullYear(now.getFullYear() + 1));
      const inFiveYears = new Date(now.setFullYear(now.getFullYear() + 5));

      const [address, existingPhone] = await Promise.all([
        await tx.address.create({
          data: contactInfo.address,
        }),
        await tx.phone.findFirst({
          where: {
            number: contactInfo.phone?.number,
          },
        }),
      ]);

      const phone = existingPhone
        ? existingPhone
        : await tx.phone.create({
            // @ts-expect-error - phone is not defined in the schema
            data: contactInfo.phone,
          });

      const profile = await tx.profile.create({
        data: {
          residenceCountyCode: countryCode,
          user: {
            connect: {
              id: currentUser.user.id,
            },
          },
          ...basicInfo,
          ...familyInfo,
          ...professionalInfo,
          birthDate: new Date(basicInfo.birthDate),
          passportIssueDate: new Date(basicInfo.passportIssueDate),
          passportExpiryDate: new Date(basicInfo.passportExpiryDate),
          phoneId: phone.id,
          email: contactInfo.email || null,
          residentContact: {
            create: {
              firstName: contactInfo.residentContact.firstName,
              lastName: contactInfo.residentContact.lastName,
              relationship: contactInfo.residentContact.relationship,
              ...(contactInfo.residentContact.phone && {
                phone: {
                  create: contactInfo.residentContact.phone,
                },
              }),
              ...(contactInfo.residentContact.address && {
                address: {
                  create: contactInfo.residentContact.address,
                },
              }),
            },
          },
          ...(contactInfo.homeLandContact && {
            homeLandContact: {
              create: {
                firstName: contactInfo.homeLandContact.firstName,
                lastName: contactInfo.homeLandContact.lastName,
                relationship: contactInfo.homeLandContact.relationship,
                ...(contactInfo.homeLandContact.phone && {
                  phone: {
                    create: contactInfo.homeLandContact.phone,
                  },
                }),
                ...(contactInfo.homeLandContact.address && {
                  address: {
                    create: contactInfo.homeLandContact.address,
                  },
                }),
              },
            },
          }),

          // Relations
          addressId: address.id,
        },
      });

      await tx.user.update({
        where: { id: currentUser.user.id },
        data: {
          country: {
            connect: {
              code: countryCode,
            },
          },
        },
      });

      const createdDoc = [];

      // 2. Créer les components associés
      if (passport) {
        const passportDoc = await tx.userDocument.create({
          data: {
            type: DocumentType.PASSPORT,
            fileUrl: passport.url,
            userId: currentUser.user.id,
            issuedAt: new Date(basicInfo.passportIssueDate),
            expiresAt: new Date(basicInfo.passportExpiryDate ?? inFiveYears),
            metadata: {
              documentNumber: basicInfo.passportNumber,
              issuingAuthority: basicInfo.passportIssueAuthority,
            },
          },
        });

        await tx.profile.update({
          where: { id: profile.id },
          data: {
            passport: {
              connect: {
                id: passportDoc.id,
              },
            },
          },
        });

        createdDoc.push(passportDoc);
        // Mettre à jour le profil avec le document du passeport
      }

      // Créer les autres components si présents
      if (birthCertificate) {
        // Mettre à jour le profil avec le document du certificat de naissance
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            birthCertificate: {
              create: {
                type: DocumentType.BIRTH_CERTIFICATE,
                fileUrl: birthCertificate.url,
                userId: currentUser.user.id,
              },
            },
          },
        });
      }

      if (identityPicture) {
        // Mettre à jour le profil avec le document de la photo d'identité
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            identityPicture: {
              create: {
                type: DocumentType.IDENTITY_PHOTO,
                fileUrl: identityPicture.url,
                userId: currentUser.user.id,
              },
            },
          },
        });
      }

      if (residencePermit) {
        // Mettre à jour le profil avec le document du titre de séjour
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            residencePermit: {
              create: {
                type: DocumentType.RESIDENCE_PERMIT,
                fileUrl: residencePermit.url,
                issuedAt: now,
                expiresAt: inOneYear,
                userId: currentUser.user.id,
              },
            },
          },
        });
      }

      if (addressProof) {
        // Mettre à jour le profil avec le document de justificatif de domicile
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            addressProof: {
              create: {
                type: DocumentType.PROOF_OF_ADDRESS,
                fileUrl: addressProof.url,
                issuedAt: now,
                expiresAt: inThreeMonths,
                userId: currentUser.user.id,
              },
            },
          },
        });
      }

      const currentProfile = await db.profile.findUnique({
        where: { id: profile.id },
        ...FullProfileInclude,
      });

      const profileCompletion = await calculateProfileCompletion(currentProfile);

      if (profileCompletion === 100 && currentUser.user.countryCode) {
        const registrationService = await getRegistrationServiceForUser(
          currentUser.user.countryCode,
        );

        if (registrationService && registrationService.organizationId) {
          await tx.serviceRequest.create({
            data: {
              submittedById: currentUser.user.id,
              serviceId: registrationService.id,
              countryCode: currentUser.user.countryCode,
              serviceCategory: ServiceCategory.REGISTRATION,
              organizationId: registrationService.organizationId,
            },
          });

          await tx.profile.update({
            where: { id: profile.id },
            data: {
              status: RequestStatus.SUBMITTED,
              submittedAt: new Date(),
            },
          });
        }
      }

      return profile;
    });

    return profile.id;
  } catch (error) {
    if (uploadedFiles.length > 0) {
      try {
        await deleteFiles(uploadedFiles.map((file) => file.key));
      } catch (deleteError) {
        console.error('Error deleting files:', deleteError);
      }
    }

    throw error;
  }
}

type UpdateProfileSection = {
  basicInfo?: BasicInfoFormData;
  contactInfo?: ContactInfoFormData;
  familyInfo?: FamilyInfoFormData;
  professionalInfo?: ProfessionalInfoFormData;
  documents?: DocumentsFormData;
};

export async function updateProfile(
  formData: FormData,
  section: keyof UpdateProfileSection,
): Promise<Profile> {
  const t = await getTranslations('messages.profile.errors');
  const { user } = await checkAuth();

  if (!user || !user?.id) {
    throw new Error(t('unauthorized'));
  }

  const existingProfile = await db.profile.findUnique({
    where: { userId: user.id },
    include: {
      address: true,
      homeLandContact: true,
      residentContact: true,
    },
  });

  if (!existingProfile) {
    throw new Error(t('profile_not_found'));
  }

  // Récupérer les données JSON de la section
  const sectionData = formData.get(section);
  if (!sectionData) {
    throw new Error(t('invalid_data'));
  }

  const data = JSON.parse(sectionData as string);

  const {
    passportIssueDate,
    passportExpiryDate,
    phone,
    address,
    addressInGabon,
    residentContact,
    homeLandContact,
    ...remain
  } = data;

  // Préparer les données de mise à jour en fonction de la section
  const updateData: Prisma.ProfileUpdateInput = {
    ...remain,
    ...(passportIssueDate && { passportIssueDate: new Date(passportIssueDate) }),
    ...(passportExpiryDate && { passportExpiryDate: new Date(passportExpiryDate) }),
    ...(phone && {
      phone: {
        upsert: {
          create: {
            number: phone.number,
            countryCode: phone.countryCode,
          },
          update: {
            number: phone.number,
            countryCode: phone.countryCode,
          },
        },
      },
    }),
    ...(address && {
      address: {
        upsert: {
          create: address,
          update: address,
        },
      },
    }),
    ...(addressInGabon && {
      addressInGabon: {
        upsert: {
          create: addressInGabon,
          update: addressInGabon,
        },
      },
    }),
    ...(residentContact && {
      residentContact: {
        upsert: {
          create: {
            firstName: residentContact.firstName,
            lastName: residentContact.lastName,
            relationship: residentContact.relationship,
            phone: {
              upsert: {
                create: {
                  number: residentContact.phone.number,
                  countryCode: residentContact.phone.countryCode,
                },
                update: {
                  number: residentContact.phone.number,
                  countryCode: residentContact.phone.countryCode,
                },
              },
            },
          },
          update: {
            firstName: residentContact.firstName,
            lastName: residentContact.lastName,
            relationship: residentContact.relationship,
            phone: {
              update: {
                number: residentContact.phone.number,
                countryCode: residentContact.phone.countryCode,
              },
            },
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
            phone: {
              upsert: {
                create: {
                  number: homeLandContact.phone.number,
                  countryCode: homeLandContact.phone.countryCode,
                },
                update: {
                  number: homeLandContact.phone.number,
                  countryCode: homeLandContact.phone.countryCode,
                },
              },
            },
          },
          update: {
            firstName: homeLandContact.firstName,
            lastName: homeLandContact.lastName,
            relationship: homeLandContact.relationship,
            phone: {
              update: {
                number: homeLandContact.phone.number,
                countryCode: homeLandContact.phone.countryCode,
              },
            },
          },
        },
      },
    }),
  };

  const documents = {
    passportFile: formData.get('passportFile') as File,
    birthCertificateFile: formData.get('birthCertificateFile') as File,
    residencePermitFile: formData.get('residencePermitFile') as File,
    addressProofFile: formData.get('addressProofFile') as File,
  };

  // Traiter chaque document
  const uploadPromises = Object.entries(documents)
    .filter(([, file]) => file)
    .map(async ([key, file]) => {
      const formDataForUpload = new FormData();
      formDataForUpload.append('files', file);
      const uploadedFile = await processFileData(formDataForUpload);
      return { key, url: uploadedFile?.url };
    });

  const uploadedFiles = await Promise.all(uploadPromises);

  uploadedFiles.forEach(({ key, url }) => {
    if (url) {
      switch (key) {
        case 'passportFile':
          updateData.passport = {
            create: {
              type: DocumentType.PASSPORT,
              fileUrl: url,
              status: DocumentStatus.PENDING,
            },
          };
          break;
        case 'birthCertificateFile':
          updateData.birthCertificate = {
            create: {
              type: DocumentType.BIRTH_CERTIFICATE,
              fileUrl: url,
              status: DocumentStatus.PENDING,
            },
          };
          break;
        case 'residencePermitFile':
          updateData.residencePermit = {
            create: {
              type: DocumentType.RESIDENCE_PERMIT,
              fileUrl: url,
              status: DocumentStatus.PENDING,
            },
          };
          break;
        case 'addressProofFile':
          updateData.addressProof = {
            create: {
              type: DocumentType.PROOF_OF_ADDRESS,
              fileUrl: url,
              status: DocumentStatus.PENDING,
            },
          };
          break;
      }
    }
  });

  // Mettre à jour le profil
  const updatedProfile = await db.profile.update({
    where: { id: existingProfile.id },
    data: { ...updateData, status: 'DRAFT' },
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
      profile.phone,
      profile.email,
      profile.residentContact,
      profile.homeLandContact,
    );
  }

  if (requiredFields.some((field) => !field)) {
    throw new Error('incomplete_profile');
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

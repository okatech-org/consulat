'use server';

import { getTranslations } from 'next-intl/server';
import { ActionResult, checkAuth } from '@/lib/auth/action';
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
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { getCurrentUser } from '@/actions/user';
import { processFileData } from '@/actions/utils';
import {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import { deleteFiles } from '@/actions/uploads';
import { calculateProfileCompletion, extractNumber } from '@/lib/utils';
import { assignAgentToRequest } from '@/actions/agents';
import { CountryCode } from '@/lib/autocomplete-datas';

export async function postProfile(formData: FormData): Promise<string> {
  const uploadedFiles: { key: string; url: string }[] = [];

  try {
    const currentUser = await checkAuth();

    // Récupérer et parser les données du formulaire
    const basicInfo = JSON.parse(formData.get('basicInfo') as string);
    const contactInfo = JSON.parse(formData.get('contactInfo') as string);
    const familyInfo = JSON.parse(formData.get('familyInfo') as string);
    const professionalInfo = JSON.parse(formData.get('professionalInfo') as string);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filesPromises: Array<Promise<any>> = [];

    const identityPictureFile = formData.get('identityPictureFile') as File;

    if (identityPictureFile) {
      const formData = new FormData();
      formData.append('files', identityPictureFile);
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
            number: contactInfo.phone.number,
          },
        }),
      ]);

      const phone = existingPhone
        ? existingPhone
        : await tx.phone.create({
            data: contactInfo.phone,
          });

      const profile = await tx.profile.create({
        data: {
          userId: currentUser.user.id,
          // Informations de base
          firstName: basicInfo.firstName,
          lastName: basicInfo.lastName,
          gender: basicInfo.gender,
          birthDate: basicInfo.birthDate,
          birthPlace: basicInfo.birthPlace,
          birthCountry: basicInfo.birthCountry,
          nationality: basicInfo.nationality,
          acquisitionMode: basicInfo.acquisitionMode,

          // Informations passeport
          passportNumber: basicInfo.passportNumber,
          passportIssueDate: new Date(basicInfo.passportIssueDate),
          passportExpiryDate: new Date(basicInfo.passportExpiryDate),
          passportIssueAuthority: basicInfo.passportIssueAuthority,

          // Informations familiales
          maritalStatus: familyInfo.maritalStatus,
          fatherFullName: familyInfo.fatherFullName,
          motherFullName: familyInfo.motherFullName,
          spouseFullName: familyInfo.spouseFullName || null,

          // Contact
          phoneId: phone.id,
          email: contactInfo.email || null,

          // Informations professionnelles
          workStatus: professionalInfo.workStatus,
          profession: professionalInfo.profession || null,
          employer: professionalInfo.employer || null,
          employerAddress: professionalInfo.employerAddress || null,
          activityInGabon: professionalInfo.lastActivityGabon,

          // Relations
          addressId: address.id,
          addressInGabon: contactInfo.addressInGabon
            ? {
                create: contactInfo.addressInGabon,
              }
            : undefined,
          emergencyContact: familyInfo.emergencyContact
            ? {
                create: {
                  fullName: familyInfo.emergencyContact.fullName,
                  relationship: familyInfo.emergencyContact.relationship,
                  phone: {
                    connectOrCreate: {
                      where: {
                        number: extractNumber(familyInfo.emergencyContact.phone).number,
                      },
                      create: extractNumber(familyInfo.emergencyContact.phone),
                    },
                  },
                },
              }
            : undefined,
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

      return profile;
    });

    const profileCompletion = await calculateProfileCompletion(profile);

    if (profileCompletion === 100 && currentUser.user.countryCode) {
      const registrationService = await getRegistrationServiceForUser(
        currentUser.user.countryCode,
      );

      if (registrationService) {
        await db.serviceRequest.create({
          data: {
            submittedById: currentUser.user.id,
            serviceId: registrationService.id,
          },
        });

        await db.profile.update({
          where: { id: profile.id },
          data: {
            status: RequestStatus.SUBMITTED,
            submittedAt: new Date(),
          },
        });
      }
    }

    // Revalider les pages
    revalidatePath(ROUTES.user.base);

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
): Promise<ActionResult<Profile>> {
  const t = await getTranslations('messages.profile.errors');
  const user = await getCurrentUser();

  if (!user || !user?.id) {
    return { error: t('unauthorized') };
  }

  console.log('section', section, formData);

  try {
    // Récupérer le profil existant
    const existingProfile = await db.profile.findUnique({
      where: { userId: user.id },
      include: {
        address: true,
        addressInGabon: true,
        emergencyContact: true,
      },
    });

    if (!existingProfile) {
      return { error: t('profile_not_found') };
    }

    // Récupérer les données JSON de la section
    const sectionData = formData.get(section);
    if (!sectionData) {
      return { error: t('invalid_data') };
    }

    const data = JSON.parse(sectionData as string);

    const {
      passportIssueDate,
      passportExpiryDate,
      phone,
      address,
      addressInGabon,
      emergencyContact,
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
      ...(emergencyContact && {
        emergencyContact: {
          upsert: {
            create: {
              fullName: emergencyContact.fullName,
              relationship: emergencyContact.relationship,
              phone: {
                upsert: {
                  create: {
                    number: emergencyContact.phone.number,
                    countryCode: emergencyContact.phone.countryCode,
                  },
                  update: {
                    number: emergencyContact.phone.number,
                    countryCode: emergencyContact.phone.countryCode,
                  },
                },
              },
            },
            update: {
              fullName: emergencyContact.fullName,
              relationship: emergencyContact.relationship,
              phone: {
                update: {
                  number: emergencyContact.phone.number,
                  countryCode: emergencyContact.phone.countryCode,
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
      include: {
        address: true,
        addressInGabon: true,
        emergencyContact: true,
      },
    });

    return { data: updatedProfile };
  } catch (error) {
    console.error('Update components error:', error);
    return {
      error: error instanceof Error ? error.message : 'messages.errors.unknown_error',
    };
  }
}

export async function submitProfileForValidation(
  profileId: string,
  isChild: boolean = false,
): Promise<ActionResult<Profile>> {
  const t = await getTranslations('messages.profile');
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.countryCode) {
    return { error: 'messages.errors.unauthorized' };
  }

  try {
    const registrationService = await getRegistrationServiceForUser(
      currentUser.countryCode,
    );

    if (!registrationService) {
      return { error: 'messages.errors.service_not_found' };
    }

    // Vérifier que le profil existe et est complet
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: {
        passport: true,
        birthCertificate: true,
        residencePermit: true,
        addressProof: true,
        address: true,
        emergencyContact: true,
        phone: true,
      },
    });

    if (!profile) {
      return { error: t('errors.profile_not_found') };
    }

    // Vérifier que tous les components requis sont présents
    const requiredDocuments = [profile.birthCertificate];

    if (!isChild) {
      requiredDocuments.push(profile.passport);
      requiredDocuments.push(profile.addressProof);
    }

    if (requiredDocuments.some((doc) => !doc)) {
      return { error: t('errors.missing_documents') };
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
        profile.emergencyContact,
      );
    }

    if (requiredFields.some((field) => !field)) {
      return { error: t('errors.incomplete_profile') };
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
      await assignAgentToRequest(
        serviceRequest.id,
        registrationService.organizationId,
        currentUser.countryCode as CountryCode,
        db,
      );
    }

    // Mettre à jour le statut du profil
    const updatedProfile = await db.profile.update({
      where: { id: profileId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return { data: updatedProfile };
  } catch (error) {
    console.error('Submit components error:', error);
    return {
      error: error instanceof Error ? error.message : 'messages.errors.unknown_error',
    };
  }
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

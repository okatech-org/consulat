'use server';

import { DocumentType, type ParentalAuthority, Prisma } from '@prisma/client';
import type { LinkFormData } from '@/schemas/child-registration';
import { checkAuth } from '@/lib/auth/action';
import { processFileData } from './utils';
import { deleteFiles } from './uploads';
import { db } from '@/server/db';
import type { BasicInfoFormData } from '@/schemas/registration';
import {
  type FullParentalAuthority,
  FullParentalAuthorityInclude,
} from '@/types/parental-authority';
import { getTranslations } from 'next-intl/server';
import type { FullProfileUpdateFormData } from '@/schemas/registration';

export async function createChildProfile(data: LinkFormData): Promise<{ id: string }> {
  try {
    const currentUser = await checkAuth();

    // Create a basic profile first
    const profile = await db.profile.create({
      data: {
        residenceCountyCode: currentUser.user.countryCode ?? '',
        category: 'MINOR',
      },
    });

    // Create the parental authority link
    if (currentUser.user) {
      await db.parentalAuthority.create({
        data: {
          profileId: profile.id,
          parentUserId: currentUser.user.id,
          role: data.parentRole,
        },
      });

      // Handle other parent if needed
      if (data.hasOtherParent && data.otherParentEmail && data.otherParentRole) {
        const otherParentReq = [];

        if (data.otherParentEmail) {
          otherParentReq.push({
            email: data.otherParentEmail,
          });
        }

        if (data.otherParentPhone) {
          // Handle phone as a string for the query
          otherParentReq.push({
            phoneNumber: data.otherParentPhone,
          });
        }

        const otherParentUser = await db.user.findFirst({
          where: {
            OR: otherParentReq,
          },
        });

        if (otherParentUser) {
          await db.parentalAuthority.create({
            data: {
              profileId: profile.id,
              parentUserId: otherParentUser.id,
              role: data.otherParentRole,
            },
          });
        }
      }
    }

    return { id: profile.id };
  } catch (error) {
    console.error('Error creating child profile:', error);
    throw error;
  }
}

export async function updateChildProfile(
  profileId: string,
  data: Partial<FullProfileUpdateFormData & Partial<LinkFormData>>,
): Promise<{ id: string }> {
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

  // Extract date fields for proper formatting
  const { passportIssueDate, passportExpiryDate, birthDate, ...remain } = data;

  // Only update fields that are provided
  const updateData: Prisma.ProfileUpdateInput = {
    ...(remain.firstName && { firstName: remain.firstName }),
    ...(remain.lastName && { lastName: remain.lastName }),
    ...(remain.gender && { gender: remain.gender }),
    ...(remain.birthPlace && { birthPlace: remain.birthPlace }),
    ...(remain.birthCountry && { birthCountry: remain.birthCountry }),
    ...(remain.nationality && { nationality: remain.nationality }),
    ...(remain.acquisitionMode && { acquisitionMode: remain.acquisitionMode }),
    ...(birthDate && { birthDate: new Date(birthDate) }),
    ...(passportIssueDate && { passportIssueDate: new Date(passportIssueDate) }),
    ...(passportExpiryDate && { passportExpiryDate: new Date(passportExpiryDate) }),
  };

  // Update the profile
  const updatedProfile = await db.profile.update({
    where: { id: profileId },
    data: updateData,
  });

  return { id: updatedProfile.id };
}

export async function createChildProfileWithFiles(formData: FormData): Promise<string> {
  const uploadedFiles: { key: string; url: string }[] = [];

  try {
    const currentUser = await checkAuth();

    // Récupérer et parser les données du formulaire
    const basicInfo = JSON.parse(
      formData.get('basicInfo') as string,
    ) as BasicInfoFormData;
    const linkInfo = JSON.parse(formData.get('linkInfo') as string) as LinkFormData;

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

      const profile = await tx.profile.create({
        data: {
          residenceCountyCode: currentUser.user.countryCode ?? '',
          category: 'MINOR',
          // Informations de base
          firstName: basicInfo.firstName,
          lastName: basicInfo.lastName,
          gender: basicInfo.gender,
          birthDate: basicInfo.birthDate,
          birthPlace: basicInfo.birthPlace,
          birthCountry: basicInfo.birthCountry,
          nationality: basicInfo.nationality ?? basicInfo.birthCountry,
          acquisitionMode: basicInfo.acquisitionMode,

          // Informations passeport
          ...(basicInfo.passportNumber && {
            passportNumber: basicInfo.passportNumber,
          }),
          ...(basicInfo.passportIssueDate && {
            passportIssueDate: new Date(basicInfo.passportIssueDate),
          }),
          ...(basicInfo.passportExpiryDate && {
            passportExpiryDate: new Date(basicInfo.passportExpiryDate),
          }),
          ...(basicInfo.passportIssueAuthority && {
            passportIssueAuthority: basicInfo.passportIssueAuthority,
          }),
        },
      });

      const createdDoc = [];

      // 2. Créer les components associés
      if (passport) {
        const passportDoc = await tx.userDocument.create({
          data: {
            type: DocumentType.PASSPORT,
            fileUrl: passport.url,
            fileType: passport.type,
            userId: currentUser.user.id,
            ...(basicInfo.passportIssueDate && {
              issuedAt: new Date(basicInfo.passportIssueDate),
            }),
            ...(basicInfo.passportExpiryDate && {
              expiresAt: new Date(basicInfo.passportExpiryDate),
            }),
            metadata: {
              ...(basicInfo.passportNumber && {
                documentNumber: basicInfo.passportNumber,
              }),
              ...(basicInfo.passportIssueAuthority && {
                issuingAuthority: basicInfo.passportIssueAuthority,
              }),
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
                fileType: birthCertificate.type,
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
                fileType: identityPicture.type,
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
                fileType: residencePermit.type,
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
                fileType: addressProof.type,
              },
            },
          },
        });
      }

      if (currentUser.user) {
        const parentUsers = [
          {
            id: currentUser.user.id,
            role: linkInfo.parentRole,
          },
        ];

        if (linkInfo?.hasOtherParent) {
          const otherParentReq = [];

          if (linkInfo.otherParentEmail) {
            otherParentReq.push({
              email: linkInfo.otherParentEmail,
            });
          }

          if (linkInfo.otherParentPhone) {
            otherParentReq.push({
              phoneNumber: linkInfo.otherParentPhone,
            });
          }

          const otherParentUser = await db.user.findFirst({
            where: {
              OR: otherParentReq,
            },
          });

          if (otherParentUser && linkInfo.otherParentRole) {
            parentUsers.push({
              id: otherParentUser.id,
              role: linkInfo.otherParentRole,
            });
          }
        }

        await tx.parentalAuthority.createMany({
          data: parentUsers.map((user) => ({
            profileId: profile.id,
            parentUserId: user.id,
            role: user.role,
          })),
        });
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

type UserWithChildren = ParentalAuthority & {
  childAuthorities: FullParentalAuthority[];
};

export async function getUserWithChildren(userId: string): Promise<UserWithChildren> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      childAuthorities: {
        include: FullParentalAuthorityInclude,
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user as unknown as UserWithChildren;
}

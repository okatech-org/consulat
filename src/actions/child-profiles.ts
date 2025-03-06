'use server';

import { DocumentType, ParentalAuthority } from '@prisma/client';
import { LinkFormData } from '@/schemas/child-registration';
import { checkAuth } from '@/lib/auth/action';
import { processFileData } from './utils';
import { deleteFiles } from './uploads';
import { db } from '@/lib/prisma';
import { BasicInfoFormData } from '@/schemas/registration';
import {
  FullParentalAuthority,
  FullParentalAuthorityInclude,
} from '@/types/parental-authority';

export async function createChildProfile(formData: FormData): Promise<string> {
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
          category: 'MINOR',
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

          ...(currentUser.user.phoneId && {
            emergencyContact: {
              create: {
                fullName: `${currentUser.user.firstName} ${currentUser.user.lastName}`,
                relationship: linkInfo.parentRole,
                phone: {
                  connect: {
                    id: currentUser.user.phoneId,
                  },
                },
              },
            },
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
              phone: {
                number: linkInfo.otherParentPhone.number,
                countryCode: linkInfo.otherParentPhone.countryCode,
              },
            });
          }

          const otherParentUser = await db.user.findFirst({
            where: {
              OR: otherParentReq,
            },
            include: {
              phone: true,
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

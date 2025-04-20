'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteChildProfile(
  profileId: string,
): Promise<{ success: boolean }> {
  // Get the profile with all its relations
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: {
      status: true,
      parentAuthorities: true,
      requestsFor: true,
      user: true,
      residentContact: true,
      homeLandContact: true,
      // Document relations with their IDs
      identityPicture: {
        select: { id: true },
      },
      passport: {
        select: { id: true },
      },
      birthCertificate: {
        select: { id: true },
      },
      residencePermit: {
        select: { id: true },
      },
      addressProof: {
        select: { id: true },
      },
    },
  });

  // Only allow deletion of profiles in DRAFT status
  if (!profile || profile.status !== 'DRAFT') {
    throw new Error('Only draft profiles can be deleted');
  }

  // Use a transaction to ensure all related records are deleted
  await db.$transaction(async (tx) => {
    // 1. Delete all parental authorities
    if (profile.parentAuthorities.length > 0) {
      await tx.parentalAuthority.deleteMany({
        where: { profileId },
      });
    }

    // 2. Delete any service requests
    if (profile.requestsFor.length > 0) {
      await tx.serviceRequest.deleteMany({
        where: { requestedForId: profileId },
      });
    }

    // 3. Delete emergency contacts
    if (profile.residentContact) {
      await tx.emergencyContact.delete({
        where: { residentProfileId: profileId },
      });
    }
    if (profile.homeLandContact) {
      await tx.emergencyContact.delete({
        where: { homeLandProfileId: profileId },
      });
    }

    // 4. Delete associated documents
    const documentIds = [
      profile.identityPicture?.id,
      profile.passport?.id,
      profile.birthCertificate?.id,
      profile.residencePermit?.id,
      profile.addressProof?.id,
    ].filter((id): id is string => id !== undefined && id !== null);

    if (documentIds.length > 0) {
      await tx.userDocument.deleteMany({
        where: {
          id: {
            in: documentIds,
          },
        },
      });
    }

    // 5. If there's an associated user, delete the user relation first
    if (profile.user) {
      await tx.user.update({
        where: { profileId },
        data: { profileId: null },
      });
    }

    // 6. Finally delete the profile
    await tx.profile.delete({
      where: { id: profileId },
    });
  });

  // Revalidate the my-space/children page
  revalidatePath('/my-space/children');

  return { success: true };
}

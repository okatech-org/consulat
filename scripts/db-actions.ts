import { PrismaClient, type User } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  console.log('🚀 Starting database actions...');

  // Migration des données utilisateur
  const users = await prisma.user.findMany();

  console.log('🎉 Database actions completed!');
}

async function updateUsersWithClerkId(users: User[]) {
  try {
    users.forEach(async (user, index) => {
      if (!user.email) {
        console.log(`❌ User ${user.id} has no email ${index + 1} of ${users.length}`);
        return;
      }

      const clerkUser = await clerkClient.users.getUserList({
        emailAddress: [user.email as string],
      });

      if (user.clerkId && user.clerkId !== '' && user.clerkId !== 'undefined') {
        console.log(
          `✅ User ${user.id} already has a Clerk user: ${user.clerkId} ${index + 1} of ${users.length}`,
        );
        return;
      }

      if (clerkUser.data.length > 0) {
        const userData = clerkUser.data[0];

        if (!userData) {
          console.log(
            `❌ Clerk user not found for user ${user.id} ${index + 1} of ${users.length}`,
          );
          return;
        }

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { clerkId: userData.id },
          });
        } catch (error) {
          console.error(
            `❌ Error updating user ${user.id} ${index + 1} of ${users.length}:`,
            error,
          );
        }

        console.log(
          `✅ Clerk user ${userData.id} has been updated for user ${user.id} ${index + 1} of ${users.length}`,
        );
      }
    });
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function updateClerkUsersWithDatabaseUsers(users: User[]) {
  console.log('🔄 Synchronisation des métadonnées avec Clerk...');

  for (const user of users) {
    if (!user.clerkId) {
      console.log(`❌ User ${user.id} has no clerkId`);
      continue;
    }

    try {
      // add profileId, roles, role, countryCode, assignedOrganizationId, organizationId
      await clerkClient.users.updateUser(user.clerkId, {
        publicMetadata: {
          profileId: user.profileId,
          roles: user.roles,
          countryCode: user.countryCode,
          assignedOrganizationId: user.assignedOrganizationId,
          organizationId: user.organizationId,
        },
      });

      console.log(`✅ Métadonnées mises à jour pour ${user.clerkId}`);
    } catch (error) {
      console.error(
        `❌ Erreur lors de la mise à jour des métadonnées pour ${user.clerkId}:`,
        error,
      );
    }
  }
}

async function normalizeUserData(users: User[]) {
  const promises = users.map(async (user, index) => {
    console.log(
      `🔄 Normalizing user ${user.id} ${user.phoneNumber} ${user.email} ${index + 1} of ${users.length}`,
    );

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(user.phoneNumber && {
            phoneNumber: normalizePhoneNumber(user.phoneNumber),
          }),
          ...(user.email && { email: normalizeEmail(user.email) }),
        },
      });

      console.log(
        `✅ User ${user.id} normalized: ${updatedUser.phoneNumber} ${updatedUser.email} ${index + 1} of ${users.length}`,
      );
    } catch (error) {
      console.error(
        `❌ Error normalizing user ${user.id} ${user.phoneNumber} ${user.email} ${index + 1} of ${users.length}:`,
        error,
      );
    }
  });

  return Promise.all(promises);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Convertit un numéro de téléphone du format +33-612250393 vers +33612250393
 */
function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return phoneNumber;

  // Supprimer tous les espaces et tirets
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Vérifier que le numéro commence par +
  if (!cleaned.startsWith('+')) {
    console.warn(`Numéro invalide (ne commence pas par +): ${phoneNumber}`);
    return phoneNumber;
  }

  return cleaned;
}

// Fonction pour normaliser les emails
function normalizeEmail(email: string): string {
  if (!email) return '';

  // Convertir en minuscules et supprimer les espaces
  return email.toLowerCase().trim();
}

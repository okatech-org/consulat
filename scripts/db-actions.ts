import { PrismaClient, type User } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function testClerkConnection() {
  console.log('🧪 Test de connexion à Clerk...');

  try {
    // Test de connexion à Clerk
    const users = await clerkClient.users.getUserList({ limit: 1 });
    console.log('✅ Connexion à Clerk réussie');

    // Test de connexion à la base de données
    const userCount = await prisma.user.count();
    console.log(`✅ Connexion à la base de données réussie (${userCount} utilisateurs)`);

    // Vérifier les utilisateurs avec Clerk ID
    const usersWithClerkId = await prisma.user.count({
      where: { clerkId: { not: null } },
    });
    console.log(`✅ ${usersWithClerkId} utilisateurs ont un Clerk ID`);

    // Vérifier les utilisateurs sans Clerk ID
    const usersWithoutClerkId = await prisma.user.count({
      where: { clerkId: null },
    });
    console.log(`⚠️  ${usersWithoutClerkId} utilisateurs n'ont pas de Clerk ID`);
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Début de la migration Clerk...');

  // Test de connexion
  await testClerkConnection();

  // Migration des données utilisateur
  const users = await prisma.user.findMany();
  await updateUsersWithClerkId(users);

  // Synchronisation des métadonnées
  await updateClerkUsersWithDatabaseUsers(users);

  console.log('🎉 Migration terminée!');
}

async function updateUsersWithClerkId(users: User[]) {
  try {
    users.forEach(async (user, index) => {
      if (!user.email) {
        console.log(`❌ User ${user.id} has no email`);
        return;
      }

      const clerkUser = await clerkClient.users.getUserList({
        emailAddress: [user.email as string],
      });

      if (user.clerkId && user.clerkId !== '' && user.clerkId !== 'undefined') {
        console.log(`✅ User ${user.id} already has a Clerk user: ${user.clerkId}`);
        return;
      }

      if (clerkUser.data.length > 0) {
        const userData = clerkUser.data[0];

        if (!userData) {
          console.log(`❌ Clerk user not found for user ${user.id}`);
          return;
        }

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { clerkId: userData.id },
          });
        } catch (error) {
          console.error(`❌ Error updating user ${user.id}:`, error);
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
          role: user.role,
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

async function rollbackClerkMigration() {
  console.log('🔄 Début du rollback de la migration Clerk...');

  try {
    // Option 1: Supprimer tous les utilisateurs Clerk
    console.log('1. Suppression des utilisateurs Clerk...');
    const users = await clerkClient.users.getUserList();

    for (const user of users) {
      try {
        await clerkClient.users.deleteUser(user.id);
        console.log(`✅ Utilisateur Clerk supprimé: ${user.id}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${user.id}:`, error);
      }
    }

    // Option 2: Nettoyer les Clerk ID de la base de données
    console.log('2. Nettoyage des Clerk ID de la base de données...');
    const result = await prisma.user.updateMany({
      where: { clerkId: { not: null } },
      data: { clerkId: null },
    });

    console.log(`✅ ${result.count} utilisateurs nettoyés de la base de données`);

    console.log('🎉 Rollback terminé!');
  } catch (error) {
    console.error('❌ Erreur lors du rollback:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

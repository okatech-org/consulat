#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Fonction pour normaliser les numéros de téléphone
function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';

  // Supprimer tous les espaces et tirets
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // S'assurer que le numéro commence par +
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }

  return cleaned;
}

// Fonction pour normaliser les emails
function normalizeEmail(email: string): string {
  if (!email) return '';

  // Convertir en minuscules et supprimer les espaces
  return email.toLowerCase().trim();
}

// Fonction pour migrer les données utilisateur dans la base de données
async function migrateUserDataInDatabase() {
  console.log('🔄 Début de la migration des données utilisateur...');

  const users = await prisma.user.findMany({
    where: {
      OR: [{ phoneNumber: { not: null } }, { email: { not: null } }],
    },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      name: true,
      roles: true,
      role: true,
      countryCode: true,
      assignedOrganizationId: true,
      organizationId: true,
      profileId: true,
      clerkId: true,
    },
  });

  console.log(`📊 ${users.length} utilisateurs trouvés à migrer`);

  let phoneUpdated = 0;
  let emailUpdated = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const updates: any = {};
      let hasUpdates = false;

      // Normaliser le numéro de téléphone
      if (user.phoneNumber) {
        const normalizedPhone = normalizePhoneNumber(user.phoneNumber);
        if (normalizedPhone !== user.phoneNumber) {
          updates.phoneNumber = normalizedPhone;
          hasUpdates = true;
          phoneUpdated++;
        }
      }

      // Normaliser l'email
      if (user.email) {
        const normalizedEmail = normalizeEmail(user.email);
        if (normalizedEmail !== user.email) {
          updates.email = normalizedEmail;
          hasUpdates = true;
          emailUpdated++;
        }
      }

      // Mettre à jour si nécessaire
      if (hasUpdates) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
        console.log(`✅ Utilisateur ${user.id} mis à jour`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour l'utilisateur ${user.id}:`, error);
      errors++;
    }
  }

  console.log(`\n📈 Résultats de la migration base de données:`);
  console.log(`   - Numéros de téléphone mis à jour: ${phoneUpdated}`);
  console.log(`   - Emails mis à jour: ${emailUpdated}`);
  console.log(`   - Erreurs: ${errors}`);

  return users;
}

// Fonction pour synchroniser les métadonnées avec Clerk
async function syncMetadataWithClerk(users: any[]) {
  console.log('\n🔄 Début de la synchronisation des métadonnées avec Clerk...');

  const usersWithClerkId = users.filter((user) => user.clerkId);
  console.log(`📊 ${usersWithClerkId.length} utilisateurs avec Clerk ID trouvés`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of usersWithClerkId) {
    try {
      // Préparer les métadonnées publiques
      const publicMetadata: any = {
        id: user.id,
        profileId: user.profileId,
        roles: user.roles,
        role: user.role,
        countryCode: user.countryCode,
      };

      // Ajouter assignedOrganizationId si présent
      if (user.assignedOrganizationId) {
        publicMetadata.assignedOrganizationId = user.assignedOrganizationId;
      }

      // Ajouter organizationId si présent
      if (user.organizationId) {
        publicMetadata.organizationId = user.organizationId;
      }

      // Mettre à jour les métadonnées dans Clerk
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.clerkId, {
        publicMetadata,
      });

      console.log(`✅ Métadonnées mises à jour pour ${user.clerkId}`);
      successCount++;
    } catch (error) {
      console.error(
        `❌ Erreur lors de la mise à jour des métadonnées pour ${user.clerkId}:`,
        error,
      );
      errorCount++;
    }
  }

  console.log(`\n📈 Résultats de la synchronisation Clerk:`);
  console.log(`   - Succès: ${successCount}`);
  console.log(`   - Erreurs: ${errorCount}`);
}

// Fonction pour vérifier les métadonnées existantes
async function checkExistingMetadata() {
  console.log('\n🔍 Vérification des métadonnées existantes...');

  const usersWithClerkId = await prisma.user.findMany({
    where: { clerkId: { not: null } },
    select: { id: true, clerkId: true, name: true },
  });

  for (const user of usersWithClerkId.slice(0, 3)) {
    // Vérifier seulement les 3 premiers
    try {
      const clerkUser = await clerkClient.users.getUser(user.clerkId!);
      console.log(`\n👤 Utilisateur ${user.name} (${user.id}):`);
      console.log(`   - Clerk ID: ${user.clerkId}`);
      console.log(
        `   - Métadonnées publiques:`,
        JSON.stringify(clerkUser.publicMetadata, null, 2),
      );
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération des métadonnées pour ${user.clerkId}:`,
        error,
      );
    }
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Début de la migration globale des données utilisateur\n');

    // Étape 1: Migrer les données dans la base de données
    const users = await migrateUserDataInDatabase();

    // Étape 2: Synchroniser les métadonnées avec Clerk
    await syncMetadataWithClerk(users);

    // Étape 3: Vérifier les métadonnées (optionnel)
    await checkExistingMetadata();

    console.log('\n🎉 Migration terminée avec succès!');
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

export {
  migrateUserDataInDatabase,
  syncMetadataWithClerk,
  normalizePhoneNumber,
  normalizeEmail,
};

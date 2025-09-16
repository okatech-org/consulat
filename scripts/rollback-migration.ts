#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Fonction pour restaurer les numéros de téléphone au format original
function restorePhoneFormat(phoneNumber: string): string {
  if (!phoneNumber) return '';

  // Si le numéro commence par + et fait plus de 10 caractères, ajouter un tiret
  if (phoneNumber.startsWith('+') && phoneNumber.length > 10) {
    const countryCode = phoneNumber.substring(0, 3); // +33, +1, etc.
    const number = phoneNumber.substring(3);
    return `${countryCode}-${number}`;
  }

  return phoneNumber;
}

// Fonction pour supprimer les métadonnées Clerk
async function removeClerkMetadata(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkId: true },
    });

    if (!user?.clerkId) {
      console.log(`⚠️  Utilisateur ${userId} n'a pas de Clerk ID`);
      return false;
    }

    // Supprimer les métadonnées publiques
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {},
    });

    console.log(`✅ Métadonnées supprimées pour ${user.clerkId}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression des métadonnées pour ${userId}:`,
      error,
    );
    return false;
  }
}

// Fonction pour restaurer les données depuis une sauvegarde
async function restoreFromBackup() {
  console.log('🔄 Restauration depuis la sauvegarde...');

  // Cette fonction nécessiterait une sauvegarde préalable
  // Pour l'instant, on affiche juste un message
  console.log('⚠️  Fonction de restauration depuis sauvegarde non implémentée');
  console.log(
    '   Veuillez restaurer manuellement depuis votre sauvegarde de base de données',
  );
}

// Fonction pour lister les utilisateurs avec leurs métadonnées actuelles
async function listUsersWithMetadata() {
  console.log('📋 Liste des utilisateurs avec métadonnées Clerk...\n');

  const users = await prisma.user.findMany({
    where: { clerkId: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      clerkId: true,
    },
  });

  for (const user of users) {
    try {
      const clerkUser = await clerkClient.users.getUser(user.clerkId!);
      const hasMetadata = Object.keys(clerkUser.publicMetadata || {}).length > 0;

      console.log(`👤 ${user.name} (${user.id})`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Téléphone: ${user.phoneNumber}`);
      console.log(`   - Clerk ID: ${user.clerkId}`);
      console.log(`   - Métadonnées: ${hasMetadata ? '✅ Présentes' : '❌ Absentes'}`);

      if (hasMetadata) {
        console.log(`   - Contenu:`, JSON.stringify(clerkUser.publicMetadata, null, 2));
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Erreur pour ${user.id}:`, error);
    }
  }
}

// Fonction pour supprimer toutes les métadonnées
async function removeAllMetadata() {
  console.log('🗑️  Suppression de toutes les métadonnées Clerk...\n');

  const users = await prisma.user.findMany({
    where: { clerkId: { not: null } },
    select: { id: true, name: true, clerkId: true },
  });

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    const success = await removeClerkMetadata(user.id);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`\n📈 Résultats de la suppression:`);
  console.log(`   - Succès: ${successCount}`);
  console.log(`   - Erreurs: ${errorCount}`);
}

// Fonction pour afficher les options de rollback
function showRollbackOptions() {
  console.log('🔄 Options de Rollback Disponibles\n');
  console.log('1. Lister les utilisateurs avec métadonnées');
  console.log('2. Supprimer toutes les métadonnées Clerk');
  console.log('3. Restaurer depuis une sauvegarde (non implémenté)');
  console.log('4. Afficher cette aide');
  console.log('');
  console.log('Usage:');
  console.log(
    '  tsx scripts/rollback-migration.ts --list              # Lister les utilisateurs',
  );
  console.log(
    '  tsx scripts/rollback-migration.ts --remove            # Supprimer les métadonnées',
  );
  console.log(
    '  tsx scripts/rollback-migration.ts --help              # Afficher cette aide',
  );
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.length === 0 || args[0] === '--help') {
      showRollbackOptions();
    } else if (args[0] === '--list') {
      await listUsersWithMetadata();
    } else if (args[0] === '--remove') {
      console.log(
        '⚠️  Vous êtes sur le point de supprimer TOUTES les métadonnées Clerk.',
      );
      console.log('   Cette action est irréversible.');
      console.log('');

      // Dans un vrai script, on demanderait confirmation
      // Pour l'instant, on affiche juste un avertissement
      console.log('❌ Action non exécutée pour des raisons de sécurité.');
      console.log(
        '   Décommentez le code ci-dessous si vous voulez vraiment supprimer les métadonnées.',
      );

      // await removeAllMetadata();
    } else {
      console.log('❌ Option non reconnue');
      showRollbackOptions();
    }
  } catch (error) {
    console.error('💥 Erreur lors du rollback:', error);
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
  removeClerkMetadata,
  removeAllMetadata,
  listUsersWithMetadata,
  restorePhoneFormat,
};

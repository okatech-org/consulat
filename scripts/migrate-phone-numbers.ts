#!/usr/bin/env tsx

/**
 * Script de migration des numéros de téléphone
 * Convertit le format +33-612250393 vers +33612250393 (format Clerk)
 */

import { db } from '../src/server/db';
import { clerkClient } from '@clerk/nextjs/server';

interface PhoneMigrationResult {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    email?: string;
    phoneNumber: string;
    error: string;
  }>;
}

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

/**
 * Valide qu'un numéro de téléphone est au bon format
 */
function isValidPhoneFormat(phoneNumber: string): boolean {
  // Format attendu: +[indicatif][numéro] (ex: +33612250393)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Migre les numéros de téléphone dans la base de données
 */
async function migratePhoneNumbersInDatabase(): Promise<PhoneMigrationResult> {
  const result: PhoneMigrationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('🔍 Recherche des utilisateurs avec numéros de téléphone...');

    const users = await db.user.findMany({
      where: {
        phoneNumber: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        clerkId: true,
      },
    });

    console.log(`📱 Trouvé ${users.length} utilisateurs avec numéros de téléphone`);

    for (const user of users) {
      if (!user.phoneNumber) continue;

      try {
        const originalPhone = user.phoneNumber;
        const normalizedPhone = normalizePhoneNumber(originalPhone);

        // Vérifier si le numéro a changé
        if (originalPhone === normalizedPhone) {
          console.log(
            `✅ ${user.email || user.id}: Numéro déjà au bon format (${originalPhone})`,
          );
          result.success++;
          continue;
        }

        // Valider le nouveau format
        if (!isValidPhoneFormat(normalizedPhone)) {
          const error = `Format invalide après normalisation: ${normalizedPhone}`;
          console.error(`❌ ${user.email || user.id}: ${error}`);
          result.errors.push({
            userId: user.id,
            email: user.email || undefined,
            phoneNumber: originalPhone,
            error,
          });
          result.failed++;
          continue;
        }

        // Mettre à jour en base de données
        await db.user.update({
          where: { id: user.id },
          data: { phoneNumber: normalizedPhone },
        });

        console.log(`✅ ${user.email || user.id}: ${originalPhone} → ${normalizedPhone}`);
        result.success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`❌ ${user.email || user.id}: ${errorMessage}`);
        result.errors.push({
          userId: user.id,
          email: user.email || undefined,
          phoneNumber: user.phoneNumber,
          error: errorMessage,
        });
        result.failed++;
      }
    }
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error);
    throw error;
  }

  return result;
}

/**
 * Synchronise les numéros de téléphone avec Clerk
 */
async function syncPhoneNumbersWithClerk(): Promise<PhoneMigrationResult> {
  const result: PhoneMigrationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log('🔄 Synchronisation avec Clerk...');

    const users = await db.user.findMany({
      where: {
        AND: [{ phoneNumber: { not: null } }, { clerkId: { not: null } }],
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        clerkId: true,
      },
    });

    console.log(`👥 Trouvé ${users.length} utilisateurs à synchroniser avec Clerk`);

    for (const user of users) {
      if (!user.phoneNumber || !user.clerkId) continue;

      try {
        // Mettre à jour le numéro de téléphone dans Clerk
        await clerkClient.users.updateUser(user.clerkId, {
          phoneNumber: user.phoneNumber,
        });

        console.log(`✅ Clerk: ${user.email || user.id} → ${user.phoneNumber}`);
        result.success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`❌ Clerk ${user.email || user.id}: ${errorMessage}`);
        result.errors.push({
          userId: user.id,
          email: user.email || undefined,
          phoneNumber: user.phoneNumber,
          error: `Clerk sync failed: ${errorMessage}`,
        });
        result.failed++;
      }
    }
  } catch (error) {
    console.error('💥 Erreur lors de la synchronisation Clerk:', error);
    throw error;
  }

  return result;
}

/**
 * Fonction principale de migration
 */
async function main() {
  console.log('🚀 Début de la migration des numéros de téléphone');
  console.log('📋 Format cible: +33612250393 (sans tiret)');
  console.log('');

  try {
    // Étape 1: Migration en base de données
    console.log('📊 Étape 1: Migration en base de données');
    const dbResult = await migratePhoneNumbersInDatabase();

    console.log('');
    console.log('📊 Résultats base de données:');
    console.log(`  ✅ Succès: ${dbResult.success}`);
    console.log(`  ❌ Échecs: ${dbResult.failed}`);

    if (dbResult.errors.length > 0) {
      console.log('  🔍 Erreurs détaillées:');
      dbResult.errors.forEach((error) => {
        console.log(`    - ${error.email || error.userId}: ${error.error}`);
      });
    }

    console.log('');

    // Étape 2: Synchronisation avec Clerk
    console.log('🔄 Étape 2: Synchronisation avec Clerk');
    const clerkResult = await syncPhoneNumbersWithClerk();

    console.log('');
    console.log('📊 Résultats Clerk:');
    console.log(`  ✅ Succès: ${clerkResult.success}`);
    console.log(`  ❌ Échecs: ${clerkResult.failed}`);

    if (clerkResult.errors.length > 0) {
      console.log('  🔍 Erreurs détaillées:');
      clerkResult.errors.forEach((error) => {
        console.log(`    - ${error.email || error.userId}: ${error.error}`);
      });
    }

    console.log('');
    console.log('🎉 Migration terminée!');
    console.log(
      `📊 Total: ${dbResult.success + clerkResult.success} succès, ${dbResult.failed + clerkResult.failed} échecs`,
    );
  } catch (error) {
    console.error('💥 Erreur fatale lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script échoué:', error);
      process.exit(1);
    });
}

export {
  normalizePhoneNumber,
  isValidPhoneFormat,
  migratePhoneNumbersInDatabase,
  syncPhoneNumbersWithClerk,
};

#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Fonction pour vérifier les métadonnées d'un utilisateur spécifique
async function checkUserMetadata(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roles: true,
        role: true,
        countryCode: true,
        assignedOrganizationId: true,
        organizationId: true,
        profileId: true,
        clerkId: true,
      },
    });

    if (!user) {
      console.log(`❌ Utilisateur ${userId} non trouvé`);
      return;
    }

    console.log(`\n👤 Utilisateur: ${user.name} (${user.id})`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Téléphone: ${user.phoneNumber}`);
    console.log(`   - Rôles: ${JSON.stringify(user.roles)}`);
    console.log(`   - Rôle principal: ${user.role}`);
    console.log(`   - Code pays: ${user.countryCode}`);
    console.log(`   - Profile ID: ${user.profileId}`);
    console.log(`   - Organization ID: ${user.organizationId}`);
    console.log(`   - Assigned Organization ID: ${user.assignedOrganizationId}`);
    console.log(`   - Clerk ID: ${user.clerkId}`);

    if (user.clerkId) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(user.clerkId);
        console.log(`\n🔍 Métadonnées Clerk:`);
        console.log(
          `   - Métadonnées publiques:`,
          JSON.stringify(clerkUser.publicMetadata, null, 2),
        );
        console.log(
          `   - Métadonnées privées:`,
          JSON.stringify(clerkUser.privateMetadata, null, 2),
        );
      } catch (error) {
        console.error(`❌ Erreur lors de la récupération des métadonnées Clerk:`, error);
      }
    } else {
      console.log(`⚠️  Aucun Clerk ID associé`);
    }
  } catch (error) {
    console.error(`❌ Erreur:`, error);
  }
}

// Fonction pour lister tous les utilisateurs avec leurs métadonnées
async function listAllUsersMetadata() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roles: true,
        role: true,
        countryCode: true,
        assignedOrganizationId: true,
        organizationId: true,
        profileId: true,
        clerkId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📊 ${users.length} utilisateurs trouvés\n`);

    for (const user of users) {
      console.log(`👤 ${user.name || 'Sans nom'} (${user.id})`);
      console.log(`   - Email: ${user.email || 'Non défini'}`);
      console.log(`   - Téléphone: ${user.phoneNumber || 'Non défini'}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log(`   - Clerk ID: ${user.clerkId || 'Non défini'}`);

      if (user.clerkId) {
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(user.clerkId);
          const hasMetadata = Object.keys(clerkUser.publicMetadata || {}).length > 0;
          console.log(
            `   - Métadonnées: ${hasMetadata ? '✅ Présentes' : '❌ Manquantes'}`,
          );
        } catch (error) {
          console.log(`   - Métadonnées: ❌ Erreur de récupération`);
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des utilisateurs:`, error);
  }
}

// Fonction pour vérifier les utilisateurs sans métadonnées
async function checkUsersWithoutMetadata() {
  try {
    const users = await prisma.user.findMany({
      where: { clerkId: { not: null } },
      select: {
        id: true,
        name: true,
        clerkId: true,
      },
    });

    console.log(
      `\n🔍 Vérification des métadonnées pour ${users.length} utilisateurs avec Clerk ID...\n`,
    );

    let withMetadata = 0;
    let withoutMetadata = 0;
    let errors = 0;

    for (const user of users) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(user.clerkId!);
        const hasMetadata = Object.keys(clerkUser.publicMetadata || {}).length > 0;

        if (hasMetadata) {
          withMetadata++;
          console.log(`✅ ${user.name} (${user.id}) - Métadonnées présentes`);
        } else {
          withoutMetadata++;
          console.log(`❌ ${user.name} (${user.id}) - Métadonnées manquantes`);
        }
      } catch (error) {
        errors++;
        console.log(`⚠️  ${user.name} (${user.id}) - Erreur: ${error}`);
      }
    }

    console.log(`\n📈 Résumé:`);
    console.log(`   - Avec métadonnées: ${withMetadata}`);
    console.log(`   - Sans métadonnées: ${withoutMetadata}`);
    console.log(`   - Erreurs: ${errors}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification:`, error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.length === 0) {
      console.log('🔍 Vérification des métadonnées Clerk\n');
      await checkUsersWithoutMetadata();
    } else if (args[0] === '--all') {
      console.log('📋 Liste de tous les utilisateurs avec leurs métadonnées\n');
      await listAllUsersMetadata();
    } else if (args[0] === '--user') {
      if (args[1]) {
        await checkUserMetadata(args[1]);
      } else {
        console.log('❌ Veuillez spécifier un ID utilisateur');
        console.log('Usage: tsx scripts/check-clerk-metadata.ts --user <userId>');
      }
    } else {
      console.log('Usage:');
      console.log(
        '  tsx scripts/check-clerk-metadata.ts                    # Vérifier les utilisateurs sans métadonnées',
      );
      console.log(
        '  tsx scripts/check-clerk-metadata.ts --all              # Lister tous les utilisateurs',
      );
      console.log(
        '  tsx scripts/check-clerk-metadata.ts --user <userId>    # Vérifier un utilisateur spécifique',
      );
    }
  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

export { checkUserMetadata, listAllUsersMetadata, checkUsersWithoutMetadata };

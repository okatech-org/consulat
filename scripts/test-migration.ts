#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Fonction pour tester la normalisation des numéros de téléphone
function testPhoneNormalization() {
  console.log('🧪 Test de normalisation des numéros de téléphone\n');

  const testCases = [
    '+33-612250393',
    '+33 612250393',
    '+33612250393',
    '33-612250393',
    '33 612250393',
    '33612250393',
    '+1-555-123-4567',
    '+1 555 123 4567',
    '+15551234567',
  ];

  testCases.forEach((phone) => {
    const normalized = phone.replace(/[\s-]/g, '');
    const result = normalized.startsWith('+') ? normalized : '+' + normalized;
    console.log(`   ${phone} → ${result}`);
  });
}

// Fonction pour tester la normalisation des emails
function testEmailNormalization() {
  console.log('\n🧪 Test de normalisation des emails\n');

  const testCases = [
    'USER@EXAMPLE.COM',
    ' user@example.com ',
    'User@Example.Com',
    'USER@EXAMPLE.COM ',
    ' user@example.com',
  ];

  testCases.forEach((email) => {
    const normalized = email.toLowerCase().trim();
    console.log(`   "${email}" → "${normalized}"`);
  });
}

// Fonction pour tester la connexion à la base de données
async function testDatabaseConnection() {
  console.log('\n🧪 Test de connexion à la base de données\n');

  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Connexion réussie - ${userCount} utilisateurs trouvés`);

    const usersWithPhone = await prisma.user.count({
      where: { phoneNumber: { not: null } },
    });
    console.log(`   - ${usersWithPhone} utilisateurs avec numéro de téléphone`);

    const usersWithEmail = await prisma.user.count({
      where: { email: { not: null } },
    });
    console.log(`   - ${usersWithEmail} utilisateurs avec email`);

    const usersWithClerkId = await prisma.user.count({
      where: { clerkId: { not: null } },
    });
    console.log(`   - ${usersWithClerkId} utilisateurs avec Clerk ID`);
  } catch (error) {
    console.error(`❌ Erreur de connexion à la base de données:`, error);
    throw error;
  }
}

// Fonction pour tester la connexion à Clerk
async function testClerkConnection() {
  console.log('\n🧪 Test de connexion à Clerk\n');

  try {
    // Instancier le client Clerk
    const client = await clerkClient();

    // Tenter de récupérer la liste des utilisateurs (limité à 1 pour le test)
    const users = await client.users.getUserList({ limit: 1 });
    console.log(`✅ Connexion à Clerk réussie`);
    console.log(`   - ${users.totalCount} utilisateurs dans Clerk`);

    if (users.data.length > 0) {
      const firstUser = users.data[0];
      console.log(
        `   - Premier utilisateur: ${firstUser.firstName} ${firstUser.lastName} (${firstUser.id})`,
      );
    }
  } catch (error) {
    console.error(`❌ Erreur de connexion à Clerk:`, error);
    throw error;
  }
}

// Fonction pour tester la structure des métadonnées
function testMetadataStructure() {
  console.log('\n🧪 Test de structure des métadonnées\n');

  const sampleMetadata = {
    id: 'user_123',
    profileId: 'profile_456',
    roles: ['USER', 'AGENT'],
    role: 'AGENT',
    countryCode: 'FR',
    assignedOrganizationId: 'org_789',
    organizationId: 'org_101',
  };

  console.log('Structure des métadonnées qui seront ajoutées:');
  console.log(JSON.stringify(sampleMetadata, null, 2));

  const metadataSize = JSON.stringify(sampleMetadata).length;
  console.log(`\nTaille des métadonnées: ${metadataSize} bytes`);

  if (metadataSize > 1200) {
    console.log(
      '⚠️  Attention: Les métadonnées dépassent la limite recommandée de 1.2KB',
    );
  } else {
    console.log('✅ Taille des métadonnées acceptable');
  }
}

// Fonction pour simuler la migration sur un échantillon
async function testMigrationSample() {
  console.log('\n🧪 Test de migration sur un échantillon\n');

  try {
    // Récupérer 3 utilisateurs pour le test
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      where: {
        OR: [{ phoneNumber: { not: null } }, { email: { not: null } }],
      },
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

    console.log(`📊 ${sampleUsers.length} utilisateurs d'échantillon trouvés\n`);

    for (const user of sampleUsers) {
      console.log(`👤 ${user.name} (${user.id})`);

      // Test de normalisation du téléphone
      if (user.phoneNumber) {
        const normalizedPhone = user.phoneNumber.replace(/[\s-]/g, '');
        const finalPhone = normalizedPhone.startsWith('+')
          ? normalizedPhone
          : '+' + normalizedPhone;
        console.log(`   Téléphone: ${user.phoneNumber} → ${finalPhone}`);
      }

      // Test de normalisation de l'email
      if (user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        console.log(`   Email: ${user.email} → ${normalizedEmail}`);
      }

      // Test des métadonnées
      const metadata = {
        id: user.id,
        profileId: user.profileId,
        roles: user.roles,
        role: user.role,
        countryCode: user.countryCode,
        ...(user.assignedOrganizationId && {
          assignedOrganizationId: user.assignedOrganizationId,
        }),
        ...(user.organizationId && { organizationId: user.organizationId }),
      };

      console.log(`   Métadonnées: ${JSON.stringify(metadata)}`);
      console.log(`   Clerk ID: ${user.clerkId || 'Non défini'}`);
      console.log('');
    }
  } catch (error) {
    console.error(`❌ Erreur lors du test d'échantillon:`, error);
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🧪 Tests de Migration des Données Utilisateur');
    console.log('=============================================\n');

    // Tests de normalisation
    testPhoneNormalization();
    testEmailNormalization();
    testMetadataStructure();

    // Tests de connexion
    await testDatabaseConnection();
    await testClerkConnection();

    // Test de migration sur échantillon
    await testMigrationSample();

    console.log('\n✅ Tous les tests sont passés avec succès!');
    console.log('🚀 Vous pouvez maintenant exécuter la migration complète avec:');
    console.log('   ./scripts/run-user-migration.sh');
  } catch (error) {
    console.error('\n❌ Des tests ont échoué:', error);
    console.log(
      "\n🔧 Veuillez corriger les erreurs avant d'exécuter la migration complète.",
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
if (require.main === module) {
  main();
}

export {
  testPhoneNormalization,
  testEmailNormalization,
  testDatabaseConnection,
  testClerkConnection,
  testMetadataStructure,
  testMigrationSample,
};

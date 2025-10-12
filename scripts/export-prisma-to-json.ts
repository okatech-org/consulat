import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient({
  datasourceUrl:
    'postgresql://neondb_owner:npg_iZ2rXwYGM1xh@ep-lingering-frost-a95p0p8l-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
});

interface ExportStats {
  entity: string;
  count: number;
  file: string;
}

const EXPORT_DIR = './data/exports';

async function ensureExportDir() {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  console.log(`📁 Dossier d'export créé : ${EXPORT_DIR}`);
}

async function exportCountries() {
  console.log('\n🌍 Export des pays...');
  const countries = await prisma.country.findMany({
    orderBy: { code: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'countries.json');
  await fs.writeFile(filePath, JSON.stringify(countries, null, 2));

  console.log(`✅ ${countries.length} pays exportés → ${filePath}`);
  return { entity: 'countries', count: countries.length, file: filePath };
}

async function exportOrganizations() {
  console.log('\n🏢 Export des organisations...');
  const organizations = await prisma.organization.findMany({
    include: {
      countries: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'organizations.json');
  await fs.writeFile(filePath, JSON.stringify(organizations, null, 2));

  console.log(`✅ ${organizations.length} organisations exportées → ${filePath}`);
  return { entity: 'organizations', count: organizations.length, file: filePath };
}

async function exportServices() {
  console.log('\n🛎️ Export des services...');
  const services = await prisma.consularService.findMany({
    include: {
      organization: true,
      steps: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'services.json');
  await fs.writeFile(filePath, JSON.stringify(services, null, 2));

  console.log(`✅ ${services.length} services exportés → ${filePath}`);
  return { entity: 'services', count: services.length, file: filePath };
}

async function exportUserCentricData() {
  console.log('\n👤 Export des données centrées utilisateur...');

  const users = await prisma.user.findMany({
    include: {
      profile: {
        include: {
          address: true,
          residentContact: {
            include: {
              address: true,
            },
          },
          homeLandContact: {
            include: {
              address: true,
            },
          },
          parentAuthorities: true,
          intelligenceNotes: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              history: true,
            },
          },
        },
      },
      documents: {
        include: {
          serviceRequest: true,
        },
      },
      submittedRequests: {
        include: {
          service: true,
          requestedFor: true,
          appointments: true,
          requiredDocuments: true,
          notes: true,
          messages: true,
          actions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          feedbacks: true,
        },
      },
      appointmentsToAttend: {
        include: {
          location: true,
          service: true,
        },
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
      },
      feedbacks: {
        include: {
          service: true,
        },
      },
      childAuthorities: {
        include: {
          profile: {
            include: {
              address: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'users-data.json');
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));

  console.log(`✅ ${users.length} utilisateurs avec données exportés → ${filePath}`);

  let totalRecords = users.length;
  users.forEach((user) => {
    totalRecords += user.documents?.length || 0;
    totalRecords += user.submittedRequests?.length || 0;
    totalRecords += user.appointmentsToAttend?.length || 0;
    totalRecords += user.notifications?.length || 0;
    totalRecords += user.feedbacks?.length || 0;
    totalRecords += user.childAuthorities?.length || 0;
    if (user.profile) totalRecords++;
  });

  console.log(`   📊 Total enregistrements inclus : ${totalRecords}`);

  return { entity: 'users-data', count: totalRecords, file: filePath };
}

async function exportOrphanedData() {
  console.log('\n🔍 Export des données orphelines...');

  // Seuls les profils peuvent être orphelins (userId nullable)
  const orphanedProfiles = await prisma.profile.findMany({
    where: { userId: null },
    include: {
      address: true,
      residentContact: true,
      homeLandContact: true,
    },
  });

  // Note : submittedById et attendeeId sont non-nullable dans le schéma
  // donc pas de demandes ou rendez-vous orphelins possibles
  const orphanedData = {
    profiles: orphanedProfiles,
    requests: [], // Non applicable - submittedById est obligatoire
    appointments: [], // Non applicable - attendeeId est obligatoire
    note: 'Seuls les profils peuvent être orphelins dans ce schéma. Les demandes et rendez-vous ont des relations obligatoires.',
  };

  const filePath = path.join(EXPORT_DIR, 'orphaned-data.json');
  await fs.writeFile(filePath, JSON.stringify(orphanedData, null, 2));

  console.log(`✅ ${orphanedProfiles.length} profils orphelins exportés → ${filePath}`);
  console.log(`   📋 Profils sans utilisateur : ${orphanedProfiles.length}`);
  if (orphanedProfiles.length === 0) {
    console.log('   ✨ Aucune donnée orpheline trouvée - Base de données propre !');
  }

  return { entity: 'orphaned-data', count: orphanedProfiles.length, file: filePath };
}

async function generateMetadata(stats: ExportStats[]) {
  console.log('\n📊 Génération des métadonnées...');

  const metadata = {
    exportDate: new Date().toISOString(),
    totalFiles: stats.length,
    totalRecords: stats.reduce((sum, stat) => sum + stat.count, 0),
    files: stats.map((stat) => ({
      entity: stat.entity,
      count: stat.count,
      file: stat.file,
    })),
    version: '1.0.0',
    source: 'Prisma PostgreSQL',
    target: 'Convex',
  };

  const filePath = path.join(EXPORT_DIR, 'metadata.json');
  await fs.writeFile(filePath, JSON.stringify(metadata, null, 2));

  console.log(`✅ Métadonnées générées → ${filePath}`);
  return metadata;
}

async function generateImportManifest() {
  console.log("\n📋 Génération du manifeste d'import...");

  const manifest = {
    version: '1.0.0',
    importOrder: [
      {
        step: 1,
        entity: 'countries',
        file: 'countries.json',
        description: 'Import des pays',
        dependencies: [],
      },
      {
        step: 2,
        entity: 'organizations',
        file: 'organizations.json',
        description: 'Import des organisations',
        dependencies: ['countries'],
      },
      {
        step: 3,
        entity: 'services',
        file: 'services.json',
        description: 'Import des services consulaires',
        dependencies: ['organizations'],
      },
      {
        step: 4,
        entity: 'users-data',
        file: 'users-data.json',
        description:
          'Import des utilisateurs avec profils, documents, demandes, rendez-vous, notifications',
        dependencies: ['organizations', 'services'],
        notes: [
          'Données centrées utilisateur',
          'Inclut toutes les relations user-centric',
          'Traiter en respectant les relations',
        ],
      },
      {
        step: 5,
        entity: 'orphaned-data',
        file: 'orphaned-data.json',
        description: 'Import des données orphelines (sans utilisateur)',
        dependencies: ['users-data', 'services', 'organizations'],
        optional: true,
      },
    ],
    warnings: [
      "Importer dans l'ordre spécifié",
      'Vérifier les dépendances avant chaque import',
      'Les données user-centric doivent être importées après les entités de base',
    ],
  };

  const filePath = path.join(EXPORT_DIR, 'import-manifest.json');
  await fs.writeFile(filePath, JSON.stringify(manifest, null, 2));

  console.log(`✅ Manifeste d'import généré → ${filePath}`);
}

async function printSummary(stats: ExportStats[], metadata: any) {
  console.log('\n' + '='.repeat(80));
  console.log("📊 RÉSUMÉ DE L'EXPORT");
  console.log('='.repeat(80));

  console.log(`\n📅 Date : ${new Date(metadata.exportDate).toLocaleString('fr-FR')}`);
  console.log(`📁 Dossier : ${EXPORT_DIR}`);
  console.log(`📦 Fichiers générés : ${stats.length + 2}`);
  console.log(`📈 Total enregistrements : ${metadata.totalRecords}`);

  console.log('\n📄 Fichiers exportés :');
  stats.forEach((stat) => {
    console.log(
      `   ✅ ${stat.entity.padEnd(20)} : ${stat.count.toString().padStart(6)} records`,
    );
  });

  console.log("\n📋 Structure d'export :");
  console.log('   1️⃣  Countries (indépendant)');
  console.log('   2️⃣  Organizations (indépendant)');
  console.log('   3️⃣  Services (indépendant)');
  console.log('   4️⃣  Users-Data (centré utilisateur)');
  console.log('       ↳ Profils');
  console.log('       ↳ Documents');
  console.log('       ↳ Demandes de service');
  console.log('       ↳ Rendez-vous');
  console.log('       ↳ Notifications');
  console.log('       ↳ Feedbacks');
  console.log('       ↳ Autorités parentales');
  console.log('   5️⃣  Orphaned-Data (données sans user)');

  console.log('\n🎯 Prochaines étapes :');
  console.log('   1. Vérifier les fichiers JSON dans ./data/exports/');
  console.log("   2. Consulter import-manifest.json pour l'ordre d'import");
  console.log("   3. Lancer l'import vers Convex :");
  console.log('      bun run migrate:import-to-convex');

  console.log('\n' + '='.repeat(80));
}

async function main() {
  console.log('🚀 EXPORT PRISMA → JSON');
  console.log('='.repeat(80));

  try {
    await ensureExportDir();

    const stats: ExportStats[] = [];

    stats.push(await exportCountries());
    stats.push(await exportOrganizations());
    stats.push(await exportServices());
    stats.push(await exportUserCentricData());
    stats.push(await exportOrphanedData());

    const metadata = await generateMetadata(stats);
    await generateImportManifest();

    await printSummary(stats, metadata);

    console.log('\n✅ Export terminé avec succès !');
  } catch (error) {
    console.error("\n❌ Erreur lors de l'export :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

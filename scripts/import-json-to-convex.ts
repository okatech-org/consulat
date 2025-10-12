import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import fs from 'fs/promises';
import path from 'path';
import type {
  CountryExport,
  NonUsersAccountsExport,
  OrganizationExport,
  ServiceExport,
  UserCentricDataExport,
} from './export-prisma-to-json';

const EXPORT_DIR = './data/exports';
const TRACKING_FILE = path.join(EXPORT_DIR, 'migrated-ids.json');
const convex = new ConvexHttpClient('https://dapper-guineapig-547.convex.cloud');

interface ImportStats {
  entity: string;
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

interface MigrationTracking {
  lastUpdate: string | null;
  version: string;
  entities: {
    countries: string[];
    organizations: string[];
    services: string[];
    'non-users-accounts': string[];
    'users-data': string[];
  };
  stats: {
    countries: number;
    organizations: number;
    services: number;
    'non-users-accounts': number;
    'users-data': number;
  };
}

const stats: Record<string, ImportStats> = {};
let migrationTracking: MigrationTracking;

function initStat(entity: string, total: number) {
  stats[entity] = {
    entity,
    total,
    success: 0,
    failed: 0,
    skipped: 0,
  };
}

async function loadJsonFile(filename: string) {
  const filePath = path.join(EXPORT_DIR, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function loadMigrationTracking() {
  try {
    const content = await fs.readFile(TRACKING_FILE, 'utf-8');
    migrationTracking = JSON.parse(content);
    console.log('📝 Fichier de tracking chargé');
    console.log(
      `   Déjà migrés : ${Object.values(migrationTracking.stats).reduce((a, b) => a + b, 0)} entrées`,
    );
  } catch (error) {
    console.log('📝 Création du fichier de tracking...');
    console.error('❌ Erreur chargement tracking:', error);
    migrationTracking = {
      lastUpdate: null,
      version: '1.0.0',
      entities: {
        countries: [],
        organizations: [],
        services: [],
        'non-users-accounts': [],
        'users-data': [],
      },
      stats: {
        countries: 0,
        organizations: 0,
        services: 0,
        'non-users-accounts': 0,
        'users-data': 0,
      },
    };
  }
}

async function saveMigrationTracking() {
  migrationTracking.lastUpdate = new Date().toISOString();
  await fs.writeFile(TRACKING_FILE, JSON.stringify(migrationTracking, null, 2));
}

function isAlreadyMigrated(
  entity: keyof MigrationTracking['entities'],
  id: string,
): boolean {
  return migrationTracking.entities[entity].includes(id);
}

function addMigratedId(entity: keyof MigrationTracking['entities'], id: string) {
  if (!migrationTracking.entities[entity].includes(id)) {
    migrationTracking.entities[entity].push(id);
    migrationTracking.stats[entity]++;
  }
}

async function importCountries() {
  console.log('\n🌍 Import des pays...');
  const countries: CountryExport[] = await loadJsonFile('countries.json');
  initStat('countries', countries.length);

  const countriesToImport = countries.filter((country) => {
    if (isAlreadyMigrated('countries', country.id)) {
      stats.countries!.skipped++;
      return false;
    }
    return true;
  });

  console.log(`   Déjà migrés : ${stats.countries!.skipped}`);
  console.log(`   À importer : ${countriesToImport.length}`);

  if (countriesToImport.length === 0) {
    console.log('⏭️  Tous les pays sont déjà migrés');
    return;
  }

  try {
    const result = await convex.mutation(api.functions.migration.importCountries, {
      countries: countriesToImport.map((country) => ({
        id: country.id,
        name: country.name,
        code: country.code,
        status: country.status,
        flag: country.flag,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
        metadata: country.metadata,
      })),
    });

    countriesToImport.forEach((country) => addMigratedId('countries', country.id));
    await saveMigrationTracking();

    stats.countries!.success = result.importedCount;
    console.log(`✅ ${result.importedCount} pays importés`);
  } catch (error) {
    console.error('❌ Erreur import pays:', error);
    stats.countries!.failed = countriesToImport.length;
  }
}

async function importOrganizations() {
  console.log('\n🏢 Import des organisations...');
  const organizations: OrganizationExport[] = await loadJsonFile('organizations.json');
  initStat('organizations', organizations.length);

  const organizationsToImport = organizations.filter((org) => {
    if (isAlreadyMigrated('organizations', org.id)) {
      stats.organizations!.skipped++;
      return false;
    }
    return true;
  });

  console.log(`   Déjà migrés : ${stats.organizations!.skipped}`);
  console.log(`   À importer : ${organizationsToImport.length}`);

  if (organizationsToImport.length === 0) {
    console.log('⏭️  Toutes les organisations sont déjà migrées');
    return;
  }

  try {
    const result = await convex.mutation(api.functions.migration.importOrganizations, {
      organizations: organizationsToImport.map((org) => ({
        id: org.id,
        name: org.name,
        code: org.id.substring(0, 8).toUpperCase(),
        logo: org.logo,
        type: org.type,
        status: org.status,
        metadata: org.metadata || {},
        appointmentSettings: org.appointmentSettings || {},
        countries: org.countries?.map((c) => c.code) || [],
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      })),
    });

    organizationsToImport.forEach((org) => addMigratedId('organizations', org.id));
    await saveMigrationTracking();

    stats.organizations!.success = result.importedCount;
    console.log(`✅ ${result.importedCount} organisations importées`);
  } catch (error) {
    console.error('❌ Erreur import organisations:', error);
    stats.organizations!.failed = organizationsToImport.length;
  }
}

async function importServices() {
  console.log('\n🛎️ Import des services...');
  const services: ServiceExport[] = await loadJsonFile('services.json');
  initStat('services', services.length);

  const servicesToImport = services.filter((service) => {
    if (isAlreadyMigrated('services', service.id)) {
      stats.services!.skipped++;
      return false;
    }
    return true;
  });

  console.log(`   Déjà migrés : ${stats.services!.skipped}`);
  console.log(`   À importer : ${servicesToImport.length}`);

  if (servicesToImport.length === 0) {
    console.log('⏭️  Tous les services sont déjà migrés');
    return;
  }

  try {
    const result = await convex.mutation(api.functions.migration.importServices, {
      services: servicesToImport.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        isActive: service.isActive,
        organizationId: service.organizationId,
        requiredDocuments: service.requiredDocuments || [],
        optionalDocuments: service.optionalDocuments || [],
        processingMode: service.processingMode,
        deliveryMode: service.deliveryMode || [],
        requiresAppointment: service.requiresAppointment,
        appointmentDuration: service.appointmentDuration,
        appointmentInstructions: service.appointmentInstructions,
        isFree: service.isFree,
        price: service.price,
        currency: service.currency,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    });

    servicesToImport.forEach((service) => addMigratedId('services', service.id));
    await saveMigrationTracking();

    stats.services!.success = result.importedCount;
    console.log(`✅ ${result.importedCount} services importés`);
  } catch (error) {
    console.error('❌ Erreur import services:', error);
    stats.services!.failed = servicesToImport.length;
  }
}

async function importNonUsersAccounts() {
  console.log('\n👤 Import des comptes non utilisateurs...');
  const nonUsersAccounts: NonUsersAccountsExport[] = await loadJsonFile(
    'non-users-accounts.json',
  );
  initStat('non-users-accounts', nonUsersAccounts.length);

  const nonUsersAccountsToImport = nonUsersAccounts.filter((nonUserAccount) => {
    if (isAlreadyMigrated('non-users-accounts', nonUserAccount.id)) {
      stats['non-users-accounts']!.skipped++;
      return false;
    }
    return true;
  });

  console.log(`   Déjà migrés : ${stats['non-users-accounts']!.skipped}`);
  console.log(`   À importer : ${nonUsersAccountsToImport.length}`);

  if (nonUsersAccountsToImport.length === 0) {
    console.log('⏭️  Tous les comptes non utilisateurs sont déjà migrés');
    return;
  }

  try {
    const result = await convex.mutation(api.functions.migration.importNonUsersAccounts, {
      accounts: nonUsersAccountsToImport.map((acc) => ({
        id: acc.id,
        clerkId: acc.clerkId ?? null,
        name: acc.name ?? null,
        email: acc.email ?? null,
        phoneNumber: acc.phoneNumber ?? null,
        roles: acc.roles || [],
        organizationId: acc.organizationId ?? null,
        assignedOrganizationId: acc.assignedOrganizationId ?? null,
        assignedCountries: (acc.linkedCountries || []).map((c) => c.code),
        notifications: (acc.notifications || []).map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          status: n.status,
          read: n.read,
          createdAt: n.createdAt,
        })),
        managedByUserId: acc.managedByUserId ?? null,
      })),
    });

    nonUsersAccountsToImport.forEach((acc) =>
      addMigratedId('non-users-accounts', acc.id),
    );
    await saveMigrationTracking();

    stats['non-users-accounts']!.success = result.importedCount;
    console.log(
      `✅ ${result.importedCount} comptes non utilisateurs importés (avec memberships)`,
    );
  } catch (error) {
    console.error('❌ Erreur import comptes non utilisateurs:', error);
    stats['non-users-accounts']!.failed = nonUsersAccountsToImport.length;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function importUserCentricData() {
  console.log('\n👤 Import des données centrées utilisateur...');
  const usersData: UserCentricDataExport[] = await loadJsonFile('users-data.json');
  initStat('users-data', usersData.length);

  const usersToImport = usersData.filter((userData) => {
    if (isAlreadyMigrated('users-data', userData.id)) {
      stats['users-data']!.skipped++;
      return false;
    }
    const roles = userData.roles && userData.roles.length > 0 ? userData.roles : ['USER'];
    const isStaff = roles.some((r) => r !== 'USER');
    if (isStaff) {
      // Exclus: comptes staff gérés par importNonUsersAccounts
      stats['users-data']!.skipped++;
      return false;
    }
    return true;
  });

  console.log(`   Déjà migrés : ${stats['users-data']!.skipped}`);
  console.log(`   À importer : ${usersToImport.length}`);

  if (usersToImport.length === 0) {
    console.log('⏭️  Tous les utilisateurs sont déjà migrés');
    return;
  }

  let totalImported = 0;
  let totalFailed = 0;

  for (const userData of usersToImport) {
    try {
      console.log(
        `\n   📍 Import utilisateur : ${userData.email || userData.name || userData.id}`,
      );

      const result = await convex.mutation(api.functions.migration.importUserWithData, {
        user: {
          id: userData.id,
          clerkId: userData.clerkId,
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          roles: userData.roles,
          image: userData.image,
          countryCode: userData.countryCode,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        profile: userData.profile
          ? {
              id: userData.profile.id,
              userId: userData.id,
              category: userData.profile.category,
              status: userData.profile.status,
              firstName: userData.profile.firstName,
              lastName: userData.profile.lastName,
              gender: userData.profile.gender,
              birthDate: userData.profile.birthDate,
              birthPlace: userData.profile.birthPlace,
              birthCountry: userData.profile.birthCountry,
              nationality: userData.profile.nationality,
              maritalStatus: userData.profile.maritalStatus,
              workStatus: userData.profile.workStatus,
              acquisitionMode: userData.profile.acquisitionMode,
              phoneNumber: userData.profile.phoneNumber,
              email: userData.profile.email,
              profession: userData.profile.profession,
              employer: userData.profile.employer,
              employerAddress: userData.profile.employerAddress,
              fatherFullName: userData.profile.fatherFullName,
              motherFullName: userData.profile.motherFullName,
              spouseFullName: userData.profile.spouseFullName,
              createdAt: userData.profile.createdAt,
              updatedAt: userData.profile.updatedAt,
            }
          : undefined,
        documents: userData.documents || [],
        requests: userData.submittedRequests || [],
        appointments: userData.appointmentsToAttend || [],
        notifications: userData.notifications || [],
        feedbacks: userData.feedbacks || [],
        childAuthorities: userData.childAuthorities || [],
      });

      addMigratedId('users-data', userData.id);
      await saveMigrationTracking();

      console.log(
        `   ✅ Utilisateur importé avec ${result.recordsImported} enregistrements liés`,
      );
      totalImported++;
    } catch (error) {
      console.error(`   ❌ Erreur import utilisateur ${userData.id}:`, error);
      totalFailed++;
    }
  }

  stats['users-data']!.success = totalImported;
  stats['users-data']!.failed = totalFailed;

  console.log(
    `\n✅ ${totalImported}/${usersToImport.length} utilisateurs importés avec leurs données`,
  );
}

async function printStats() {
  console.log('\n' + '='.repeat(80));
  console.log("📊 RÉSUMÉ DE L'IMPORT");
  console.log('='.repeat(80));

  Object.values(stats).forEach((stat) => {
    const successRate =
      stat.total > 0 ? ((stat.success / stat.total) * 100).toFixed(2) : '0.00';
    console.log(`\n${stat.entity.toUpperCase()}:`);
    console.log(`  Total: ${stat.total}`);
    console.log(`  ✅ Succès: ${stat.success} (${successRate}%)`);
    console.log(`  ❌ Échecs: ${stat.failed}`);
    if (stat.skipped > 0) {
      console.log(`  ⏭️  Ignorés: ${stat.skipped}`);
    }
  });

  console.log('\n' + '='.repeat(80));
}

async function main() {
  console.log('🚀 IMPORT JSON → CONVEX');
  console.log('='.repeat(80));

  try {
    const manifest = await loadJsonFile('import-manifest.json');
    console.log("\n📋 Manifeste d'import chargé");
    console.log(`   Version : ${manifest.version}`);
    console.log(`   Étapes : ${manifest.importOrder.length}`);

    await loadMigrationTracking();

    await importCountries();
    await importOrganizations();
    await importServices();
    await importNonUsersAccounts();
    //await importUserCentricData();

    await printStats();

    console.log('\n✅ Import terminé !');
    console.log(`📝 Tracking sauvegardé dans ${TRACKING_FILE}`);
  } catch (error) {
    console.error("\n❌ Erreur lors de l'import :", error);
    process.exit(1);
  }
}

main();

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import fs from 'fs/promises';
import path from 'path';

const EXPORT_DIR = './data/exports';
const convex = new ConvexHttpClient('https://dapper-guineapig-547.convex.cloud');

interface ImportStats {
  entity: string;
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

const stats: Record<string, ImportStats> = {};

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

async function importCountries() {
  console.log('\n🌍 Import des pays...');
  const countries = await loadJsonFile('countries.json');
  initStat('countries', countries.length);

  try {
    const result = await convex.mutation(api.functions.migration.importCountries, {
      countries: countries.map((country: any) => ({
        id: country.id,
        name: country.name,
        code: country.code,
        status: country.status,
        flag: country.flag,
        createdAt: country.createdAt,
        updatedAt: country.updatedAt,
      })),
    });

    stats.countries.success = result.importedCount;
    console.log(`✅ ${result.importedCount} pays importés`);
  } catch (error) {
    console.error('❌ Erreur import pays:', error);
    stats.countries.failed = countries.length;
  }
}

async function importOrganizations() {
  console.log('\n🏢 Import des organisations...');
  const organizations = await loadJsonFile('organizations.json');
  initStat('organizations', organizations.length);

  try {
    const result = await convex.mutation(api.functions.migration.importOrganizations, {
      organizations: organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        code: org.id.substring(0, 8).toUpperCase(),
        logo: org.logo,
        type: org.type,
        status: org.status,
        metadata: org.metadata || {},
        appointmentSettings: org.appointmentSettings || {},
        countries: org.countries?.map((c: any) => c.code) || [],
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      })),
    });

    stats.organizations.success = result.importedCount;
    console.log(`✅ ${result.importedCount} organisations importées`);
  } catch (error) {
    console.error('❌ Erreur import organisations:', error);
    stats.organizations.failed = organizations.length;
  }
}

async function importServices() {
  console.log('\n🛎️ Import des services...');
  const services = await loadJsonFile('services.json');
  initStat('services', services.length);

  try {
    const result = await convex.mutation(api.functions.migration.importServices, {
      services: services.map((service: any) => ({
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

    stats.services.success = result.importedCount;
    console.log(`✅ ${result.importedCount} services importés`);
  } catch (error) {
    console.error('❌ Erreur import services:', error);
    stats.services.failed = services.length;
  }
}

async function importUserCentricData() {
  console.log('\n👤 Import des données centrées utilisateur...');
  const usersData = await loadJsonFile('users-data.json');
  initStat('users-data', usersData.length);

  let totalImported = 0;
  let totalFailed = 0;

  for (const userData of usersData) {
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
              address: userData.profile.address,
              phoneNumber: userData.profile.phoneNumber,
              email: userData.profile.email,
              profession: userData.profile.profession,
              employer: userData.profile.employer,
              employerAddress: userData.profile.employerAddress,
              fatherFullName: userData.profile.fatherFullName,
              motherFullName: userData.profile.motherFullName,
              spouseFullName: userData.profile.spouseFullName,
              residentContact: userData.profile.residentContact,
              homeLandContact: userData.profile.homeLandContact,
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

      console.log(
        `   ✅ Utilisateur importé avec ${result.recordsImported} enregistrements liés`,
      );
      totalImported++;
    } catch (error) {
      console.error(`   ❌ Erreur import utilisateur ${userData.id}:`, error);
      totalFailed++;
    }
  }

  stats['users-data'].success = totalImported;
  stats['users-data'].failed = totalFailed;

  console.log(
    `\n✅ ${totalImported}/${usersData.length} utilisateurs importés avec leurs données`,
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

    await importCountries();
    await importOrganizations();
    await importServices();
    await importUserCentricData();

    await printStats();

    console.log('\n✅ Import terminé !');
  } catch (error) {
    console.error("\n❌ Erreur lors de l'import :", error);
    process.exit(1);
  }
}

main();

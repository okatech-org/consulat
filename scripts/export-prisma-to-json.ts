import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient({
  datasourceUrl:
    'postgresql://neondb_owner:npg_iZ2rXwYGM1xh@ep-cool-frog-a94qnh7f.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
});

const userEmail: string | undefined = undefined;
const userLimit: number | undefined = undefined;

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

const exportCountryInclude: Prisma.CountrySelect = {
  id: true,
  name: true,
  code: true,
  status: true,
  flag: true,
};

export type CountryExport = Prisma.CountryGetPayload<{
  select: typeof exportCountryInclude;
}>;

async function exportCountries() {
  console.log('\n🌍 Export des pays...');
  const countries = await prisma.country.findMany({
    select: exportCountryInclude,
    orderBy: { code: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'countries.json');
  await fs.writeFile(filePath, JSON.stringify(countries, null, 2));

  console.log(`✅ ${countries.length} pays exportés → ${filePath}`);
  return { entity: 'countries', count: countries.length, file: filePath };
}

const exportOrganizationInclude: Prisma.OrganizationSelect = {
  id: true,
  name: true,
  logo: true,
  type: true,
  status: true,
  countries: true,
  services: true,
  adminUser: true,
  createdAt: true,
  updatedAt: true,
  metadata: true,
  appointmentSettings: true,
  agents: {
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      phoneNumber: true,
      roles: true,
    },
  },
  serviceRequests: true,
  documentTemplates: true,
};

export type OrganizationExport = Prisma.OrganizationGetPayload<{
  select: typeof exportOrganizationInclude;
}>;

async function exportOrganizations() {
  console.log('\n🏢 Export des organisations...');
  const organizations = await prisma.organization.findMany({
    select: exportOrganizationInclude,
    orderBy: { createdAt: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'organizations.json');
  await fs.writeFile(filePath, JSON.stringify(organizations, null, 2));

  console.log(`✅ ${organizations.length} organisations exportées → ${filePath}`);
  return { entity: 'organizations', count: organizations.length, file: filePath };
}

const exportServiceInclude: Prisma.ConsularServiceSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  isActive: true,
  profileDocuments: true,
  requiredDocuments: true,
  optionalDocuments: true,
  toGenerateDocuments: true,
  requiresAppointment: true,
  appointmentDuration: true,
  appointmentInstructions: true,
  deliveryAppointment: true,
  deliveryAppointmentDuration: true,
  deliveryAppointmentDesc: true,
  generateDocumentSettings: true,
  steps: true,
  isFree: true,
  price: true,
  currency: true,
  organizationId: true,
  requests: {
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      serviceId: true,
      submittedById: true,
      requestedForId: true,
      organizationId: true,
      countryCode: true,
    },
  },
  processingMode: true,
  deliveryMode: true,
  proxyRequirements: true,
  postalRequirements: true,
  metadata: true,
  assignedTo: {
    select: {
      id: true,
      clerkId: true,
      name: true,
      phoneNumber: true,
      roles: true,
      email: true,
    },
  },
  feedbacks: true,
};

export type ServiceExport = Prisma.ConsularServiceGetPayload<{
  select: typeof exportServiceInclude;
}>;

async function exportServices() {
  console.log('\n🛎️ Export des services...');
  const services = await prisma.consularService.findMany({
    select: exportServiceInclude,
    orderBy: { createdAt: 'asc' },
  });

  const filePath = path.join(EXPORT_DIR, 'services.json');
  await fs.writeFile(filePath, JSON.stringify(services, null, 2));

  console.log(`✅ ${services.length} services exportés → ${filePath}`);
  return { entity: 'services', count: services.length, file: filePath };
}

const exportNonUsersAccountsInclude: Prisma.UserSelect = {
  id: true,
  clerkId: true,
  name: true,
  roles: true,
  email: true,
  phoneNumber: true,
  linkedCountries: true,
  organizationId: true,
  notifications: true,
  assignedOrganizationId: true,
  managedByUserId: true,
  maxActiveRequests: true,
  availability: true,
  completedRequests: true,
  averageProcessingTime: true,
  managedAgents: {
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      phoneNumber: true,
    },
  },
};

export type NonUsersAccountsExport = Prisma.UserGetPayload<{
  select: typeof exportNonUsersAccountsInclude;
}>;

async function exportNonUsersAccounts() {
  console.log('\n👤 Export des comptes non utilisateurs...');
  const nonUsers = await prisma.user.findMany({
    select: exportNonUsersAccountsInclude,
    where: {
      roles: {
        hasSome: [
          'ADMIN',
          'SUPER_ADMIN',
          'MANAGER',
          'AGENT',
          'INTEL_AGENT',
          'EDUCATION_AGENT',
        ],
      },
    },
  });

  const filePath = path.join(EXPORT_DIR, 'non-users-accounts.json');
  await fs.writeFile(filePath, JSON.stringify(nonUsers, null, 2));

  console.log(`✅ ${nonUsers.length} comptes non utilisateurs exportés → ${filePath}`);
  return { entity: 'non-users-accounts', count: nonUsers.length, file: filePath };
}

const exportUserCentricDataInclude: Prisma.UserSelect = {
  id: true,
  clerkId: true,
  name: true,
  roles: true,
  email: true,
  phoneNumber: true,
  profile: {
    select: {
      id: true,
      userId: true,
      status: true,
      category: true,
      validationRequestId: true,
      firstName: true,
      lastName: true,
      gender: true,
      birthDate: true,
      birthPlace: true,
      birthCountry: true,
      nationality: true,
      maritalStatus: true,
      workStatus: true,
      acquisitionMode: true,
      passportNumber: true,
      passportIssueDate: true,
      passportExpiryDate: true,
      passportIssueAuthority: true,
      identityPicture: true,
      passport: true,
      birthCertificate: true,
      residencePermit: true,
      addressProof: true,
      address: {
        select: {
          id: true,
          firstLine: true,
          city: true,
          zipCode: true,
          country: true,
        },
      },
      phoneNumber: true,
      email: true,
      residentContact: {
        include: {
          address: true,
        },
      },
      homeLandContact: true,
      activityInGabon: true,
      fatherFullName: true,
      motherFullName: true,
      spouseFullName: true,
      profession: true,
      employer: true,
      employerAddress: true,
      cardNumber: true,
      cardIssuedAt: true,
      cardExpiresAt: true,
      cardPin: true,
      validationNotes: true,
      validatedAt: true,
      validatedBy: true,
      submittedAt: true,
      assignedOrganizationId: true,
      residenceCountyCode: true,
    },
  },
  countryCode: true,
  notifications: true,
  submittedRequests: {
    include: {
      notes: true,
      actions: true,
    },
  },
  documents: true,
  appointmentsToAttend: {
    include: {
      service: true,
      attendee: true,
      location: true,
    },
  },
  feedbacks: true,
  childAuthorities: true,
};

export type UserCentricDataExport = Prisma.UserGetPayload<{
  select: typeof exportUserCentricDataInclude;
}>;

async function exportUserCentricData() {
  console.log('\n👤 Export des données centrées utilisateur...');

  const users = await prisma.user.findMany({
    select: exportUserCentricDataInclude,
    where: {
      ...(userEmail && { email: { equals: userEmail } }),
      roles: {
        hasSome: ['USER'],
      },
    },
    orderBy: { createdAt: 'asc' },
    ...(userLimit && { take: userLimit }),
  });

  const filePath = path.join(EXPORT_DIR, 'users-data.json');
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));

  console.log(`✅ ${users.length} utilisateurs avec données exportés → ${filePath}`);

  return { entity: 'users-data', count: users.length, file: filePath };
}

const exportParentalAuthorityInclude: Prisma.ParentalAuthoritySelect = {
  id: true,
  profile: {
    select: {
      id: true,
      userId: true,
      status: true,
      category: true,
      validationRequestId: true,
      firstName: true,
      lastName: true,
      gender: true,
      birthDate: true,
      birthPlace: true,
      birthCountry: true,
      nationality: true,
      maritalStatus: true,
      workStatus: true,
      acquisitionMode: true,
      passportNumber: true,
      passportIssueDate: true,
      passportExpiryDate: true,
      passportIssueAuthority: true,
      identityPicture: true,
      passport: true,
      birthCertificate: true,
      residencePermit: true,
      addressProof: true,
      address: {
        select: {
          id: true,
          firstLine: true,
          city: true,
          zipCode: true,
          country: true,
        },
      },
      phoneNumber: true,
      email: true,
      residentContact: {
        include: {
          address: true,
        },
      },
      homeLandContact: true,
      activityInGabon: true,
      fatherFullName: true,
      motherFullName: true,
      spouseFullName: true,
      profession: true,
      employer: true,
      employerAddress: true,
      cardNumber: true,
      cardIssuedAt: true,
      cardExpiresAt: true,
      cardPin: true,
      validationNotes: true,
      validatedAt: true,
      validatedBy: true,
      submittedAt: true,
      assignedOrganizationId: true,
      residenceCountyCode: true,
    },
  },
  parentUserId: true,
  parentUser: true,
  role: true,
  isActive: true,
};

export type ParentalAuthorityExport = Prisma.ParentalAuthorityGetPayload<{
  select: typeof exportParentalAuthorityInclude;
}>;

export type RequestExport = Prisma.ServiceRequestGetPayload<{
  include: {
    notes: true;
    actions: true;
  };
}>;

async function exportUserParentalAuthorities() {
  console.log('\n👤 Export des autorités parentales...');
  const parentalAuthorities = await prisma.parentalAuthority.findMany({
    select: exportParentalAuthorityInclude,
    orderBy: { createdAt: 'asc' },
    where: {
      ...(userEmail && { parentUser: { email: { equals: userEmail } } }),
    },
  });

  const requetsToInclude = parentalAuthorities.map(
    (pa) => pa.profile.validationRequestId,
  );

  const requests = await Promise.all(
    requetsToInclude
      .filter((r) => r !== null)
      .map(async (r) => {
        return await prisma.serviceRequest.findUnique({
          where: { id: r },
        });
      }),
  );

  const filePath = path.join(EXPORT_DIR, 'parental-authorities.json');
  await fs.writeFile(
    filePath,
    JSON.stringify(
      {
        parentalAuthorities,
        requests,
      },
      null,
      2,
    ),
  );

  console.log(
    `✅ ${parentalAuthorities.length} autorités parentales exportées → ${filePath}`,
  );
  return {
    entity: 'parental-authorities',
    count: parentalAuthorities.length,
    file: filePath,
  };
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
        entity: 'parental-authorities',
        file: 'parental-authorities.json',
        description: 'Import des autorités parentales',
        dependencies: ['users-data'],
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

async function generateMigrationTracking() {
  console.log('\n📝 Génération du fichier de tracking des IDs migrés...');

  const tracking = {
    lastUpdate: null,
    version: '1.0.0',
    entities: {
      countries: [],
      organizations: [],
      services: [],
      'non-users-accounts': [],
      'users-data': [],
      'parental-authorities': [],
    },
    stats: {
      countries: 0,
      organizations: 0,
      services: 0,
      'non-users-accounts': 0,
      'users-data': 0,
      'parental-authorities': 0,
    },
  };

  const filePath = path.join(EXPORT_DIR, 'migrated-ids.json');
  await fs.writeFile(filePath, JSON.stringify(tracking, null, 2));

  console.log(`✅ Fichier de tracking généré → ${filePath}`);
}

async function printSummary(
  stats: ExportStats[],
  metadata: {
    exportDate: string;
    totalFiles: number;
    totalRecords: number;
    files: Array<{ entity: string; count: number; file: string }>;
    version: string;
    source: string;
    target: string;
  },
) {
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
  console.log('   5️⃣  Parental-Authorities');

  console.log('\n🎯 Prochaines étapes :');
  console.log('   1. Vérifier les fichiers JSON dans ./data/exports/');
  console.log("   2. Consulter import-manifest.json pour l'ordre d'import");
  console.log('   3. Le fichier migrated-ids.json track les IDs migrés');
  console.log("   4. Lancer l'import vers Convex :");
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
    stats.push(await exportNonUsersAccounts());
    stats.push(await exportUserCentricData());
    stats.push(await exportUserParentalAuthorities());

    const metadata = await generateMetadata(stats);
    await generateImportManifest();
    await generateMigrationTracking();

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

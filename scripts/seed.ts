import {
  PrismaClient,
  UserRole,
  OrganizationType,
  ServiceCategory,
  DocumentType,
  OrganizationStatus,
  FamilyLink,
  DocumentStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // Nettoyer la base de données
    await prisma.timeSlot.deleteMany();
    await prisma.address.deleteMany();
    await prisma.consulateSchedule.deleteMany();
    await prisma.emergencyContact.deleteMany();
    await prisma.phone.deleteMany();
    await prisma.addressGabon.deleteMany();
    await prisma.consularService.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.country.deleteMany();
    await prisma.user.deleteMany();

    // Créer les pays
    console.log('Creating countries...');
    const countries = await Promise.all([
      prisma.country.create({
        data: {
          name: 'France',
          code: 'FR',
          flag: 'https://flagcdn.com/fr.svg',
          status: 'ACTIVE',
          // Ajout metadata pour la France
          metadata: JSON.stringify({
            currency: {
              code: 'EUR',
              symbol: '€',
              format: '#,##0.00',
              symbolPosition: 'after',
            },
            language: { defaultLocale: 'fr', locales: ['fr', 'en', 'es'] },
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            timeZone: 'Europe/Paris',
          }),
        },
      }),
      prisma.country.create({
        data: {
          name: 'Belgique',
          code: 'BE',
          flag: 'https://flagcdn.com/be.svg',
          status: 'ACTIVE',
          // Ajout metadata pour la Belgique
          metadata: JSON.stringify({
            currency: {
              code: 'EUR',
              symbol: '€',
              format: '#,##0.00',
              symbolPosition: 'after',
            },
            language: { defaultLocale: 'fr', locales: ['fr', 'en', 'nl'] },
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            timeZone: 'Europe/Brussels',
          }),
        },
      }),
      prisma.country.create({
        data: {
          name: 'Suisse',
          code: 'CH',
          flag: 'https://flagcdn.com/ch.svg',
          status: 'ACTIVE',
          // Ajout metadata pour la Suisse (exemple)
          metadata: JSON.stringify({
            currency: {
              code: 'CHF',
              symbol: 'CHF',
              format: '#,##0.00',
              symbolPosition: 'before',
            },
            language: { defaultLocale: 'fr', locales: ['fr', 'de', 'it', 'rm'] },
            dateFormat: 'DD.MM.YYYY',
            timeFormat: '24h',
            timeZone: 'Europe/Zurich',
          }),
        },
      }),
      prisma.country.create({
        data: {
          name: 'Canada',
          code: 'CA',
          flag: 'https://flagcdn.com/ca.svg',
          status: 'ACTIVE',
          // Ajout metadata pour le Canada (exemple)
          metadata: JSON.stringify({
            currency: {
              code: 'CAD',
              symbol: '$',
              format: '#,##0.00',
              symbolPosition: 'before',
            },
            language: { defaultLocale: 'en', locales: ['en', 'fr'] },
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '12h',
            timeZone: 'America/Toronto',
          }),
        },
      }),
      prisma.country.create({
        data: {
          name: 'États-Unis',
          code: 'US',
          flag: 'https://flagcdn.com/us.svg',
          status: 'ACTIVE',
          // Ajout metadata pour les États-Unis (exemple)
          metadata: JSON.stringify({
            currency: {
              code: 'USD',
              symbol: '$',
              format: '#,##0.00',
              symbolPosition: 'before',
            },
            language: { defaultLocale: 'en', locales: ['en', 'es'] },
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            timeZone: 'America/New_York',
          }),
        },
      }),
    ]);

    // Créer les organisations
    console.log('Creating organizations...');
    const organizations = await Promise.all([
      prisma.organization.create({
        data: {
          name: 'Ambassade du Gabon en France',
          type: OrganizationType.EMBASSY,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ id: countries[0].id }] },
          metadata: JSON.stringify({
            FR: {
              settings: {
                logo: 'https://example.com/logo-france.png',
                contact: {
                  address: {
                    firstLine: '26 Rue de la Faisanderie',
                    city: 'Paris',
                    zipCode: '75116',
                    country: 'france',
                  },
                  phone: '+33145630787',
                  email: 'contact@ambagabon-fr.org',
                  website: 'https://ambagabon-fr.org',
                },
                schedule: {
                  monday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  thursday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  friday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  saturday: { isOpen: false },
                  sunday: { isOpen: false },
                },
                holidays: [
                  { date: '2024-01-01', name: "Jour de l'An" },
                  { date: '2024-04-01', name: 'Lundi de Pâques' },
                  { date: '2024-05-01', name: 'Fête du Travail' },
                  { date: '2024-05-08', name: 'Victoire 1945' },
                  { date: '2024-08-17', name: 'Fête Nationale du Gabon' },
                ],
                closures: [
                  {
                    start: '2024-08-01',
                    end: '2024-08-15',
                    reason: "Fermeture annuelle d'été",
                  },
                ],
              },
            },
          }),
        },
      }),
      prisma.organization.create({
        data: {
          name: 'Consulat Général du Gabon à Marseille',
          type: OrganizationType.GENERAL_CONSULATE,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ id: countries[0].id }] },
          metadata: JSON.stringify({
            FR: {
              settings: {
                logo: 'https://example.com/logo-marseille.png',
                contact: {
                  address: {
                    firstLine: '17 Cours Pierre Puget',
                    city: 'Marseille',
                    zipCode: '13006',
                    country: 'france',
                  },
                  phone: '+33491140290',
                  email: 'contact@consulatgabon-marseille.org',
                  website: 'https://consulatgabon-marseille.org',
                },
                schedule: {
                  monday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  thursday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  friday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  saturday: { isOpen: false },
                  sunday: { isOpen: false },
                },
                holidays: [
                  { date: '2024-01-01', name: "Jour de l'An" },
                  { date: '2024-04-01', name: 'Lundi de Pâques' },
                  { date: '2024-05-01', name: 'Fête du Travail' },
                  { date: '2024-05-08', name: 'Victoire 1945' },
                  { date: '2024-08-17', name: 'Fête Nationale du Gabon' },
                ],
                closures: [
                  {
                    start: '2024-08-01',
                    end: '2024-08-15',
                    reason: "Fermeture annuelle d'été",
                  },
                ],
              },
            },
          }),
        },
      }),
      prisma.organization.create({
        data: {
          name: 'Consulat du Gabon en Belgique',
          type: OrganizationType.CONSULATE,
          status: OrganizationStatus.INACTIVE,
          countries: { connect: [{ id: countries[1].id }] },
          metadata: JSON.stringify({
            BE: {
              settings: {
                logo: 'https://example.com/logo-belgique.png',
                contact: {
                  address: {
                    firstLine: 'Avenue Franklin Roosevelt 196',
                    city: 'Bruxelles',
                    zipCode: '1050',
                    country: 'belgique',
                  },
                  phone: '+3226405000',
                  email: 'contact@consulatgabon-be.org',
                  website: 'https://consulatgabon-be.org',
                },
                schedule: {
                  monday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  thursday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  friday: { open: '09:00', close: '15:30', isOpen: true },
                  saturday: { isOpen: false },
                  sunday: { isOpen: false },
                },
                holidays: [
                  { date: '2024-01-01', name: "Jour de l'An" },
                  { date: '2024-04-01', name: 'Lundi de Pâques' },
                  { date: '2024-05-01', name: 'Fête du Travail' },
                  { date: '2024-07-21', name: 'Fête Nationale Belge' },
                  { date: '2024-08-17', name: 'Fête Nationale du Gabon' },
                ],
                closures: [
                  {
                    start: '2024-07-22',
                    end: '2024-08-15',
                    reason: "Fermeture annuelle d'été",
                  },
                ],
              },
            },
          }),
        },
      }),
    ]);

    console.log('Creating consular services...');
    await Promise.all([
      // Service 1: Demande de passeport
      prisma.consularService.create({
        data: {
          name: 'Demande de passeport',
          description:
            'Service de demande et de renouvellement de passeport pour les ressortissants gabonais',
          category: ServiceCategory.IDENTITY,
          isActive: true,
          requiredDocuments: [
            DocumentType.IDENTITY_PHOTO,
            DocumentType.BIRTH_CERTIFICATE,
            DocumentType.PROOF_OF_ADDRESS,
            DocumentType.NATIONALITY_CERTIFICATE,
          ],
          optionalDocuments: [DocumentType.RESIDENCE_PERMIT],
          requiresAppointment: true,
          appointmentDuration: 30,
          price: 50000,
          currency: 'EUR',
          organization: { connect: { id: organizations[0].id } },
          Country: { connect: { id: countries[0].id } },
        },
      }),

      // Service 2: Inscription consulaire
      prisma.consularService.create({
        data: {
          name: 'Inscription consulaire',
          description:
            "Enregistrement auprès du consulat pour les Gabonais résidant à l'étranger",
          category: ServiceCategory.REGISTRATION,
          isActive: true,
          requiredDocuments: [
            DocumentType.PASSPORT,
            DocumentType.PROOF_OF_ADDRESS,
            DocumentType.RESIDENCE_PERMIT,
          ],
          requiresAppointment: false,
          price: 0,
          organization: { connect: { id: organizations[1].id } },
          Country: { connect: { id: countries[0].id } },
        },
      }),

      // Service 3: Transcription d'acte de naissance
      prisma.consularService.create({
        data: {
          name: "Transcription d'acte de naissance",
          description:
            "Transcription d'un acte de naissance étranger dans les registres consulaires",
          category: ServiceCategory.CIVIL_STATUS,
          organization: { connect: { id: organizations[2].id } },
          isActive: true,
          requiredDocuments: [
            DocumentType.BIRTH_CERTIFICATE,
            DocumentType.PASSPORT,
            DocumentType.PROOF_OF_ADDRESS,
          ],
          optionalDocuments: [DocumentType.MARRIAGE_CERTIFICATE],
          requiresAppointment: true,
          appointmentDuration: 45,
          price: 25000,
          currency: 'EUR',
          Country: { connect: { id: countries[1].id } },
        },
      }),

      // Service 4: Légalisation de documents
      prisma.consularService.create({
        data: {
          name: 'Légalisation de documents',
          description:
            "Service de légalisation et d'authentification de documents officiels",
          category: ServiceCategory.CERTIFICATION,
          organization: { connect: { id: organizations[0].id } },
          isActive: true,
          requiredDocuments: [DocumentType.IDENTITY_CARD, DocumentType.PROOF_OF_ADDRESS],
          requiresAppointment: false,
          price: 15000,
          currency: 'EUR',
          Country: { connect: { id: countries[1].id } },
        },
      }),
    ]);

    // Créer les utilisateurs
    console.log('Creating users...');

    // Super Admins
    const superAdmins = await Promise.all([
      prisma.user.create({
        data: {
          email: 'itoutouberny+sa@gmail.com',
          name: 'Super Admin 1',
          role: UserRole.SUPER_ADMIN,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
        },
      }),
      prisma.user.create({
        data: {
          email: 'iasted+sa@me.com',
          name: 'Super Admin 2',
          role: UserRole.SUPER_ADMIN,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
        },
      }),
    ]);

    // Managers
    const managers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'itoutouberny+ad@gmail.com',
          name: 'Berny Itoutou',
          role: UserRole.ADMIN,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
          managedOrganizations: { connect: { id: organizations[0].id } },
        },
      }),
      prisma.user.create({
        data: {
          email: 'itoutouberny+ma@gmail.com',
          name: 'Berny Itoutou',
          role: UserRole.MANAGER,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
          managedOrganizations: { connect: { id: organizations[0].id } },
        },
      }),
      prisma.user.create({
        data: {
          email: 'iasted+ma@me.com',
          name: 'Asted Manager',
          role: UserRole.MANAGER,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
          managedOrganizations: { connect: { id: organizations[1].id } },
        },
      }),
      prisma.user.create({
        data: {
          email: 'iasted+sma@me.com',
          name: 'Asted Manager 2',
          role: UserRole.MANAGER,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
          managedOrganizations: { connect: { id: organizations[2].id } },
        },
      }),
    ]);

    // Utilisateurs normaux
    const users = await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-1',
          email: 'itoutouberny+us@gmail.com',
          firstName: 'Berny',
          lastName: 'Itoutou',
          role: UserRole.USER,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
          profile: {
            create: {
              email: 'itoutouberny+us@gmail.com',
              fatherFullName: 'Jean Itoutou',
              motherFullName: 'Marie Itoutou',
              firstName: 'Berny',
              lastName: 'Itoutou',
              gender: 'MALE',
              birthDate: '1990-01-01',
              birthPlace: 'Paris',
              birthCountry: 'france',
              nationality: 'gabon',
              passportNumber: 'GA123456',
              passportIssueDate: new Date('2020-01-01'),
              passportExpiryDate: new Date('2030-01-01'),
              passportIssueAuthority: 'Ambassade du Gabon',
              status: 'PENDING',
              address: {
                create: {
                  firstLine: '123 Rue de la Paix',
                  secondLine: 'Appartement 4B',
                  city: 'Paris',
                  zipCode: '75008',
                  country: 'France',
                },
              },
              phone: {
                create: {
                  number: '0612345678',
                  countryCode: '+33',
                },
              },
              emergencyContact: {
                create: {
                  fullName: 'Jane Doe',
                  relationship: FamilyLink.FATHER,
                  phone: {
                    create: {
                      number: '0698765432',
                      countryCode: '+33',
                    },
                  },
                },
              },
              activityInGabon: 'Consultant en marketing à Libreville (2015-2018)',
              addressInGabon: {
                create: {
                  address: "Avenue de l'Indépendance",
                  district: 'Akanda',
                  city: 'Libreville',
                },
              },
              profession: 'Consultant en Marketing',
              employer: 'Presteo',
              employerAddress: 'Paris',
              passport: {
                create: {
                  type: DocumentType.PASSPORT,
                  fileUrl:
                    'https://utfs.io/f/64944b0c-4641-4b76-a2c9-0c9e56ffb29f-65424kbk.pdf',
                  status: DocumentStatus.PENDING,
                },
              },
              identityPicture: {
                create: {
                  type: DocumentType.IDENTITY_PHOTO,
                  fileUrl:
                    'https://utfs.io/f/64944b0c-4641-4b76-a2c9-0c9e56ffb29f-65424kbk.pdf',
                  status: DocumentStatus.PENDING,
                },
              },
              birthCertificate: {
                create: {
                  type: DocumentType.BIRTH_CERTIFICATE,
                  fileUrl:
                    'https://utfs.io/f/64944b0c-4641-4b76-a2c9-0c9e56ffb29f-65424kbk.pdf',
                  status: DocumentStatus.PENDING,
                },
              },
              addressProof: {
                create: {
                  type: DocumentType.PROOF_OF_ADDRESS,
                  fileUrl:
                    'https://utfs.io/f/64944b0c-4641-4b76-a2c9-0c9e56ffb29f-65424kbk.pdf',
                  status: DocumentStatus.PENDING,
                },
              },
              residencePermit: {
                create: {
                  type: DocumentType.RESIDENCE_PERMIT,
                  fileUrl:
                    'https://utfs.io/f/64944b0c-4641-4b76-a2c9-0c9e56ffb29f-65424kbk.pdf',
                  status: DocumentStatus.PENDING,
                },
              },
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          email: 'iasted+us@me.com',
          firstName: 'Asted',
          lastName: 'I',
          role: UserRole.USER,
          emailVerified: new Date(),
          country: { connect: { id: countries[0].id } },
          profile: {
            create: {
              firstName: 'Asted',
              lastName: 'I',
              gender: 'FEMALE',
              birthDate: '1992-05-15',
              birthPlace: 'Lyon',
              birthCountry: 'france',
              nationality: 'gabon',
              passportNumber: 'GA789012',
              passportIssueDate: new Date('2021-01-01'),
              passportExpiryDate: new Date('2031-01-01'),
              passportIssueAuthority: 'Ambassade du Gabon',
              status: 'PENDING',
            },
          },
        },
      }),
    ]);

    console.log('✅ Seed completed successfully!');
    console.log({
      countriesCount: countries.length,
      organizationsCount: organizations.length,
      servicesPerOrg: 2,
      users: {
        superAdmins: superAdmins.map((admin) => admin.email),
        managers: managers.map((manager) => manager.email),
        users: users.map((user) => user.email),
      },
    });
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import {
  PrismaClient,
  UserRole,
  OrganizationType,
  ServiceCategory,
  DocumentType,
  OrganizationStatus,
  DocumentStatus,
  AppointmentType,
  AppointmentStatus,
  ProcessingMode,
  DeliveryMode,
  ServicePriority,
  RequestStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // Nettoyer la base de données dans le bon ordre
    await prisma.notification.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.note.deleteMany();
    await prisma.message.deleteMany();
    await prisma.userDocument.deleteMany();
    await prisma.requestAction.deleteMany();
    await prisma.serviceRequest.deleteMany();
    await prisma.consularService.deleteMany();
    await prisma.emergencyContact.deleteMany();
    await prisma.phone.deleteMany();
    await prisma.addressGabon.deleteMany();
    await prisma.address.deleteMany();
    await prisma.profileNote.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.country.deleteMany();

    // Créer les pays
    console.log('Creating countries...');
    await Promise.all([
      prisma.country.create({
        data: {
          id: 'country-france',
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
          id: 'country-belgique',
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
          id: 'country-canada',
          name: 'Canada',
          code: 'CA',
          flag: 'https://flagcdn.com/ca.svg',
          status: 'ACTIVE',
          metadata: JSON.stringify({
            currency: {
              code: 'CAD',
              symbol: '$',
              format: '#,##0.00',
              symbolPosition: 'before',
            },
            language: { defaultLocale: 'en', locales: ['en', 'fr'] },
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            timeZone: 'America/Toronto',
          }),
        },
      }),
      prisma.country.create({
        data: {
          id: 'country-usa',
          name: 'États-Unis',
          code: 'US',
          flag: 'https://flagcdn.com/us.svg',
          status: 'ACTIVE',
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
      prisma.country.create({
        data: {
          id: 'country-uk',
          name: 'Royaume-Uni',
          code: 'GB',
          flag: 'https://flagcdn.com/gb.svg',
          status: 'ACTIVE',
          metadata: JSON.stringify({
            currency: {
              code: 'GBP',
              symbol: '£',
              format: '#,##0.00',
              symbolPosition: 'before',
            },
            language: { defaultLocale: 'en', locales: ['en'] },
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            timeZone: 'Europe/London',
          }),
        },
      }),
    ]);

    // Créer les organisations
    console.log('Creating organizations...');
    await Promise.all([
      prisma.organization.create({
        data: {
          id: 'organization-ambassade-france',
          name: 'Ambassade du Gabon en France',
          type: OrganizationType.EMBASSY,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ code: 'FR' }] },
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
                  monday: {
                    isOpen: true,
                    slots: [
                      { start: '09:00', end: '12:00' },
                      { start: '14:00', end: '17:00' },
                    ],
                  },
                  tuesday: {
                    isOpen: true,
                    slots: [
                      { start: '09:00', end: '12:00' },
                      { start: '14:00', end: '17:00' },
                    ],
                  },
                  wednesday: {
                    isOpen: true,
                    slots: [
                      { start: '09:00', end: '12:00' },
                      { start: '14:00', end: '17:00' },
                    ],
                  },
                  thursday: {
                    isOpen: true,
                    slots: [
                      { start: '09:00', end: '12:00' },
                      { start: '14:00', end: '17:00' },
                    ],
                  },
                  friday: {
                    isOpen: true,
                    slots: [{ start: '09:00', end: '18:00' }],
                  },
                  saturday: { isOpen: false },
                  sunday: { isOpen: false },
                },
                holidays: [
                  {
                    date: '2024-01-01',
                    name: "Jour de l'an",
                  },
                ],
              },
            },
          }),
          appointmentSettings: JSON.stringify({
            quotas: {
              DOCUMENT_SUBMISSION: 10,
              DOCUMENT_COLLECTION: 15,
              INTERVIEW: 5,
              MARRIAGE_CEREMONY: 2,
              EMERGENCY: 3,
            },
          }),
        },
      }),
      prisma.organization.create({
        data: {
          id: 'organization-consulat-general-marseille',
          name: 'Consulat Général du Gabon à Marseille',
          type: OrganizationType.GENERAL_CONSULATE,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ id: 'country-france' }] },
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
                },
                holidays: [
                  {
                    date: '2024-01-01',
                    name: "Jour de l'an",
                  },
                ],
              },
            },
          }),
          appointmentSettings: JSON.stringify({
            quotas: {
              DOCUMENT_SUBMISSION: 8,
              DOCUMENT_COLLECTION: 12,
              INTERVIEW: 4,
              MARRIAGE_CEREMONY: 1,
              EMERGENCY: 2,
            },
          }),
        },
      }),
      prisma.organization.create({
        data: {
          id: 'organization-ambassade-canada',
          name: 'Ambassade du Gabon au Canada',
          type: OrganizationType.EMBASSY,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ code: 'CA' }] },
          metadata: JSON.stringify({
            FR: {
              settings: {
                logo: 'https://example.com/logo-canada.png',
                contact: {
                  address: {
                    firstLine: '4 Range Road',
                    city: 'Ottawa',
                    zipCode: 'K1N 8J5',
                    country: 'canada',
                  },
                  phone: '+16137891234',
                  email: 'contact@ambagabon-ca.org',
                  website: 'https://ambagabon-ca.org',
                },
                schedule: {
                  monday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  thursday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  friday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                },
                holidays: [
                  {
                    date: '2024-01-01',
                    name: "Jour de l'an",
                  },
                ],
              },
            },
          }),
          appointmentSettings: JSON.stringify({
            quotas: {
              DOCUMENT_SUBMISSION: 8,
              DOCUMENT_COLLECTION: 10,
              INTERVIEW: 4,
              MARRIAGE_CEREMONY: 1,
              EMERGENCY: 2,
            },
          }),
        },
      }),
      prisma.organization.create({
        data: {
          id: 'organization-ambassade-usa',
          name: 'Ambassade du Gabon aux États-Unis',
          type: OrganizationType.EMBASSY,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ code: 'US' }] },
          metadata: JSON.stringify({
            FR: {
              settings: {
                logo: 'https://example.com/logo-usa.png',
                contact: {
                  address: {
                    firstLine: '2034 20th Street NW',
                    city: 'Washington',
                    zipCode: '20009',
                    country: 'usa',
                  },
                  phone: '+12023324567',
                  email: 'contact@ambagabon-us.org',
                  website: 'https://ambagabon-us.org',
                },
                schedule: {
                  monday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  thursday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
                  friday: { isOpen: true, slots: [{ start: '09:00', end: '15:00' }] },
                },
                holidays: [
                  {
                    date: '2024-01-01',
                    name: "Jour de l'an",
                  },
                ],
              },
            },
          }),
          appointmentSettings: JSON.stringify({
            quotas: {
              DOCUMENT_SUBMISSION: 12,
              DOCUMENT_COLLECTION: 15,
              INTERVIEW: 6,
              MARRIAGE_CEREMONY: 2,
              EMERGENCY: 3,
            },
          }),
        },
      }),
      prisma.organization.create({
        data: {
          id: 'organization-consulat-new-york',
          name: 'Consulat du Gabon à New York',
          type: OrganizationType.CONSULATE,
          status: OrganizationStatus.ACTIVE,
          countries: { connect: [{ code: 'US' }] },
          metadata: JSON.stringify({
            FR: {
              settings: {
                logo: 'https://example.com/logo-ny.png',
                contact: {
                  address: {
                    firstLine: '18 East 41st Street',
                    city: 'New York',
                    zipCode: '10017',
                    country: 'usa',
                  },
                  phone: '+12127598999',
                  email: 'contact@consulatgabon-ny.org',
                  website: 'https://consulatgabon-ny.org',
                },
                schedule: {
                  monday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  thursday: { isOpen: true, slots: [{ start: '09:00', end: '16:00' }] },
                  friday: { isOpen: true, slots: [{ start: '09:00', end: '14:00' }] },
                },
                holidays: [
                  {
                    date: '2024-01-01',
                    name: "Jour de l'an",
                  },
                ],
              },
            },
          }),
          appointmentSettings: JSON.stringify({
            quotas: {
              DOCUMENT_SUBMISSION: 10,
              DOCUMENT_COLLECTION: 12,
              INTERVIEW: 5,
              MARRIAGE_CEREMONY: 1,
              EMERGENCY: 2,
            },
          }),
        },
      }),
    ]);

    // Créer les utilisateurs
    console.log('Creating users...');

    // Super Admins
    await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-super-admin-1',
          email: 'itoutouberny+sa@gmail.com',
          firstName: 'Super',
          lastName: 'Admin',
          roles: [UserRole.SUPER_ADMIN],
          emailVerified: new Date(),
          country: { connect: { code: 'FR' } },
        },
      }),
    ]);

    // Admins et Managers
    await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-admin-1',
          email: 'itoutouberny+ad@gmail.com',
          firstName: 'Admin',
          lastName: '1',
          roles: [UserRole.ADMIN],
          emailVerified: new Date(),
          country: { connect: { code: 'FR' } },
          managedOrganization: { connect: { id: 'organization-ambassade-france' } },
        },
      }),
    ]);

    // Agents
    console.log('Creating agents...');
    await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-agent-1',
          email: 'agent1@consulat.ga',
          firstName: 'Agent',
          lastName: '1',
          roles: [UserRole.AGENT],
          emailVerified: new Date(),
          country: { connect: { code: 'FR' } },
          assignedOrganization: { connect: { id: 'organization-ambassade-france' } },
          specializations: [
            ServiceCategory.IDENTITY,
            ServiceCategory.CIVIL_STATUS,
            ServiceCategory.REGISTRATION,
            ServiceCategory.CERTIFICATION,
            ServiceCategory.OTHER,
            ServiceCategory.VISA,
          ],
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-agent-2',
          email: 'agent2@consulat.ga',
          firstName: 'Agent',
          lastName: '2',
          roles: [UserRole.AGENT],
          emailVerified: new Date(),
          country: { connect: { code: 'FR' } },
          assignedOrganization: {
            connect: { id: 'organization-consulat-general-marseille' },
          },
          specializations: [
            ServiceCategory.IDENTITY,
            ServiceCategory.CIVIL_STATUS,
            ServiceCategory.REGISTRATION,
            ServiceCategory.CERTIFICATION,
            ServiceCategory.OTHER,
            ServiceCategory.VISA,
          ],
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-agent-3',
          email: 'agent3@consulat.ga',
          firstName: 'Agent',
          lastName: '3',
          roles: [UserRole.AGENT],
          emailVerified: new Date(),
          country: { connect: { code: 'US' } },
          assignedOrganization: { connect: { id: 'organization-ambassade-usa' } },
          specializations: [
            ServiceCategory.IDENTITY,
            ServiceCategory.CIVIL_STATUS,
            ServiceCategory.VISA,
          ],
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-agent-4',
          email: 'agent4@consulat.ga',
          firstName: 'Agent',
          lastName: '4',
          roles: [UserRole.AGENT],
          emailVerified: new Date(),
          country: { connect: { code: 'US' } },
          assignedOrganization: { connect: { id: 'organization-consulat-new-york' } },
          specializations: [
            ServiceCategory.REGISTRATION,
            ServiceCategory.CERTIFICATION,
            ServiceCategory.OTHER,
          ],
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-agent-5',
          email: 'agent5@consulat.ga',
          firstName: 'Agent',
          lastName: '5',
          roles: [UserRole.AGENT],
          emailVerified: new Date(),
          country: { connect: { code: 'CA' } },
          assignedOrganization: { connect: { id: 'organization-ambassade-canada' } },
          specializations: [
            ServiceCategory.IDENTITY,
            ServiceCategory.CIVIL_STATUS,
            ServiceCategory.REGISTRATION,
            ServiceCategory.CERTIFICATION,
            ServiceCategory.VISA,
          ],
        },
      }),
    ]);

    console.log('Creating consular services...');
    await Promise.all([
      // Service 1: Demande de passeport
      prisma.consularService.create({
        data: {
          id: 'service-passport',
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
          price: 50,
          currency: 'EUR',
          organization: { connect: { id: 'organization-ambassade-france' } },
          Country: { connect: { id: 'country-france' } },
          processingMode: ProcessingMode.PRESENCE_REQUIRED,
          deliveryMode: [DeliveryMode.IN_PERSON],
        },
      }),

      // Service 2: Inscription consulaire
      prisma.consularService.create({
        data: {
          id: 'service-registration',
          name: 'Inscription consulaire',
          description:
            "Enregistrement auprès du consulat pour les Gabonais résidant à l'étranger",
          category: ServiceCategory.REGISTRATION,
          isActive: true,
          requiredDocuments: [
            DocumentType.PASSPORT,
            DocumentType.PROOF_OF_ADDRESS,
            DocumentType.RESIDENCE_PERMIT,
            DocumentType.IDENTITY_PHOTO,
            DocumentType.BIRTH_CERTIFICATE,
          ],
          requiresAppointment: true,
          appointmentDuration: 30,
          price: 0,
          organization: { connect: { id: 'organization-ambassade-france' } },
          Country: { connect: { id: 'country-france' } },
          processingMode: ProcessingMode.PRESENCE_REQUIRED,
          deliveryMode: [DeliveryMode.IN_PERSON],
        },
      }),
    ]);

    // Créer des utilisateurs normaux avec leurs profils
    console.log('Creating regular users with profiles...');
    await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-berny-itoutou',
          email: 'itoutouberny@gmail.com',
          firstName: 'Berny',
          lastName: 'Itoutou',
          roles: [UserRole.USER],
          emailVerified: new Date(),
          country: { connect: { code: 'FR' } },
          profile: {
            create: {
              firstName: 'Berny',
              lastName: 'Itoutou',
              gender: 'MALE',
              birthDate: '1990-01-01',
              birthPlace: 'Paris',
              birthCountry: 'france',
              nationality: 'gabon',
              passportNumber: 'GA123456',
              email: 'itoutouberny@gmail.com',
              passportIssueDate: new Date('2020-01-01'),
              passportExpiryDate: new Date('2030-01-01'),
              passportIssueAuthority: 'Ambassade du Gabon',
              status: 'SUBMITTED',
              maritalStatus: 'SINGLE',
              workStatus: 'EMPLOYEE',
              profession: 'Développeur',
              employer: 'Consulat.ga',
              employerAddress: '123 Rue de la Tech, 75008 Paris',
              fatherFullName: 'Jean Itoutou',
              motherFullName: 'Marie Itoutou',
              activityInGabon: 'Consultant IT',
              address: {
                create: {
                  firstLine: '123 Rue de la Paix',
                  secondLine: 'Appartement 4B',
                  city: 'Paris',
                  zipCode: '75008',
                  country: 'France',
                },
              },
              addressInGabon: {
                create: {
                  address: "42 Boulevard de l'Indépendance",
                  district: 'Batterie IV',
                  city: 'Libreville',
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
                  fullName: 'Pierre Itoutou',
                  relationship: 'FATHER',
                  phone: {
                    create: {
                      number: '0687654321',
                      countryCode: '+33',
                    },
                  },
                },
              },
              identityPicture: {
                create: {
                  type: DocumentType.IDENTITY_PHOTO,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: '/images/avatar-placeholder.png',
                  issuedAt: new Date('2024-01-01'),
                  expiresAt: new Date('2029-01-01'),
                },
              },
              passport: {
                create: {
                  type: DocumentType.PASSPORT,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: 'https://example.com/passport.pdf',
                  issuedAt: new Date('2020-01-01'),
                  expiresAt: new Date('2030-01-01'),
                },
              },
              birthCertificate: {
                create: {
                  type: DocumentType.BIRTH_CERTIFICATE,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: 'https://example.com/birth-certificate.pdf',
                  issuedAt: new Date('1990-01-01'),
                },
              },
              residencePermit: {
                create: {
                  type: DocumentType.RESIDENCE_PERMIT,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: 'https://example.com/residence-permit.pdf',
                  issuedAt: new Date('2023-01-01'),
                  expiresAt: new Date('2028-01-01'),
                },
              },
              addressProof: {
                create: {
                  type: DocumentType.PROOF_OF_ADDRESS,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: 'https://example.com/proof-of-address.pdf',
                  issuedAt: new Date('2024-01-01'),
                  expiresAt: new Date('2025-01-01'),
                },
              },
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-sarah-smith',
          email: 'sarah.smith@example.com',
          firstName: 'Sarah',
          lastName: 'Smith',
          roles: [UserRole.USER],
          emailVerified: new Date(),
          country: { connect: { code: 'US' } },
          profile: {
            create: {
              firstName: 'Sarah',
              lastName: 'Smith',
              gender: 'FEMALE',
              birthDate: '1988-05-15',
              birthPlace: 'New York',
              birthCountry: 'usa',
              nationality: 'gabon',
              passportNumber: 'GA789012',
              email: 'sarah.smith@example.com',
              passportIssueDate: new Date('2021-03-15'),
              passportExpiryDate: new Date('2031-03-15'),
              passportIssueAuthority: 'Consulat du Gabon à New York',
              status: 'SUBMITTED',
              maritalStatus: 'MARRIED',
              workStatus: 'EMPLOYEE',
              profession: 'Médecin',
              employer: 'Mount Sinai Hospital',
              employerAddress: '1468 Madison Ave, New York, NY 10029',
              fatherFullName: 'John Smith',
              motherFullName: 'Mary Smith',
              activityInGabon: 'Missions humanitaires',
              address: {
                create: {
                  firstLine: '350 5th Avenue',
                  secondLine: 'Apt 789',
                  city: 'New York',
                  zipCode: '10118',
                  country: 'États-Unis',
                },
              },
              addressInGabon: {
                create: {
                  address: '123 Boulevard Triomphal',
                  district: 'Quartier Louis',
                  city: 'Libreville',
                },
              },
              phone: {
                create: {
                  number: '2125550199',
                  countryCode: '+1',
                },
              },
              emergencyContact: {
                create: {
                  fullName: 'Michael Smith',
                  relationship: 'SPOUSE',
                  phone: {
                    create: {
                      number: '2125550198',
                      countryCode: '+1',
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-jean-dupont',
          email: 'jean.dupont@example.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          roles: [UserRole.USER],
          emailVerified: new Date(),
          country: { connect: { code: 'CA' } },
          profile: {
            create: {
              firstName: 'Jean',
              lastName: 'Dupont',
              gender: 'MALE',
              birthDate: '1995-09-20',
              birthPlace: 'Montreal',
              birthCountry: 'canada',
              nationality: 'gabon',
              passportNumber: 'GA456789',
              email: 'jean.dupont@example.com',
              passportIssueDate: new Date('2022-01-10'),
              passportExpiryDate: new Date('2032-01-10'),
              passportIssueAuthority: 'Ambassade du Gabon au Canada',
              status: 'SUBMITTED',
              maritalStatus: 'SINGLE',
              workStatus: 'STUDENT',
              profession: 'Étudiant',
              employer: 'Université de Montréal',
              employerAddress: '2900 Boulevard Edouard-Montpetit, Montréal, QC H3T 1J4',
              fatherFullName: 'Pierre Dupont',
              motherFullName: 'Marie Dupont',
              activityInGabon: "Stages d'été",
              address: {
                create: {
                  firstLine: '1234 Rue Sainte-Catherine',
                  secondLine: 'App 567',
                  city: 'Montréal',
                  zipCode: 'H3H 2R9',
                  country: 'Canada',
                },
              },
              addressInGabon: {
                create: {
                  address: "45 Boulevard de l'Indépendance",
                  district: 'Lalala',
                  city: 'Libreville',
                },
              },
              phone: {
                create: {
                  number: '5145550123',
                  countryCode: '+1',
                },
              },
              emergencyContact: {
                create: {
                  fullName: 'Pierre Dupont',
                  relationship: 'FATHER',
                  phone: {
                    create: {
                      number: '5145550124',
                      countryCode: '+1',
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Créer des rendez-vous
    console.log('Creating appointments...');
    await Promise.all([
      prisma.appointment.create({
        data: {
          id: 'appointment-berny-itoutou-1',
          countryCode: 'FR',
          date: new Date('2024-04-15'),
          startTime: new Date('2024-04-15T09:00:00Z'),
          endTime: new Date('2024-04-15T09:30:00Z'),
          duration: 30,
          type: AppointmentType.DOCUMENT_SUBMISSION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-berny-itoutou' } },
          agent: { connect: { id: 'user-agent-1' } },
          instructions: 'Veuillez apporter tous les documents originaux.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-berny-itoutou-2',
          countryCode: 'FR',
          date: new Date('2024-04-16'),
          startTime: new Date('2024-04-16T14:00:00Z'),
          endTime: new Date('2024-04-16T14:45:00Z'),
          duration: 45,
          type: AppointmentType.DOCUMENT_COLLECTION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-consulat-general-marseille' } },
          attendee: { connect: { id: 'user-berny-itoutou' } },
          agent: { connect: { id: 'user-agent-2' } },
          instructions: 'Retrait de la carte consulaire et entretien.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-sarah-smith-1',
          countryCode: 'US',
          date: new Date('2024-04-20'),
          startTime: new Date('2024-04-20T14:00:00Z'),
          endTime: new Date('2024-04-20T14:30:00Z'),
          duration: 30,
          type: AppointmentType.DOCUMENT_SUBMISSION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-consulat-new-york' } },
          attendee: { connect: { id: 'user-sarah-smith' } },
          agent: { connect: { id: 'user-agent-4' } },
          instructions: 'Please bring all original documents and their copies.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-sarah-smith-2',
          countryCode: 'US',
          date: new Date('2024-04-25'),
          startTime: new Date('2024-04-25T15:00:00Z'),
          endTime: new Date('2024-04-25T15:45:00Z'),
          duration: 45,
          type: AppointmentType.INTERVIEW,
          status: AppointmentStatus.PENDING,
          organization: { connect: { id: 'organization-consulat-new-york' } },
          attendee: { connect: { id: 'user-sarah-smith' } },
          agent: { connect: { id: 'user-agent-4' } },
          instructions: 'Interview for consular registration.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-jean-dupont-1',
          countryCode: 'CA',
          date: new Date('2024-04-22'),
          startTime: new Date('2024-04-22T13:00:00Z'),
          endTime: new Date('2024-04-22T13:30:00Z'),
          duration: 30,
          type: AppointmentType.DOCUMENT_COLLECTION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-ambassade-canada' } },
          attendee: { connect: { id: 'user-jean-dupont' } },
          agent: { connect: { id: 'user-agent-5' } },
          instructions:
            "Veuillez apporter une pièce d'identité pour récupérer vos documents.",
        },
      }),
    ]);

    // Créer des demandes de service
    console.log('Creating service requests...');
    await Promise.all([
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-berny-itoutou-1',
          status: RequestStatus.SUBMITTED,
          priority: ServicePriority.STANDARD,
          service: { connect: { id: 'service-passport' } },
          serviceCategory: 'IDENTITY',
          submittedBy: { connect: { id: 'user-berny-itoutou' } },
          organization: { connect: { id: 'organization-ambassade-france' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          appointment: { connect: { id: 'appointment-berny-itoutou-1' } },
          submittedAt: new Date(),
          requiredDocuments: {
            create: [
              {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/passport.pdf',
              },
              {
                type: DocumentType.IDENTITY_PHOTO,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/photo.jpg',
              },
            ],
          },
        },
      }),
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-berny-itoutou-2',
          status: RequestStatus.SUBMITTED,
          priority: ServicePriority.STANDARD,
          serviceCategory: 'REGISTRATION',
          service: { connect: { id: 'service-registration' } },
          submittedBy: { connect: { id: 'user-berny-itoutou' } },
          organization: { connect: { id: 'organization-ambassade-france' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          submittedAt: new Date(),
          firstPassValidation: true,
          processingTime: 0,
          requiredDocuments: {
            create: [
              {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/passport.pdf',
              },
              {
                type: DocumentType.PROOF_OF_ADDRESS,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/proof.pdf',
              },
              {
                type: DocumentType.BIRTH_CERTIFICATE,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/birth.pdf',
              },
              {
                type: DocumentType.IDENTITY_PHOTO,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/photo.jpg',
              },
            ],
          },
        },
      }),
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-sarah-smith-1',
          status: RequestStatus.SUBMITTED,
          priority: ServicePriority.URGENT,
          service: { connect: { id: 'service-passport' } },
          serviceCategory: 'IDENTITY',
          submittedBy: { connect: { id: 'user-sarah-smith' } },
          organization: { connect: { id: 'organization-consulat-new-york' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          appointment: { connect: { id: 'appointment-sarah-smith-1' } },
          submittedAt: new Date(),
          requiredDocuments: {
            create: [
              {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/sarah-passport.pdf',
              },
              {
                type: DocumentType.IDENTITY_PHOTO,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/sarah-photo.jpg',
              },
              {
                type: DocumentType.PROOF_OF_ADDRESS,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/sarah-proof.pdf',
              },
            ],
          },
        },
      }),
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-jean-dupont-1',
          status: RequestStatus.REVIEW,
          priority: ServicePriority.STANDARD,
          serviceCategory: 'REGISTRATION',
          service: { connect: { id: 'service-registration' } },
          submittedBy: { connect: { id: 'user-jean-dupont' } },
          organization: { connect: { id: 'organization-ambassade-canada' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          appointment: { connect: { id: 'appointment-jean-dupont-1' } },
          submittedAt: new Date(),
          requiredDocuments: {
            create: [
              {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.VALIDATED,
                fileUrl: 'https://example.com/jean-passport.pdf',
              },
              {
                type: DocumentType.PROOF_OF_ADDRESS,
                status: DocumentStatus.VALIDATED,
                fileUrl: 'https://example.com/jean-proof.pdf',
              },
              {
                type: DocumentType.RESIDENCE_PERMIT,
                status: DocumentStatus.PENDING,
                fileUrl: 'https://example.com/jean-permit.pdf',
              },
            ],
          },
        },
      }),
    ]);

    console.log('✅ Seed completed successfully!');
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

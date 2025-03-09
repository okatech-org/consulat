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
    await prisma.$transaction([
      prisma.notification.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.note.deleteMany(),
      prisma.message.deleteMany(),
      prisma.userDocument.deleteMany(),
      prisma.requestAction.deleteMany(),
      prisma.serviceRequest.deleteMany(),
      prisma.consularService.deleteMany(),
      prisma.emergencyContact.deleteMany(),
      prisma.phone.deleteMany(),
      prisma.address.deleteMany(),
      prisma.parentalAuthority.deleteMany(),
      prisma.profile.deleteMany(),
      prisma.user.deleteMany(),
      prisma.organization.deleteMany(),
      prisma.country.deleteMany(),
    ]);

    // Créer les pays
    console.log('Creating countries...');
    await prisma.country.createMany({
      data: [
        {
          id: 'country-france',
          name: 'France',
          code: 'FR',
          flag: 'https://flagcdn.com/fr.svg',
          status: 'ACTIVE',
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
        {
          id: 'country-belgique',
          name: 'Belgique',
          code: 'BE',
          flag: 'https://flagcdn.com/be.svg',
          status: 'INACTIVE',
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
      ],
    });

    // Créer les organisations
    console.log('Creating organizations...');
    await prisma.organization.create({
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
                  country: 'FR',
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
    });

    // Créer les utilisateurs
    console.log('Creating users...');

    // Admin et Agents
    await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-admin',
          email: 'itoutouberny+admin@gmail.com',
          roles: [UserRole.ADMIN],
          organizationId: 'organization-ambassade-france',
          countryCode: 'FR',
          specializations: [
            ServiceCategory.IDENTITY,
            ServiceCategory.REGISTRATION,
            ServiceCategory.CIVIL_STATUS,
            ServiceCategory.VISA,
          ],
          linkedCountries: { connect: [{ code: 'FR' }] },
          profile: {
            create: {
              firstName: 'Admin',
              lastName: 'France',
              birthDate: '1980-01-01',
              birthPlace: 'Paris',
              birthCountry: 'FR',
              nationality: 'FR',
              gender: 'MALE',
              residenceCountyCode: 'FR',
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-agent-france-1',
          email: 'itoutouberny+agent1@gmail.com',
          roles: [UserRole.AGENT],
          assignedOrganizationId: 'organization-ambassade-france',
          countryCode: 'FR',
          specializations: [ServiceCategory.IDENTITY, ServiceCategory.REGISTRATION],
          linkedCountries: { connect: [{ code: 'FR' }] },
          profile: {
            create: {
              firstName: 'Agent',
              lastName: 'France Un',
              birthDate: '1985-01-01',
              birthPlace: 'Paris',
              birthCountry: 'FR',
              nationality: 'FR',
              gender: 'FEMALE',
              residenceCountyCode: 'FR',
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          id: 'user-agent-france-2',
          email: 'itoutouberny+agent2@gmail.com',
          roles: [UserRole.AGENT],
          assignedOrganizationId: 'organization-ambassade-france',
          countryCode: 'FR',
          specializations: [ServiceCategory.CIVIL_STATUS, ServiceCategory.VISA],
          linkedCountries: { connect: [{ code: 'FR' }] },
          profile: {
            create: {
              firstName: 'Agent',
              lastName: 'France Deux',
              birthDate: '1990-01-01',
              birthPlace: 'Lyon',
              birthCountry: 'FR',
              nationality: 'FR',
              gender: 'MALE',
              residenceCountyCode: 'FR',
            },
          },
        },
      }),
    ]);

    // Créer les services consulaires
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

    // Créér les comptes super admin
    await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-super-admin',
          email: 'itoutouberny+sa@gmail.com',
          roles: [UserRole.SUPER_ADMIN],
          specializations: [
            ServiceCategory.IDENTITY,
            ServiceCategory.REGISTRATION,
            ServiceCategory.CIVIL_STATUS,
            ServiceCategory.VISA,
            ServiceCategory.CERTIFICATION,
            ServiceCategory.OTHER,
          ],
          linkedCountries: { connect: [{ code: 'FR' }] },
        },
      }),
    ]);

    // Créer des utilisateurs normaux avec leurs profils
    console.log('Creating regular users with profiles...');
    const [bernyUser] = await Promise.all([
      prisma.user.create({
        data: {
          id: 'user-berny-itoutou',
          email: 'itoutouberny@gmail.com',
          firstName: 'Berny',
          lastName: 'Itoutou',
          roles: [UserRole.USER],
          emailVerified: new Date(),
          countryCode: 'FR',
          profile: {
            create: {
              id: 'profile-berny-itoutou',
              firstName: 'Berny',
              lastName: 'Itoutou',
              gender: 'MALE',
              birthDate: '1990-01-01',
              birthPlace: 'Paris',
              birthCountry: 'FR',
              nationality: 'GA',
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
              cardPin: 'GA123456',
              residenceCountyCode: '75',
              address: {
                create: {
                  firstLine: '123 Rue de la Paix',
                  secondLine: 'Appartement 4B',
                  city: 'Paris',
                  zipCode: '75008',
                  country: 'FR',
                },
              },
              phone: {
                create: {
                  number: '0612345678',
                  countryCode: '+33',
                },
              },
              residentContact: {
                create: {
                  firstName: 'Pierre',
                  lastName: 'Itoutou',
                  relationship: 'FATHER',
                  phone: {
                    create: {
                      number: '0687654321',
                      countryCode: '+33',
                    },
                  },
                  address: {
                    create: {
                      firstLine: '42 Boulevard de la Liberté',
                      city: 'Paris',
                      zipCode: '75010',
                      country: 'FR',
                    },
                  },
                },
              },
              homeLandContact: {
                create: {
                  firstName: 'Marie',
                  lastName: 'Itoutou',
                  relationship: 'MOTHER',
                  phone: {
                    create: {
                      number: '074123456',
                      countryCode: '+241',
                    },
                  },
                  address: {
                    create: {
                      firstLine: "42 Boulevard de l'Indépendance",
                      city: 'Libreville',
                      zipCode: null,
                      country: 'GA',
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
          id: 'user-jane-doe',
          email: 'janedoe@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          roles: [UserRole.USER],
          emailVerified: new Date(),
          countryCode: 'FR',
          profile: {
            create: {
              id: 'profile-jane-doe',
              firstName: 'Jane',
              lastName: 'Doe',
              gender: 'FEMALE',
              birthDate: '1988-05-15',
              birthPlace: 'Paris',
              birthCountry: 'FR',
              nationality: 'GA',
              passportNumber: 'GA789012',
              email: 'janedoe@example.com',
              passportIssueDate: new Date('2021-03-15'),
              passportExpiryDate: new Date('2031-03-15'),
              passportIssueAuthority: 'Consulat du Gabon à Paris',
              status: 'SUBMITTED',
              maritalStatus: 'MARRIED',
              workStatus: 'EMPLOYEE',
              profession: 'Médecin',
              employer: 'Hôpital Saint-Louis',
              employerAddress: '1 Avenue Claude Vellefaux, 75010 Paris',
              fatherFullName: 'John Doe',
              motherFullName: 'Mary Doe',
              activityInGabon: 'Missions humanitaires',
              cardPin: 'GA789012',
              residenceCountyCode: '75',
              address: {
                create: {
                  firstLine: '45 Rue de Rivoli',
                  secondLine: 'Apt 12',
                  city: 'Paris',
                  zipCode: '75004',
                  country: 'FR',
                },
              },
              phone: {
                create: {
                  number: '0623456789',
                  countryCode: '+33',
                },
              },
              residentContact: {
                create: {
                  firstName: 'Michael',
                  lastName: 'Doe',
                  relationship: 'SPOUSE',
                  phone: {
                    create: {
                      number: '0634567890',
                      countryCode: '+33',
                    },
                  },
                  address: {
                    create: {
                      firstLine: '45 Rue de Rivoli',
                      secondLine: 'Apt 12',
                      city: 'Paris',
                      zipCode: '75004',
                      country: 'FR',
                    },
                  },
                },
              },
              homeLandContact: {
                create: {
                  firstName: 'John',
                  lastName: 'Doe',
                  relationship: 'FATHER',
                  phone: {
                    create: {
                      number: '074987654',
                      countryCode: '+241',
                    },
                  },
                  address: {
                    create: {
                      firstLine: '123 Boulevard Triomphal',
                      city: 'Libreville',
                      zipCode: null,
                      country: 'GA',
                    },
                  },
                },
              },
              identityPicture: {
                create: {
                  type: DocumentType.IDENTITY_PHOTO,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: '/images/avatar-placeholder.png',
                  issuedAt: new Date('2023-05-15'),
                  expiresAt: new Date('2028-05-15'),
                },
              },
              passport: {
                create: {
                  type: DocumentType.PASSPORT,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: 'https://example.com/jane-passport.pdf',
                  issuedAt: new Date('2021-03-15'),
                  expiresAt: new Date('2031-03-15'),
                },
              },
              birthCertificate: {
                create: {
                  type: DocumentType.BIRTH_CERTIFICATE,
                  status: DocumentStatus.VALIDATED,
                  fileUrl: 'https://example.com/jane-birth-certificate.pdf',
                  issuedAt: new Date('1988-05-15'),
                },
              },
            },
          },
        },
      }),
    ]);

    // Créer le profil de l'enfant
    console.log('Creating child profile...');
    const childProfile = await prisma.profile.create({
      data: {
        id: 'profile-berny-child',
        firstName: 'Emma',
        lastName: 'Itoutou',
        gender: 'FEMALE',
        birthDate: '2020-05-15',
        birthPlace: 'Paris',
        birthCountry: 'FR',
        nationality: 'GA',
        category: 'MINOR',
        status: 'DRAFT',
        residenceCountyCode: '75',
        identityPicture: {
          create: {
            type: DocumentType.IDENTITY_PHOTO,
            status: DocumentStatus.VALIDATED,
            fileUrl: '/images/avatar-placeholder.png',
            issuedAt: new Date('2024-01-01'),
            expiresAt: new Date('2029-01-01'),
          },
        },
        birthCertificate: {
          create: {
            type: DocumentType.BIRTH_CERTIFICATE,
            status: DocumentStatus.VALIDATED,
            fileUrl: 'https://example.com/emma-birth-certificate.pdf',
            issuedAt: new Date('2020-05-15'),
            expiresAt: new Date('2030-05-15'),
          },
        },
        address: {
          create: {
            firstLine: '123 Rue de la Paix',
            secondLine: 'Appartement 4B',
            city: 'Paris',
            zipCode: '75008',
            country: 'FR',
          },
        },
      },
    });

    // Créer l'autorité parentale
    console.log('Creating parental authority...');
    await prisma.parentalAuthority.create({
      data: {
        role: 'FATHER',
        isActive: true,
        profile: {
          connect: {
            id: childProfile.id,
          },
        },
        parentUser: {
          connect: {
            id: bernyUser.id,
          },
        },
      },
    });

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
          agent: { connect: { id: 'user-agent-france-1' } },
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
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-berny-itoutou' } },
          agent: { connect: { id: 'user-agent-france-2' } },
          instructions: 'Retrait de la carte consulaire et entretien.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-jane-doe-1',
          countryCode: 'FR',
          date: new Date('2024-04-20'),
          startTime: new Date('2024-04-20T14:00:00Z'),
          endTime: new Date('2024-04-20T14:30:00Z'),
          duration: 30,
          type: AppointmentType.DOCUMENT_SUBMISSION,
          status: AppointmentStatus.CONFIRMED,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-jane-doe' } },
          agent: { connect: { id: 'user-agent-france-1' } },
          instructions: 'Please bring all original documents and their copies.',
        },
      }),
      prisma.appointment.create({
        data: {
          id: 'appointment-jane-doe-2',
          countryCode: 'FR',
          date: new Date('2024-04-25'),
          startTime: new Date('2024-04-25T15:00:00Z'),
          endTime: new Date('2024-04-25T15:45:00Z'),
          duration: 45,
          type: AppointmentType.INTERVIEW,
          status: AppointmentStatus.PENDING,
          organization: { connect: { id: 'organization-ambassade-france' } },
          attendee: { connect: { id: 'user-jane-doe' } },
          agent: { connect: { id: 'user-agent-france-1' } },
          instructions: 'Interview for consular registration.',
        },
      }),
    ]);

    // Créer des demandes de service
    console.log('Creating service requests...');
    await Promise.all([
      prisma.serviceRequest.create({
        data: {
          id: 'service-request-france-1',
          status: RequestStatus.SUBMITTED,
          priority: ServicePriority.STANDARD,
          service: { connect: { id: 'service-passport' } },
          assignedTo: { connect: { id: 'user-agent-france-1' } },
          serviceCategory: 'IDENTITY',
          submittedBy: { connect: { id: 'user-berny-itoutou' } },
          organization: { connect: { id: 'organization-ambassade-france' } },
          country: { connect: { code: 'FR' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
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
          id: 'service-request-france-2',
          status: RequestStatus.PENDING,
          priority: ServicePriority.STANDARD,
          serviceCategory: 'REGISTRATION',
          assignedTo: { connect: { id: 'user-agent-france-1' } },
          service: { connect: { id: 'service-registration' } },
          submittedBy: { connect: { id: 'user-jane-doe' } },
          organization: { connect: { id: 'organization-ambassade-france' } },
          country: { connect: { code: 'FR' } },
          chosenProcessingMode: ProcessingMode.PRESENCE_REQUIRED,
          chosenDeliveryMode: DeliveryMode.IN_PERSON,
          submittedAt: new Date(),
          firstPassValidation: true,
          requestedFor: { connect: { id: 'profile-jane-doe' } },
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
    ]);

    // Créer les notifications
    console.log('Creating notifications...');
    await prisma.notification.createMany({
      data: [
        // Notifications pour user-france-1
        {
          id: 'notification-1',
          userId: 'user-berny-itoutou',
          type: 'CONSULAR_REGISTRATION_SUBMITTED',
          title: 'Inscription consulaire soumise',
          message: "Votre demande d'inscription consulaire a été soumise avec succès.",
          createdAt: new Date('2024-03-20T10:00:00Z'),
          read: true,
        },
        {
          id: 'notification-2',
          userId: 'user-berny-itoutou',
          type: 'CONSULAR_REGISTRATION_VALIDATED',
          title: 'Dossier validé',
          message:
            "Votre dossier d'inscription consulaire a été validé. Vous pouvez accéder à votre carte consulaire virtuelle dès maintenant.",
          createdAt: new Date('2024-03-21T14:30:00Z'),
          read: false,
        },
        {
          id: 'notification-3',
          userId: 'user-jane-doe',
          type: 'CONSULAR_CARD_READY',
          title: 'Carte prête pour retrait',
          message:
            "Votre carte consulaire est prête pour le retrait. <a href='/my-space/appointments/new?serviceRequestId=service-request-france-2&type=DOCUMENT_COLLECTION'>Cliquez ici pour prendre rendez-vous</a>",
          createdAt: new Date('2024-03-22T09:15:00Z'),
          read: false,
        },
      ],
    });

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
